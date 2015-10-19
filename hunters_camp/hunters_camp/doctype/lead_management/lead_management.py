# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
from frappe.model.mapper import get_mapped_doc
import datetime
import json

STANDARD_USERS = ("Guest", "Administrator")


class LeadManagement(Document):
	pass
	# def on_update(self):
	# 	if self.property_type and self.property_subtype and self.property_subtype_option and self.location:
	# 		pass
	# 	else:
	# 		frappe.msgprint("Property Type, Property Subtype, Property Subtype Option and Locations are mandatory to serach property.")


@frappe.whitelist()
def get_se_details(assign_to=None):
	se_details = frappe.db.sql("""select name, visiter, schedule_date from `tabSite Visit` where
								visiter='%s' and schedule_date>='%s'"""%(assign_to,nowdate()),as_dict=1)
	frappe.errprint(se_details)
	if len(se_details)>0:
		return se_details
	else:
		return {'status':'Available'}



@frappe.whitelist()
def get_acm_details(assign_to=None):
	acm_details = frappe.db.sql("""select name, visiter, schedule_date from `tabACM Visit` where
								visiter='%s' and schedule_date>='%s'"""%(assign_to,nowdate()),as_dict=1)
	if len(acm_details)>0:
		return acm_details
	else:
		return {'status':'Available'}



@frappe.whitelist()
def make_se_visit(property_list=None,assign_to=None,parent=None,schedule_date=None):
	property_new = json.loads(property_list)
	if len(property_new)>0:
		for i in property_new:
			frappe.errprint(i)
			doctype ='Site Visit'
			name = schedule_se_visit(i,assign_to,parent,doctype,schedule_date)
			update_se_status_in_leadform(i,name,assign_to,schedule_date)
			if name:
				create_to_do(assign_to,name,doctype)
		return {"Status":'Available'}


def schedule_se_visit(child_property,assign_to,parent,doctype,schedule_date):
	lead_record = frappe.get_doc("Lead Management", parent)

	child_id = frappe.get_doc("Lead Property Details", child_property)

	se_visit = frappe.get_doc({
		"doctype": doctype ,
		"lead":lead_record.lead,
		"lead_name": lead_record.lead_name,
		"middle_name":lead_record.middle_name,
		"last_name":lead_record.last_name,
		"email_id":lead_record.email_id,
		"references":lead_record.references,
		"description":lead_record.description,
		"lead_from":lead_record.lead_from,
		"mobile_no":lead_record.mobile_no,
		"address":lead_record.address,
		"address_details":lead_record.address_details,
		"property_id": child_id.property_id,
		"property_name": child_id.property_name,
		"area": child_id.area,
		"bhk": child_id.bhk,
		"bathroom": child_id.bathroom,
		"price": child_id.price,
		"property_address": child_id.address,
		"enquiry_id":lead_record.enquiry_id,
		"consultant": lead_record.consultant,
		"form_posting_date":nowdate(),
		"lead_management_id":parent,
		"enquiry_from": lead_record.enquiry_from ,
		"visiter": assign_to,
		"location": child_id.location,
		"posting_date":lead_record.posting_date,
		"child_id":child_property,
		"schedule_date": datetime.datetime.strptime(cstr(schedule_date),'%d-%m-%Y %H:%M:%S')
	})

	se_visit.insert(ignore_permissions=True)
	se_visit.save()
	return se_visit.name
	

def update_se_status_in_leadform(source_name,se_visit,assign_to,schedule_date):
	lead_name = frappe.get_doc("Lead Property Details", source_name)
	lead_name.se_status = 'Scheduled'
	lead_name.site_visit = se_visit
	lead_name.site_visit_assignee = assign_to
	lead_name.se_date = datetime.datetime.strptime(cstr(schedule_date),'%d-%m-%Y %H:%M:%S')
	lead_name.save()

def create_to_do(assign_to,name,doctype):
		import datetime
		today = nowdate()
		d = frappe.new_doc("ToDo")
		d.owner = assign_to
		d.description = doctype
		d.reference_type = doctype
		d.reference_name = name
		d.priority =  'Medium'
		d.date = today
		d.assigned_by = frappe.session.user
		d.save(1)

@frappe.whitelist()
def make_acm_visit(property_list=None,assign_to=None,parent=None,schedule_date=None):
	property_new = json.loads(property_list)
	if len(property_new)>0:
		for i in property_new:
			frappe.errprint(i)
			doctype ='ACM Visit'
			name = schedule_se_visit(i,assign_to,parent,doctype,schedule_date)
			update_acm_status_in_leadform(i,name,assign_to,schedule_date)
			if name:
				create_to_do(assign_to,name,doctype)
		return {"Status":'Available'}

def update_acm_status_in_leadform(source_name,acm_visit,assign_to,schedule_date):
	lead_name = frappe.get_doc("Lead Property Details", source_name)
	lead_name.acm_status = 'Scheduled'
	lead_name.acm_visit = acm_visit
	lead_name.acm_visit_assignee = assign_to
	lead_name.acm_date = datetime.datetime.strptime(cstr(schedule_date),'%d-%m-%Y %H:%M:%S')
	lead_name.save()

