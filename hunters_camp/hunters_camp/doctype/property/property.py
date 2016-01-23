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
	agent_flag = get_user_roles()
	doc = json.loads(doc)
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["sid"] = sid
	doc["amenities"] = [ amenity.get("amenity_name") for amenity in doc.get("amenities") if amenity.get("status") == "Yes" ]
	print doc["amenities"]
	doc["flat_facilities"] = [ facility.get("facility_name") for facility in doc.get("flat_facilities") if facility.get("status") == "Yes" ]
	validate_for_possesion_date(doc)
	doc["distance_from_imp_locations"] = {"airport" :doc.get("airport"), "central_bus_stand":doc.get("central_bus_stand"), "railway_station":doc.get("railway_station")}

	data = json.dumps(doc)
	try:
		doc_rec = api.post_property(data)
		update_agent_package() if agent_flag else ""
	except Exception,e:
		frappe.throw(e)
	return doc_rec


def validate_for_possesion_date(doc):
	if doc.get("possession") == 1 or not doc.get("possession"):
		map(lambda x: doc.pop(x,None), ['month','year'])
	elif doc.get("possession") == 0: 
		doc["possession_date"] = "-".join([doc.get("month"),doc.get("year")])


def get_user_roles():
	user_roles = frappe.get_roles(frappe.session.user)
	if "Agent" in user_roles:
		ag = frappe.db.sql(""" select * from `tabAgent Package` 
								where name = '{0}' and end_date >= CURDATE() """.format(frappe.session.user),as_dict=True)
		if not ag:
			frappe.throw("Please subscribe to Property posting package.")
		elif not ag[0].get("posting_allowed") - ag[0].get("property_posted"):
			frappe.throw("Posting Limit is Exhausted.Please renew your package subscription.")
		return True	
	return False	


def update_agent_package():
	ap = frappe.get_doc("Agent Package", frappe.session.user)
	ap.property_posted = ap.property_posted + 1
	ap.save(ignore_permissions=True)

@frappe.whitelist(allow_guest=True)
def view_property(property_id,sid):
	doc = {}
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["sid"] = sid
	doc["property_id"] = property_id
	data = json.dumps(doc)
	try:
		doc = update_api.get_property_of_given_id(data)
		doclist = get_mapped_doc(doc["data"],{
					"amenities": {
						"doctype": "Amenities Child",
						"field_map": {
							"status": "status",
							"name": "amenity_name",
							"image":"image"
						}
					},
					"flat_facilities":{
						"doctype": "Flat Facilities Child",
						"field_map": {
							"status": "status",
							"name": "facility_name",
							"image":"image"
						}
					}
				}, "Property")
		doclist.city_link = frappe.db.get_value("City",{"city_name":doclist.city},"name")
		doclist.location_link = frappe.db.get_value("Area",{"area":doclist.location},"name")
		return doclist
	except Exception, e:
		#http_status_code = getattr(e, "status_code", 500)
		message = getattr(e, "message", 500)
		frappe.msgprint(message)

@frappe.whitelist(allow_guest=True)
def update_tag(doc,sid,tag,operation):
	doc = json.loads(doc)
	data = {}
	data["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	data["sid"] = sid
	data["tags"] = [tag]
	data["property_id"] = doc["property_id"]
	data["fields"] = ["tag"]
	data = json.dumps(data)
	doc_rec = ''
	if operation=='add':
		doc_rec = update_api.update_tags_of_property(data)
	elif operation=='remove':
		doc_rec = update_api.remove_tag_of_property(data)

	tags = update_api.get_property_details(data)
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



@frappe.whitelist(allow_guest=True)
def update_property(doc ,sid):
	doc = json.loads(doc)
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["sid"] = sid
	doc["amenities"] = [ { "name":amenity.get("amenity_name"), "status":amenity.get("status"), 
								"image":amenity.get("image") } for amenity in doc.get("amenities") ]
	doc["flat_facilities"] = [ {"name":facility.get("facility_name"),  "status":facility.get("status"), 
								"image":facility.get("image") } for facility in doc.get("flat_facilities") ]
	doc["full_size_images"] = doc.get("full_size_images").split(',') if doc.get("full_size_images") else []
	doc["thumbnails"] = doc.get("thumbnails").split(',') if doc.get("thumbnails") else []
	doc["tag"] = doc.get("tag").split(',') if doc.get("tag") else []
	validate_for_possesion_date(doc)
	doc["distance_from_imp_locations"] = {"airport" :doc.get("airport"), "central_bus_stand":doc.get("central_bus_stand"), "railway_station":doc.get("railway_station")}
	doc.pop("doc", None)
	try:
		response = update_api.update_property(json.dumps({"property_id":doc.get("property_id"), "fields":doc }))
	except Exception,e:
		frappe.throw(e)
	return response


@frappe.whitelist(allow_guest=True)
def get_all_properties(sid):
	user_id = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	data = json.dumps({"user_id":user_id, "sid":sid})
	return update_api.get_all_properties(data)



@frappe.whitelist(allow_guest=True)
def delete_photo(doc, sid, img_url):
	doc = json.loads(doc)
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["full_size_images"] = doc.get("full_size_images").split(',') if doc.get("full_size_images") else []
	doc["thumbnails"] = doc.get("thumbnails").split(',') if doc.get("thumbnails") else []
	try:
		response = update_api.delete_property_photo(doc, img_url)
	except Exception,e:
		frappe.throw(e)
	return response	 