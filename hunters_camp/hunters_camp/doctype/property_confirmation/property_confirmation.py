# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import json

class PropertyConfirmation(Document):
	pass



# property confirmatio mail is send to the consultanat after confirming the property 
@frappe.whitelist()
def mail_notifiction_to_consultant(prop_data):
	prop_data = json.loads(prop_data)
	email_id, first_name = frappe.db.get_value("User", prop_data.get("consultant_id"), ["email", "first_name"])
	args = { "title":"Property Confirmation Email"  ,"prop_data":prop_data, "first_name":first_name}
	send_email(email_id, "Propshikari Confirmation Email", "/templates/property_confirmation_to_consultant.html", args)   
	return True

def send_email(email, subject, template, args):
	frappe.sendmail(recipients=[email], sender=None, subject=subject,
		message=frappe.get_template(template).render(args))
# end of code