# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import propshikari.propshikari.propshikari_api as api
import propshikari.propshikari.property_update_api as update_api
from hunters_camp.hunters_camp.mapper import get_mapped_doc
import json

class Property(Document):
	pass



@frappe.whitelist(allow_guest=True)
def post_property(doc,sid):
	"""
		1. Either pop up the keys that are not needed or make and mapper and map the fields
		2. Create json doc for uploading
		3. Return Response
	"""
	doc = json.loads(doc)
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["sid"] = sid
	doc["amenities"] = doc.get('amenities').split(',') if doc.get("amenities") else []
	doc["flat_facilities"] = doc.get('flat_facilities').split(',') if doc.get("flat_facilities") else []
	if doc.get("possession") == 1:
		map(lambda x: doc.pop(x,None), ['month','year'])
	elif doc.get("possession") == 0: 
		doc["possession_date"] = "-".join([doc.get("month"),doc.get("year")])

	data = json.dumps(doc)
	doc_rec = api.post_property(data)
	return doc_rec


@frappe.whitelist(allow_guest=True)
def view_property(property_id,sid):
	doc = {}
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["sid"] = sid
	doc["property_id"] = property_id
	data = json.dumps(doc)
	doc = api.get_property_of_given_id(data)
	doclist = get_mapped_doc(doc["data"],{})
	doclist.city_link = frappe.db.get_value("City",{"city_name":doclist.city},"name")
	doclist.location_link = frappe.db.get_value("Area",{"area":doclist.location},"name")
	return doclist

@frappe.whitelist(allow_guest=True)
def update_tag(doc,sid,tag):
	doc = json.loads(doc)
	data = {}
	data["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	data["sid"] = sid
	data["tags"] = [tag]
	data["property_id"] = doc["property_id"]
	data["fields"] = ["tag"]
	data = json.dumps(data)
	doc_rec = update_api.update_tags_of_property(data)
	tags = update_api.get_property_details(data)
	print tags["data"]["tag"]	
	tag = ",".join(tags["data"]["tag"]) if tags else []
	return doc_rec,tag

@frappe.whitelist(allow_guest=True)
def update_status(doc,sid,status):
	doc = json.loads(doc)
	data = {}
	data["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	data["sid"] = sid
	data["property_status"] = status
	data["property_id"] = doc["property_id"]
	data["fields"] = ["status"]
	data = json.dumps(data)
	doc_rec = api.update_property_status(data)
	status = update_api.get_property_details(data)
	return doc_rec,status["data"]["status"]
