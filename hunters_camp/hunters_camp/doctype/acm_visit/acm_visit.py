# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
import datetime

class ACMVisit(Document):
	def on_update(self):
		if self.acm_status:
			self.change_lead_managemnet_child_status(self.name,self.acm_status,self.child_id)

	def change_lead_managemnet_child_status(self,acm_Visit,se_status,child_id):
		child_entry = frappe.get_doc("Lead Property Details", child_id)
		child_entry.acm_status = self.acm_status
		child_entry.save(ignore_permissions=True)


@frappe.whitelist()
def add_book_property_details(bank=None,cheque_no=None,payer=None,cheque_date=None,amount=None,description=None,name=None,lead_management_id=None, property_id=None):
	acm = frappe.get_doc('ACM Visit',name)
	acm.bank = bank
	acm.cheque_no = cheque_no
	acm.payer = payer
	if cheque_date:
		acm.cheque_date = datetime.datetime.strptime(cstr(cheque_date),'%d-%m-%Y')
	acm.amount = amount
	acm.description = description
	acm.save(ignore_permissions=True)
	update_lead_management_book_details(bank,cheque_no,payer,cheque_date,amount,description,name,lead_management_id, property_id)
	return True


def update_lead_management_book_details(bank=None,cheque_no=None,payer=None,cheque_date=None,amount=None,description=None,name=None,lead_management_id=None, property_id=None):
	lm =frappe.get_doc('Lead Property Details',lead_management_id)
	lm.bank = bank
	lm.cheque_no = cheque_no
	lm.payer = payer
	if cheque_date:
		lm.cheque_date = datetime.datetime.strptime(cstr(cheque_date),'%d-%m-%Y')
	lm.amount = amount
	lm.description = description
	lm.purchased_property_id = property_id
	lm.booked = 1
	lm.save(ignore_permissions=True)

def get_permission_query_conditions(user):
	if not user: user = frappe.session.user
	"""
		Filter condition for user
	"""
	#pass
	if not user == 'Administrator':
		return """(`tabACM Visit`.visiter ='{0}')""".format(user)