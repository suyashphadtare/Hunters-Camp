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

	# def on_update(self):
	# 	self.consultant_allocation()

	# def consultant_allocation(self):
	#   enquiry_locations = frappe.db.sql("""select distinct location from `tabEnquiry` where enquiry_status='Unprocessed'""",as_list=1)
	#   frappe.errprint(["enquiry_locations",enquiry_locations])
	#   if enquiry_locations:
	#   	for i in enquiry_locations:
	#   		if i[0]:
	#   			enquiry_form= frappe.db.sql("""select name from `tabEnquiry` where location='%s' and enquiry_status='Unprocessed'
	#   							"""%i[0],as_list=1)

	#   			frappe.errprint(enquiry_form)
	#   			consultant=frappe.db.sql("""select parent from `tabLocation Name` where location='%s'
	#   						"""%i[0],as_list=1)

	#   			consultant_details={}
	#   			if consultant:
	#   				for name in consultant:
	#   					consultant_name=frappe.db.sql("""select parent from `tabUserRole` where parent='%s' and role='Consultant'"""%name[0],as_list=1)
	#   					if consultant_name:
	#   						lead_count = frappe.db.sql("""select count(name) from `tabLead Management` where consultant='%s' and lead_status!='Closed' and location='%s'
	#   											"""%(consultant_name[0][0],i[0]),as_list=1)
	#   						if lead_count:
	#   							consultant_details[consultant_name[0][0]]=lead_count[0][0]

	#   			frappe.errprint(consultant_details)	
	#   			if consultant_details:
	#   				self.consultant_assignment(consultant_details,enquiry_form)


	# def consultant_assignment(self,consultant_details,enquiry_form):
	# 	from operator import itemgetter
	# 	sorted_dictionary = sorted(consultant_details.items(), key=itemgetter(1) , reverse=False)
	# 	frappe.errprint(sorted_dictionary)
	# 	if len(enquiry_form)>0:
	# 		frappe.errprint(["enquiry_from",enquiry_form])
	# 		for enquiry in enquiry_form:
	# 			for dic in sorted_dictionary:
	# 				lead_management = self.create_lead_management(enquiry[0],dic[0])
	# 				self.cretae_to_do(dic[0],lead_management)
	# 				consultant_details[dic[0]]=consultant_details[dic[0]]+1
	# 				break

	# 			sorted_dictionary = sorted(consultant_details.items(), key=itemgetter(1) , reverse=False)
	# 			frappe.errprint(["sorted_dictionary",sorted_dictionary])				

	# def create_lead_management(self,source_name,assign_to,target_doc=None,ignore_permissions=True):
	# 	def set_missing_values(source, target):
	# 		target.consultant = assign_to
	# 		target.enquiry_id = source_name
	# 		target.form_posting_date = nowdate()
	# 		target.run_method("set_missing_values")

	# 	target_doc = get_mapped_doc("Enquiry", source_name, {
	# 		"Enquiry": {
	# 			"doctype": "Lead Management"
	# 		},
	# 		"Property Details": {
	# 			"doctype": "Lead Property Details"
	# 		}
	# 	}, target_doc, set_missing_values,ignore_permissions)

	# 	target_doc.insert(ignore_permissions=True)
	# 	target_doc.save()
	# 	if target_doc.name:
	# 		update_enquiry_status(source_name)
	# 		return target_doc.name

	# def update_enquiry_status(self,enquiry_name):
	# 	enquiry = frappe.get_doc("Enquiry", enquiry_name)
	# 	enquiry.enquiry_status = 'Processed'
	# 	enquiry.save()
			
	# def cretae_to_do(self,assign_to,lead_management):
	# 	import datetime
	# 	today = nowdate()
	# 	d = frappe.new_doc("ToDo")
	# 	d.owner = assign_to
	# 	d.description = 'Lead Managemnet Form'
	# 	d.reference_type = 'Lead Management'
	# 	d.reference_name = lead_management
	# 	d.priority =  'Medium'
	# 	d.date = today
	# 	d.assigned_by = frappe.session.user
	# 	d.save(1)

	def validate(self):
		self.validate_property_id()

	def validate_property_id(self):
		property_id = []
		for d in self.get("property_details"):
			if d.property_id in property_id:
				frappe.msgprint("Duplicate property id '%s' is not allowed in property details table at row '%s'"%(d.property_id,d.idx),raise_exception=1)
			else:
				property_id.append(d.property_id)



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
	#frappe.errprint("in create_lead_management")
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

	#frappe.errprint(target_doc)

	target_doc.insert(ignore_permissions=True)
	target_doc.save()
	if target_doc.name:
		update_enquiry_status(source_name)
		return target_doc.name