def sales_executive_query(doctype, txt, searchfield, start, page_len, filters):
	from frappe.desk.reportview import get_match_cond
	txt = "%{}%".format(txt)
	return frappe.db.sql("""select name, concat_ws(' ', first_name, middle_name, last_name)
		from `tabUser`
		where ifnull(enabled, 0)=1
			and docstatus < 2
			and name not in ({standard_users})
			and user_type != 'Website User'
			and name in (select parent from `tabUserRole` where role='Sales Executive' and parent!='Administrator' and parent!='Guest')
			and ({key} like %s
				or concat_ws(' ', first_name, middle_name, last_name) like %s)
		order by
			case when name like %s then 0 else 1 end,
			case when concat_ws(' ', first_name, middle_name, last_name) like %s
				then 0 else 1 end,
			name asc
		limit %s, %s""".format(standard_users=", ".join(["%s"]*len(STANDARD_USERS)),
			key=searchfield),
			tuple(list(STANDARD_USERS) + [txt, txt, txt, txt, start, page_len]))


def acm_query(doctype, txt, searchfield, start, page_len, filters):
	from frappe.desk.reportview import get_match_cond
	txt = "%{}%".format(txt)
	return frappe.db.sql("""select name, concat_ws(' ', first_name, middle_name, last_name)
		from `tabUser`
		where ifnull(enabled, 0)=1
			and docstatus < 2
			and name not in ({standard_users})
			and user_type != 'Website User'
			and name in (select parent from `tabUserRole` where role='Account Closure Manager' and parent!='Administrator' and parent!='Guest')
			and ({key} like %s
				or concat_ws(' ', first_name, middle_name, last_name) like %s)
		order by
			case when name like %s then 0 else 1 end,
			case when concat_ws(' ', first_name, middle_name, last_name) like %s
				then 0 else 1 end,
			name asc
		limit %s, %s""".format(standard_users=", ".join(["%s"]*len(STANDARD_USERS)),
			key=searchfield),
			tuple(list(STANDARD_USERS) + [txt, txt, txt, txt, start, page_len]))


@frappe.whitelist()
def get_diffrent_property(data=None,lead_management=None):
	property_id_list = frappe.db.sql("""select property_id from `tabLead Property Details` 
		where parent='%s' """%lead_management,as_dict=1)
	if property_id_list:

		return {"property_id": property_id_list}
	else:
		return None

@frappe.whitelist()
def get_administartor(property_type=None,property_subtype=None,location=None,operation=None,
						area_minimum=None,area_maximum=None,budget_minimum=None,budget_maximum=None):
	
	users =  frappe.db.sql("""select parent from `tabUserRole` where role='System Manager' 
						and parent!='Administrator'""",as_list=1)
	if users:
		for user_id in users:
			create_email(user_id[0],property_type,property_subtype,location,operation,
						area_minimum,area_maximum,budget_minimum,budget_maximum)

def create_email(user_id,property_type=None,property_subtype=None,location=None,operation=None,
						area_minimum=None,area_maximum=None,budget_minimum=None,budget_maximum=None):
	
	user_name = frappe.db.get_value("User", frappe.session.user, ["first_name", "last_name"],as_dict=True)
	args = { "title":"Property Search Criteria Shared By  {0}" .format(frappe.session.user) , "property_type":property_type ,"property_subtype":property_subtype,"budget_maximum":budget_maximum,"budget_minimum":budget_minimum,"area_minimum":area_minimum,"area_maximum":area_maximum,"location":location,"operation":operation,"first_name":user_name.get("first_name"), "last_name":user_name.get("last_name")}
	send_email(user_id, "Property Serach Criteria Shared With you", "/templates/search_criteria_shared.html", args)
	return True

def send_email(email, subject, template, args):
	frappe.sendmail(recipients=email, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))
	
@frappe.whitelist()
def update_details(list=None,followup_type=None,followup_date=None):
	properties = json.loads(list)
	
	for i in properties:
		lead_property = frappe.get_doc("Lead Property Details", i.get('name'))
		if followup_type=='Follow-Up For Share':
			lead_property.share_followup_status = i.get('status')
			lead_property.share_followup_date = datetime.datetime.strptime(cstr(followup_date),'%d-%m-%Y')
		elif followup_type=='Follow-Up For SE':
			lead_property.se_follow_up_status = i.get('status')
			lead_property.se_followup_date = datetime.datetime.strptime(cstr(followup_date),'%d-%m-%Y')
		else:
			lead_property.acm_followup_status = i.get('status')
			lead_property.acm_followup_date = datetime.datetime.strptime(cstr(followup_date),'%d-%m-%Y')
		lead_property.save(ignore_permissions=True)


	return True

@frappe.whitelist()
def update_followup_date(list=None,followup_type=None,followup_date=None):
	properties = json.loads(list)
	if len(properties)>0:
		for i in properties:
			lead_property = frappe.get_doc("Lead Property Details", i)
			if followup_type=='Follow-Up For Share':
				lead_property.share_followup_date = getdate(cstr(followup_date))#datetime.datetime.strptime(cstr(followup_date),'%d-%m-%y')
			elif followup_type=='Follow-Up For SE':
				lead_property.se_followup_date = datetime.datetime.strptime(cstr(followup_date),'%d-%m-%Y')
			else:
				lead_property.acm_followup_date = datetime.datetime.strptime(cstr(followup_date),'%d-%m-%Y')
			lead_property.save(ignore_permissions=True)

	