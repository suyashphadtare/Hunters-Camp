# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class PropertyConfirmation(Document):
	pass




@frappe.whitelist()
def mail_notifiction_to_consultant(email_id):
    user_name = frappe.db.get_value("User", frappe.session.user, ["first_name", "last_name"],as_dict=True)
    args = { "title":"Property Shared by  {0}" .format(frappe.session.user) ,"first_name":user_name.get("first_name"), "last_name":user_name.get("last_name")}
    send_email(email_id, "Propshikari properties shared with you", "/templates/property_confirmation_to_consultant.html", args)
   
    return True

def send_email(email, subject, template, args):
  frappe.sendmail(recipients=email, sender=None, subject=subject,
      message=frappe.get_template(template).render(args))