def update_enquiry_status(enquiry_name):
	enquiry = frappe.get_doc("Enquiry", enquiry_name)
	enquiry.enquiry_status = 'Processed'
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




	
# #Schedular Method Call............................................
# def consultant_allocation():
# 	print "consultant_allocation"
# 	frappe.errprint("in consultant_allocation")
# 	enquiry_locations = frappe.db.sql("""select distinct location from `tabEnquiry` where enquiry_status='Unprocessed'""",as_list=1)
# 	frappe.errprint(["enquiry_locations",enquiry_locations])
# 	if enquiry_locations:
# 		for i in enquiry_locations:
# 			if i[0]:
# 				enquiry_form= frappe.db.sql("""select name from `tabEnquiry` where location='%s' and enquiry_status='Unprocessed'
# 								"""%i[0],as_list=1)

# 				#frappe.errprint(enquiry_form)
# 				consultant=frappe.db.sql("""select parent from `tabLocation Name` where location='%s'
# 							"""%i[0],as_list=1)

# 				consultant_details={}
# 				if consultant:
# 					for name in consultant:
# 						consultant_name=frappe.db.sql("""select parent from `tabUserRole` where parent='%s' and role='Consultant'"""%name[0],as_list=1)
# 						if consultant_name:
# 							lead_count = frappe.db.sql("""select count(name) from `tabLead Management` where consultant='%s' and lead_status!='Closed' and location='%s'
# 												"""%(consultant_name[0][0],i[0]),as_list=1)
# 							if lead_count:
# 								consultant_details[consultant_name[0][0]]=lead_count[0][0]

# 				#frappe.errprint(consultant_details)	
# 				if consultant_details:
# 					self.consultant_assignment(consultant_details,enquiry_form)


# def consultant_assignment(consultant_details,enquiry_form):
# 	from operator import itemgetter
# 	sorted_dictionary = sorted(consultant_details.items(), key=itemgetter(1) , reverse=False)
# 	#frappe.errprint(sorted_dictionary)
# 	if len(enquiry_form)>0:
# 		#frappe.errprint(["enquiry_from",enquiry_form])
# 		for enquiry in enquiry_form:
# 			for dic in sorted_dictionary:
# 				lead_management = create_lead_management(enquiry[0],dic[0])
# 				cretae_to_do(dic[0],lead_management)
# 				consultant_details[dic[0]]=consultant_details[dic[0]]+1
# 				break

# 			sorted_dictionary = sorted(consultant_details.items(), key=itemgetter(1) , reverse=False)
# 			frappe.errprint(["sorted_dictionary",sorted_dictionary])				

# def create_lead_management(source_name,assign_to,target_doc=None,ignore_permissions=True):
# 	def set_missing_values(source, target):
# 		target.consultant = assign_to
# 		target.enquiry_id = source_name
# 		target.form_posting_date = nowdate()
# 		target.run_method("set_missing_values")

# 	target_doc = get_mapped_doc("Enquiry", source_name, {
# 		"Enquiry": {
# 			"doctype": "Lead Management"
# 		},
# 		"Property Details": {
# 			"doctype": "Lead Property Details"
# 		}
# 	}, target_doc, set_missing_values,ignore_permissions)

# 	target_doc.insert(ignore_permissions=True)
# 	target_doc.save()
# 	if target_doc.name:
# 		update_enquiry_status(source_name)
# 		return target_doc.name

# def update_enquiry_status(enquiry_name):
# 	enquiry = frappe.get_doc("Enquiry", enquiry_name)
# 	enquiry.enquiry_status = 'Processed'
# 	enquiry.save()
		
# def cretae_to_do(assign_to,lead_management):
# 	import datetime
# 	today = nowdate()
# 	d = frappe.new_doc("ToDo")
# 	d.owner = assign_to
# 	d.description = 'Lead Managemnet Form'
# 	d.reference_type = 'Lead Management'
# 	d.reference_name = lead_management
# 	d.priority =  'Medium'
# 	d.date = today
# 	d.assigned_by = frappe.session.user
# 	d.save(1)

