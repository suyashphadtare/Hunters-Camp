# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import propshikari.propshikari.project_api as api
from hunters_camp.hunters_camp.mapper import get_mapped_doc
import propshikari.propshikari.property_update_api as update_api
from hunters_camp.hunters_camp.doctype.property.property import validate_for_possesion_date

import json

class Projects(Document):
	pass

@frappe.whitelist(allow_guest=True)
def post_project(doc,sid):
	"""
		1. Either pop up the keys that are not needed or make and mapper and map the fields
		2. Create json doc for uploading
		3. Return Response
	"""
	doc = json.loads(doc)
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["sid"] = sid
	doc["amenities"] = [ amenity.get("amenity_name") for amenity in doc.get("amenities") if amenity.get("status") == "Yes" ]
	doc["distance_from_imp_locations"] = { "airport": doc.get("airport"), "railway_station":doc.get("railway_station") , "central_bus_stand":doc.get("central_bus_stand")  }
	validate_for_possesion_date(doc)
	try:
		doc_rec = api.post_project(doc)
	except Exception,e:
		frappe.throw(e)
	return doc_rec



@frappe.whitelist(allow_guest=True)
def view_project(project_id, sid):
	doc = {}
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["sid"] = sid
	doc["project_id"] = project_id
	data = json.dumps(doc)
	doc = api.get_project_of_given_id(data)
	doclist = get_mapped_doc(doc["data"], {
				"amenities": {
					"doctype": "Amenities Child",
					"field_map": {
						"status": "status",
						"name": "amenity_name",
						"image":"image"
					}
				},
				"property_details":{
					"doctype": "Project Details"			
				}
		}, "Projects")
	doclist.city_link = frappe.db.get_value("City",{"city_name":doclist.city},"name")
	doclist.location_link = frappe.db.get_value("Area",{"area":doclist.location},"name")
	return doclist


@frappe.whitelist(allow_guest=True)
def update_project(doc, sid):
	doc = json.loads(doc)
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["sid"] = sid
	doc["amenities"] = [ { "name":amenity.get("amenity_name"), "status":amenity.get("status"), 
								"image":amenity.get("image") } for amenity in doc.get("amenities") ]
	
	doc["full_size_images"] = doc.get("full_size_images").split(',') if doc.get("full_size_images") else []
	doc["thumbnails"] = doc.get("thumbnails").split(',') if doc.get("thumbnails") else []
	doc["tag"] = doc.get("tag").split(',') if doc.get("tag") else []
	validate_for_possesion_date(doc)
	doc["distance_from_imp_locations"] = {"airport" :doc.get("airport"), "central_bus_stand":doc.get("central_bus_stand"), "railway_station":doc.get("railway_station")}
	doc.pop("doc", None)
	try:
		response = update_api.update_project({"project_id":doc.get("project_id"), "fields":doc })
	except Exception ,e:
		frappe.throw(e)
	return response


@frappe.whitelist(allow_guest=True)
def update_status(doc, sid, status):
	doc = json.loads(doc)
	data = {}
	data["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	data["sid"] = sid
	data["project_status"] = status
	data["project_id"] = doc["project_id"]
	data["fields"] = ["status"]
	doc_rec = update_api.upadate_project_status(data)
	status = update_api.get_project_details(data)
	return doc_rec,status["data"]["status"]



@frappe.whitelist(allow_guest=True)
def delete_photo(doc, sid, img_url):
	doc = json.loads(doc)
	doc["user_id"] = frappe.db.get_value("User",{"name":frappe.session.user},"user_id")
	doc["full_size_images"] = doc.get("full_size_images").split(',') if doc.get("full_size_images") else []
	doc["thumbnails"] = doc.get("thumbnails").split(',') if doc.get("thumbnails") else []
	try:
		response = update_api.delete_project_photo(doc, img_url)
	except Exception,e:
		frappe.throw(e)
	return response		