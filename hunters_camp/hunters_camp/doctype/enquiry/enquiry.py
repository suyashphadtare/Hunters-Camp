# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from erpnext.utilities.address_and_contact import load_address_and_contact
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
from frappe.model.mapper import get_mapped_doc
import json

STANDARD_USERS = ("Guest", "Administrator")

class Enquiry(Document):

	def validate(self):
		self.validate_property_id()
		self.validate_lead()

	def on_update(self):
		self.create_dictionary()
		if self.flag==1:
			self.check_updation_enquiry()
		self.flag = 1

	def validate_property_id(self):
		property_id = []
		for d in self.get("property_details"):
			if d.property_id in property_id:
				frappe.msgprint("Duplicate property id '%s' is not allowed in property details table at row '%s'"%(d.property_id,d.idx),raise_exception=1)
			else:
				property_id.append(d.property_id)


	def validate_lead(self):
		if frappe.db.sql("""select name from `tabEnquiry` where name!='%s' and lead='%s'"""%(self.name,self.lead)):
			name = frappe.db.sql("""select name from `tabEnquiry` where name!='%s' and lead='%s'"""%(self.name,self.lead),as_list=1)
			frappe.msgprint("Lead '%s' is already involved in other enquiry '%s' "%(self.lead,name[0][0]),raise_exception=1)

	def create_dictionary(self):
		criteria = frappe.db.sql("""select property_type,property_subtype,property_subtype_option,operation,location,location_name,budget_minimum,budget_maximum,area_minimum,area_maximum
									from `tabEnquiry` where lead='%s' and name='%s'"""%(self.lead,self.name),as_dict=1)
		frappe.db.sql("""update `tabEnquiry` set search_criteria="%s" where name ='%s' and lead='%s' """
			%(criteria[0],self.name,self.lead))
		frappe.db.commit()
		
	def check_updation_enquiry(self):
		criteria = frappe.db.sql("""select property_type,property_subtype,property_subtype_option,operation,location,location_name,budget_minimum,budget_maximum,area_minimum,area_maximum
									from `tabEnquiry` where lead='%s' and name='%s'"""%(self.lead,self.name),as_dict=1)

		if str(self.search_criteria)!=str(criteria[0]):
			lead_management = self.create_lead_management_from_enquiry(self.name,self.lead_management_consultant)
			self.create_to_do(self.lead_management_consultant,lead_management)


	def create_lead_management_from_enquiry(self,source_name=None,assign_to=None,target_doc=None,ignore_permissions=True):
		def set_missing_values(source, target):
			target.consultant = assign_to
			target.enquiry_id = source_name
			target.form_posting_date = nowdate()
			target.run_method("set_missing_values")

		target_doc = get_mapped_doc("Enquiry", source_name, {
			"Enquiry": {
				"doctype": "Lead Management"
			},
			"Property Details": {
				"doctype": "Lead Property Details"
			}
		}, target_doc, set_missing_values,ignore_permissions)

		target_doc.insert(ignore_permissions=True)
		target_doc.save()	
		return target_doc.name

	def create_to_do(self,assign_to,lead_management):
		import datetime
		today = nowdate()
		d = frappe.new_doc("ToDo")
		d.owner = assign_to
		d.description = 'Lead Managemnet Form'
		d.reference_type = 'Lead Management'
		d.reference_name = lead_management
		d.priority =  'Medium'
		d.date = today
		d.assigned_by = frappe.session.user
		d.save(1)

#Getting contact details after selecting contact name
@frappe.whitelist()
def get_contact_details(contact):
	contact = frappe.get_doc("Contact", contact)
	out = {
		"contact_person": contact.get("name") or " ",
		"contact_display": " ".join(filter(None,
			[contact.get("first_name"), contact.get("last_name")])) or " ",
		"contact_email": contact.get("email_id") or " ",
		"contact_mobile": contact.get("mobile_no")or " ",
		"contact_phone": contact.get("phone") or " ",
		"contact_designation": contact.get("designation") or " ",
		"contact_department": contact.get("department") or " ",
		"contact_personal_email" : contact.get("personal_email") or " "
	}
	return out


@frappe.whitelist(allow_guest=True)
def create_lead_management_form(source_name=None,assign_to=None,target_doc=None,ignore_permissions=True):
	def set_missing_values(source, target):
		target.consultant = assign_to
		target.enquiry_id = source_name
		target.form_posting_date = nowdate()
		target.run_method("set_missing_values")

	target_doc = get_mapped_doc("Enquiry", source_name, {
		"Enquiry": {
			"doctype": "Lead Management"
		},
		"Property Details": {
			"doctype": "Lead Property Details"
		}
	}, target_doc, set_missing_values,ignore_permissions)

	target_doc.insert(ignore_permissions=True)
	target_doc.save()
	if target_doc.name:
		update_enquiry_status(source_name,target_doc.name,assign_to)
		return target_doc.name


def update_enquiry_status(enquiry_name,lead_management,assign_to):
	enquiry = frappe.get_doc("Enquiry", enquiry_name)
	enquiry.enquiry_status = 'Processed'
	enquiry.lead_management = lead_management
	enquiry.lead_management_consultant = assign_to
	enquiry.save()


