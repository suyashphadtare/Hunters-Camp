# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import propshikari.propshikari.propshikari_api as api

class Property(Document):
	pass



@frappe.whitelist(allow_guest=True)
def post_property(doc):
	"""
		1. Either pop up the keys that are not needed or make and mapper and map the fields
		2. Create json doc for uploading
		3. Return Response
	"""
	pass
	# user_id = frappe.db.get_value("User",{"name":frappe.session.user},"user_id") or "Administrator"
	# doc_rec = api.post_property(doc)
	# frappe.errprint(doc_rec)