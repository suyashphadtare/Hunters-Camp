# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class AgentPackage(Document):
	
	def validate(self):
		pass

	def on_update(self):
		ag = frappe.get_doc("Agent",self.name)	
		ag.package_name = self.package_name
		ag.posting_allowed = self.posting_allowed
		ag.total_posted = self.property_posted
		ag.start_date = self.start_date
		ag.end_date = self.end_date
		ag.status = self.status
		ag.save()



@frappe.whitelist()
def get_package_details(package_name):
	return frappe.db.get_value("Package", package_name, '*')		
