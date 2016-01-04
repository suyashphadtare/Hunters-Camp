# Copyright (c) 2013, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
import json
from  propshikari.propshikari.property_update_api import get_builder_properties
from  propshikari.propshikari.propshikari_api import get_property_of_given_id


def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_result(filters)
	return columns, data



def get_result(filters):
	user_id = frappe.db.get_value("User", filters.get("agent"), "user_id")
	res_list = []
	if user_id:
		request_data = json.dumps({"user_id":user_id, "property_id":filters.get("property_id"),"builder":filters.get("agent")})
		if not filters.get("property_id"):
			response = get_builder_properties(request_data) 
		else: 
			response = get_property_of_given_id(request_data)
			response["data"] = [response.get("data")]
		for prop in response.get("data"):
			prop_id = prop.get("property_id")
			prop_visit_count = get_property_visit_count(prop_id)
			property_id = "<a onclick=get_on_click_trigger('{0}')>{0}</a>".format(prop_id)
			res_list.append([ property_id , prop.get("property_title"), prop.get("property_type"),
							prop.get("property_subtype"), prop.get("property_subtype_option"), prop.get("location"), 
							prop.get("status"),prop_visit_count])
	return res_list

def get_property_visit_count(property_id):
	prop_count = frappe.db.sql("""select count(*) from 
		`tabShow Contact Property` where property_id='{0}'""".format(property_id),as_list=1)[0][0]
	return prop_count



def get_conditions(filters):
	cond = ''
	if filters.get("property_id"):
		cond = "where sp.property_id='{0}' ".format(filters.get("property_id"))
	return cond	




def get_columns():
	return [_("Property Id") + ":Data:200",
			_("Property Title") + ":Data:200",
			_("Property Type") + ":Data:120", 
			_("Property Subtype") + ":Data:160",
			_("Property Subtype Option") + ":Data:180",
			_("Location") + ":Data:100",
			_("Status") + ":Data:100",
			_("Visit Count") + ":Data:100",
		   ]



def get_my_properties(doctype, txt, searchfield, start, page_len, filters):
	user_id = frappe.db.get_value("User", filters.get("agent"), "user_id")
	res_list = []
	if user_id:
		request_data = json.dumps({"user_id":user_id,"builder":filters.get("agent")})
		response = get_builder_properties(request_data)
		for prop in response.get("data"):
			res_list.append([prop.get("property_id"),prop.get("property_title")])
	return res_list


def get_agent_list(doctype, txt, searchfield, start, page_len, filters):
	if frappe.db.get_value("Agent", frappe.session.user, "name"):
		return [[frappe.session.user]]
	return frappe.get_all("Agent",fields= ['name'], as_list=1)


@frappe.whitelist()
def get_builders(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql("""select usr.name, concat_ws(' ', usr.first_name, usr.middle_name, usr.last_name)
		from `tabUser` usr
		where usr.name not in ("Guest", "Administrator")
			and usr.user_type != 'Website User'
			and usr.name in (select parent from `tabUserRole` where role='Builder' and parent!='Administrator' and parent!='Guest') 
			and {0} like '{1}' """.format(searchfield,"%%%s%%" % txt))