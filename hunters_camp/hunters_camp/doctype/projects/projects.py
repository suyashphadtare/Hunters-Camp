# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import propshikari.propshikari.project_api as api
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
	doc["amenities"] = doc.get('amenities').split(',') if doc.get("amenities") else []
	doc["flat_facilities"] = doc.get('flat_facilities').split(',') if doc.get("flat_facilities") else []
	doc_rec = api.post_project(doc)
	return doc_rec