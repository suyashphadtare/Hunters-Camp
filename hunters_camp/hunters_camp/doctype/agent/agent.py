# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.model.naming import make_autoname
from frappe.utils import add_days, getdate, nowdate

class Agent(Document):
	
	def validate(self):
		 pass




@frappe.whitelist()
def get_agent_package(agent_name):
	if frappe.db.get_value("Agent Package", agent_name, "name"):
		ap = frappe.get_doc("Agent Package", agent_name)
	else:
		ap = frappe.new_doc("Agent Package")
		ap.agent = agent_name
	return ap.as_dict()





def revoke_package_access():
	ap_data = frappe.db.sql(""" select * from `tabAgent Package` where  status='Active' and end_date < CURDATE() """, as_dict=True)
	for pckg in ap_data:
		ap = frappe.get_doc("Agent Package", pckg.get("name"))
		ap.status = "Inactive"
		ap.posting_allowed = 0
		ap.property_posted = 0
		ap.save()




def send_email_notification():
	ap_data = frappe.db.sql(""" select * from  `tabAgent Package`  where  status='Active' 
									and DATE_SUB(end_date, INTERVAL 7 DAY) = CURDATE()  """, as_dict=True)
	template = "/templates/expiry_notification.html"
	for pckg in ap_data:
		args = {	
				"end_date" : pckg.get("end_date"),
				"title":"Package Expiry Notification",
				"first_name":frappe.db.get_value("Agent", {"name":pckg.get("name")}, "first_name"),
				"pckg_nm":frappe.db.get_value("Package",pckg.get("package_name"), "package_name")
				}
		try:
			frappe.sendmail(recipients=pckg.get("name"), sender=None, subject="Propshikari Package Expiry Alert",
				message=frappe.get_template(template).render(args), cc=["suyash.p@indctranstech.com", "anand.pawar@indictranstech.com"])
		except Exception,e:
			pass	
		