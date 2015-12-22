# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals
import frappe, json
from frappe import _
from frappe.utils import cstr
from frappe.model import default_fields

def get_mapped_doc(source_doc, table_maps, target_doctype, target_doc=None):

	# main

	target_doc = frappe.new_doc(target_doctype)
	for i in target_doc.meta.get_table_fields():
		pass
		
	p_table_maps = {}
	map_doc(source_doc, target_doc, p_table_maps)

	row_exists_for_parentfield = {}
	# # # children
	for df in target_doc.meta.get_table_fields():

		table_map = table_maps.get(df.fieldname)

		if table_map:
			for source_d in source_doc.get(df.fieldname):
		 		target_child_doctype = table_map["doctype"]
		 		target_parentfield = target_doc.get_parentfield_of_doctype(target_child_doctype)


				# does row exist for a parentfield?
				if target_parentfield not in row_exists_for_parentfield:
					row_exists_for_parentfield[target_parentfield] = (True
						if target_doc.get(target_parentfield) else False)

				map_child_doc(source_d, target_doc, table_map, source_doc)

	return target_doc

def map_doc(source_doc, target_doc, table_map, source_parent=None):
	map_fields(source_doc, target_doc, table_map, source_parent)


def map_fields(source_doc, target_doc, table_map, source_parent):
	no_copy_fields = set(list(["amenities","flat_facilities","property_details"]))
	#no_copy_fields = []
	for df in target_doc.meta.get("fields"):
		# print df
		if df.fieldname not in no_copy_fields:
			# map same fields
			val = source_doc.get(df.fieldname)
			if val not in (None, ""):
				if isinstance(val, list):
					target_doc.set(df.fieldname, val,as_value=True)
				else:
					target_doc.set(df.fieldname, val)

	# map other fields
	field_map = table_map.get("field_map")
	if field_map:
		if isinstance(field_map, dict):
			for source_key, target_key in field_map.items():
				val = source_doc.get(source_key)
				if val not in (None, ""):
					target_doc.set(target_key, val)
		else:
			for fmap in field_map:
				val = source_doc.get(fmap[0])
				if val not in (None, ""):
					target_doc.set(fmap[1], val)

	# add fetch
	for df in target_doc.meta.get("fields", {"fieldtype": "Link"}):
		if target_doc.get(df.fieldname):
			map_fetch_fields(target_doc, df, no_copy_fields)

def map_fetch_fields(target_doc, df, no_copy_fields):
	linked_doc = None

	# options should be like "link_fieldname.fieldname_in_liked_doc"
	for fetch_df in target_doc.meta.get("fields", {"options": "^{0}.".format(df.fieldname)}):
		if not (fetch_df.fieldtype == "Read Only" or fetch_df.read_only):
			continue

		if not target_doc.get(fetch_df.fieldname) and fetch_df.fieldname not in no_copy_fields:
			source_fieldname = fetch_df.options.split(".")[1]

			if not linked_doc:
				try:
					linked_doc = frappe.get_doc(df.options, target_doc.get(df.fieldname))
				except:
					return

			val = linked_doc.get(source_fieldname)

			if val not in (None, ""):
				target_doc.set(fetch_df.fieldname, val)

def map_child_doc(source_d, target_parent, table_map, source_parent=None):
	target_child_doctype = table_map["doctype"]
	target_parentfield = target_parent.get_parentfield_of_doctype(target_child_doctype)
	target_d = frappe.new_doc(target_child_doctype, target_parent, target_parentfield)

	map_doc(source_d, target_d, table_map, source_parent)

	target_d.idx = None
	target_parent.append(target_parentfield, target_d)
	return target_d
