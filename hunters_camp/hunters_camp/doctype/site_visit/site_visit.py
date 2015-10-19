# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class SiteVisit(Document):
	def on_update(self):
		if self.se_status:
			self.change_lead_managemnet_child_status(self.name,self.se_status,self.child_id)

	def change_lead_managemnet_child_status(self,Site_Visit,se_status,child_id):
		child_entry = frappe.get_doc("Lead Property Details", child_id)
		child_entry.se_status = self.se_status
		child_entry.save(ignore_permissions=True)