def user_query(doctype, txt, searchfield, start, page_len, filters):
	from frappe.desk.reportview import get_match_cond
	txt = "%{}%".format(txt)
	return frappe.db.sql("""select name, concat_ws(' ', first_name, middle_name, last_name)
		from `tabUser`
		where ifnull(enabled, 0)=1
			and docstatus < 2
			and name not in ({standard_users})
			and user_type != 'Website User'
			and name in (select parent from `tabUserRole` where role='Consultant')
			and ({key} like %s
				or concat_ws(' ', first_name, middle_name, last_name) like %s)
			{mcond}
		order by
			case when name like %s then 0 else 1 end,
			case when concat_ws(' ', first_name, middle_name, last_name) like %s
				then 0 else 1 end,
			name asc
		limit %s, %s""".format(standard_users=", ".join(["%s"]*len(STANDARD_USERS)),
			key=searchfield, mcond=get_match_cond(doctype)),
			tuple(list(STANDARD_USERS) + [txt, txt, txt, txt, start, page_len]))

#Get count of non allocated enquiries---
@frappe.whitelist(allow_guest=True)
def get_non_allocated_enquiry():
	count =  frappe.db.sql("""select count(name) from `tabEnquiry` where enquiry_status='Not Allocated'
					order by creation desc """,as_list=1)
	if count:
		if count[0][0]!=0:
			return count[0][0]



	
#Schedular Method Call............................................
@frappe.whitelist(allow_guest=True)
def consultant_allocation(count,allocation_count):
	enquiry_list=[]
	enquiry_form= frappe.db.sql("""select name from `tabEnquiry` where enquiry_status='Not Allocated' order by creation limit %s
								"""%allocation_count,as_list=1)
	if len(enquiry_form)>0:

		for name in enquiry_form:
			if name[0]:
				enquiry_locations =  frappe.db.get_value('Enquiry', {'name':name[0]}, 'location_name')
				

				if enquiry_locations:
					consultant= frappe.db.sql(""" select parent from `tabLocation` where location='%s'"""%enquiry_locations,as_list=1)
					consultant_details={}
					if len(consultant)>0:
						for c_name in consultant:
							consultant_name=frappe.db.sql("""select parent from `tabUserRole` where parent='%s' and role='Consultant' and parent!='Administrator' and parent!='Guest'"""%c_name[0],as_list=1)
							if consultant_name:
								lead_count = frappe.db.sql("""select count(name) from `tabLead Management` where consultant='%s' and lead_status!='Closed'
													"""%(consultant_name[0][0]),as_list=1)
								
								if lead_count:
									consultant_details[consultant_name[0][0]]=lead_count[0][0]
	
						if consultant_details:
							consultant_assignment(consultant_details,name[0])
					else:
						enquiry_list.append(name[0])
						pass #consulatant not avilable
				else:
					enquiry_list.append(name[0])
					
	if len(enquiry_list)>0:
		allocate_enquiry_randomly(enquiry_list)

	frappe.msgprint("Lead Allocation Completed Successfully.")
	return True
				
def consultant_assignment(consultant_details,enquiry_form):
	from operator import itemgetter
	sorted_dictionary = sorted(consultant_details.items(), key=itemgetter(1) , reverse=False)
	for dic in sorted_dictionary:
		lead_management = create_lead_management(enquiry_form,dic[0])
		cretae_to_do(dic[0],lead_management)
		consultant_details[dic[0]]=consultant_details[dic[0]]+1
		break

	sorted_dictionary = sorted(consultant_details.items(), key=itemgetter(1) , reverse=False)

def allocate_enquiry_randomly(enquiry_list):
	consultant_details={}
	consultant_name=frappe.db.sql("""select parent from `tabUserRole` where role='Consultant' and parent!='Administrator' and parent!='Guest'""",as_list=1)
	if len(consultant_name)>0:
		for i in consultant_name:
			lead_count = frappe.db.sql("""select count(name) from `tabLead Management` where consultant='%s' and lead_status!='Closed'
												"""%i[0],as_list=1)
			if lead_count:
				consultant_details[i[0]]=lead_count[0][0]
		if consultant_details:
			for name in enquiry_list:
				consultant_assignment(consultant_details,name)
	else:
		frappe.msgprint("User having role Consultant is not available in system.",raise_exception=1)


def create_lead_management(source_name,assign_to,target_doc=None,ignore_permissions=True):
	def set_missing_values(source, target):
		target.consultant = assign_to
		target.enquiry_id = source_name
		target.form_posting_date = nowdate()
		target.run_method("set_missing_values")

	target_doc = get_mapped_doc("Enquiry", source_name, {
		"Enquiry": {
			"doctype": "Lead Management"
		},
		"Property Details": {
			"doctype": "Lead Property Details"
		}
	}, target_doc, set_missing_values,ignore_permissions)

	target_doc.insert(ignore_permissions=True)
	target_doc.save()
	if target_doc.name:
		update_enquiry_status(source_name,target_doc.name,assign_to)
	return target_doc.name

def update_enquiry_status(enquiry_name,lead_management,assign_to):
	enquiry = frappe.get_doc("Enquiry", enquiry_name)
	enquiry.enquiry_status = 'Allocated'
	enquiry.lead_management = lead_management
	enquiry.lead_management_consultant = assign_to
	enquiry.save()
		
def cretae_to_do(assign_to,lead_management):
	import datetime
	today = nowdate()
	d = frappe.new_doc("ToDo")
	d.owner = assign_to
	d.description = 'Lead Management Form'
	d.reference_type = 'Lead Management'
	d.reference_name = lead_management
	d.priority =  'Medium'
	d.date = today
	d.assigned_by = frappe.session.user
	d.save(1)

