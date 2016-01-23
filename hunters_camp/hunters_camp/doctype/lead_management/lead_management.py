# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
from frappe.model.mapper import get_mapped_doc
from frappe.utils import validate_email_add
import datetime
import json
from hunters_camp.hunters_camp.utils import get_sms_template
from erpnext.setup.doctype.sms_settings.sms_settings import send_sms

STANDARD_USERS = ("Guest", "Administrator")


class LeadManagement(Document):

	def validate(self):
		self.validate_area_budget_fields()
	
	def validate_area_budget_fields(self):
		field_dict = {"area_minimum":["area_maximum", "Maxiumum Area", "Minimum Area"], "budget_minimum":["budget_maximum", "Maxiumum Budget", "Minimum Budget"]}
		for min_field, max_field in field_dict.items():
			if self.get(max_field[0]) < self.get(min_field):
				frappe.throw("{0} must be greater than {1}".format(max_field[1], max_field[2]))

	def on_update(self):
		if self.get("property_details") and self.lead_status == "Unprocessed":
			self.lead_status = "Processed"
			frappe.db.set_value("Lead Management",self.name,"lead_status","Processed")
			

@frappe.whitelist()
def get_se_details(assign_to=None):
	se_details = frappe.db.sql("""select name, visiter, schedule_date from `tabSite Visit` where
								visiter='%s' and schedule_date>='%s'"""%(assign_to,nowdate()),as_dict=1)
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
			doctype ='Site Visit'
			name = schedule_se_visit(i,assign_to,parent,doctype,schedule_date)
			update_se_status_in_leadform(i,name,assign_to,schedule_date)
			lead_record = frappe.get_doc("Lead Management", parent)
			child_id = frappe.get_doc("Lead Property Details",i)
			se_visit = frappe.get_doc("Site Visit",name)
			notify_lead_about_sv(lead_record,se_visit,child_id,assign_to)
			notify_se_about_sv(lead_record,se_visit,child_id,assign_to)
			# if name:
			# 	create_to_do(assign_to,name,doctype)
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

def notify_lead_about_sv(lead_record,se_visit,child_id,assign_to):
	user = frappe.get_doc("User",assign_to)
	se_name = ' '.join([user.first_name,userlast_name]) if user.first_name and user.last_name else user.first_name	
	msg = get_sms_template("Lead Site Visit",{"site_visit":se_visit.schedule_date,"se_name":se_name,"se_mobile":user.mobile_no})
	if lead_record.mobile_no:
		rec_list = []
		rec_list.append(lead_record.mobile_no)
		send_sms(rec_list,msg=msg)	

def notify_se_about_sv(lead_record,se_visit,child_id,assign_to):
	user = frappe.get_doc("User",assign_to)
	print user.name,user.mobile_no
	msg = get_sms_template("SE",{"lead_name":lead_record.lead_name,"lead_mobile":lead_record.mobile_no,
		"property_title":child_id.property_name,"prop_address":child_id.address,"se_datetime":se_visit.schedule_date})
	if user.mobile_no:
		rec_list = []
		rec_list.append(user.mobile_no)
		send_sms(rec_list,msg=msg)		


def update_se_status_in_leadform(source_name,se_visit,assign_to,schedule_date):
	lead_name = frappe.get_doc("Lead Property Details", source_name)
	lead_name.se_status = 'Scheduled'
	lead_name.prev_sv_no = lead_name.site_visit
	lead_name.site_visit = se_visit
	lead_name.site_visit_assignee = assign_to
	lead_name.se_date = datetime.datetime.strptime(cstr(schedule_date),'%d-%m-%Y %H:%M:%S')
	lead_name.schedule_se = 0
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
			doctype ='ACM Visit'
			name = schedule_se_visit(i,assign_to,parent,doctype,schedule_date)
			update_acm_status_in_leadform(i,name,assign_to,schedule_date)
			lead_record = frappe.get_doc("Lead Management", parent)
			child_id = frappe.get_doc("Lead Property Details",i)
			se_visit = frappe.get_doc("ACM Visit",name)
			notify_lead_about_acm(lead_record,se_visit,child_id,assign_to)
			notify_acm_about_acm(lead_record,se_visit,child_id,assign_to)
			if name:
				create_to_do(assign_to,name,doctype)
		return {"Status":'Available'}

def notify_lead_about_acm(lead_record,se_visit,child_id,assign_to):
	user = frappe.get_doc("User",assign_to)
	acm_name = ' '.join([user.first_name,userlast_name]) if user.first_name and user.last_name else user.first_name
	msg = get_sms_template("Lead ACM",{"meeting_time":se_visit.schedule_date,
		"acm_name":acm_name,"acm_no":user.mobile_no})
	if lead_record.mobile_no:
		rec_list = []
		rec_list.append(lead_record.mobile_no)
		send_sms(rec_list,msg=msg)	

def notify_acm_about_acm(lead_record,se_visit,child_id,assign_to):
	user = frappe.get_doc("User",assign_to)
	msg = get_sms_template("ACM",{"lead_name":lead_record.lead_name,"lead_mobile":lead_record.mobile_no,
		"property_title":child_id.property_name,"prop_address":child_id.address,"acm_datetime":se_visit.schedule_date})
	if user.mobile_no:
		rec_list = []
		rec_list.append(user.mobile_no)
		send_sms(rec_list,msg=msg)

def update_acm_status_in_leadform(source_name,acm_visit,assign_to,schedule_date):
	lead_name = frappe.get_doc("Lead Property Details", source_name)
	lead_name.acm_status = 'Scheduled'
	lead_name.prev_acm_no = lead_name.acm_visit
	lead_name.acm_visit = acm_visit
	lead_name.acm_visit_assignee = assign_to
	lead_name.schedule_acm = 0
	lead_name.acm_date = datetime.datetime.strptime(cstr(schedule_date),'%d-%m-%Y %H:%M:%S')
	lead_name.save()

def sales_executive_query(doctype, txt, searchfield, start, page_len, filters):
	from frappe.desk.reportview import get_match_cond
	txt = "%{}%".format(txt)
	if filters.get("location"):
		location_names = filters.get("location").split(',')
		condition = ",".join('"{0}"'.format(loc) for loc in location_names)
		return frappe.db.sql("""select usr.name, concat_ws(' ', usr.first_name, usr.middle_name, usr.last_name)
			from `tabUser` usr,
			`tabLocation` loc
			where 
				usr.name = loc.parent
				and usr.name not in ("Guest", "Administrator")
				and usr.user_type != 'Website User'
				and usr.name in (select parent from `tabUserRole` where role='Sales Executive' and parent!='Administrator' and parent!='Guest')
				and loc.location in ({condition}) 
			""".format(standard_users=", ".join(["%s"]*len(STANDARD_USERS)),condition= condition,
				key=searchfield))
	else:
		return frappe.db.sql("""select usr.name, concat_ws(' ', usr.first_name, usr.middle_name, usr.last_name)
			from `tabUser` usr,
			`tabLocation` loc
			where 
				usr.name = loc.parent
				and usr.name not in ("Guest", "Administrator")
				and usr.user_type != 'Website User'
				and usr.name in (select parent from `tabUserRole` where role='Sales Executive' and parent!='Administrator' and parent!='Guest')
			""".format(standard_users=", ".join(["%s"]*len(STANDARD_USERS)),condition= condition,
				key=searchfield))


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
						area_minimum=None,area_maximum=None,budget_minimum=None,budget_maximum=None,lead_name=None):
	
	users =  frappe.db.sql("""select parent from `tabUserRole` where role='System Manager' 
						and parent!='Administrator'""",as_list=1)
	if users:
		for user_id in users:
			create_email(user_id[0],property_type,property_subtype,location,operation,
						area_minimum,area_maximum,budget_minimum,budget_maximum)
		pc = frappe.new_doc("Property Confirmation")
		pc.property_type = property_type
		pc.property_subtype = property_subtype
		pc.operation = operation
		pc.location = location
		pc.area_minimum = area_minimum
		pc.area_maximum = area_maximum
		pc.budget_minimum = budget_minimum
		pc.budget_maximum = budget_maximum
		pc.lead_name = lead_name
		pc.first_name = frappe.db.get_value("Lead",{"name":lead_name},"lead_name")
		pc.insert(ignore_permissions=True)

def create_email(user_id,property_type=None,property_subtype=None,location=None,operation=None,
						area_minimum=None,area_maximum=None,budget_minimum=None,budget_maximum=None):
	
	user_name = frappe.db.get_value("User", frappe.session.user, ["first_name", "last_name"],as_dict=True)
	args = { "title":"Property Search Criteria Shared By  {0}" .format(frappe.session.user) , "property_type":property_type ,"property_subtype":property_subtype,"budget_maximum":budget_maximum,"budget_minimum":budget_minimum,"area_minimum":area_minimum,"area_maximum":area_maximum,"location":location,"operation":operation,"first_name":user_name.get("first_name"), "last_name":user_name.get("last_name")}
	send_email(user_id, "Property Search Criteria Shared With you", "/templates/search_criteria_shared.html", args)
	return True

def send_email(email, subject, template, args):
	frappe.sendmail(recipients=email, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))
	
@frappe.whitelist()
def update_details(prop_list=None,followup_type=None,followup_date=None):
	properties = json.loads(prop_list)
	for i in properties:
		lead_property = frappe.get_doc("Lead Property Details", i.get('name'))
		if followup_type=='Follow-Up For Share':
			lead_property.share_followup_status = i.get('status')
			lead_property.share_followup_date = datetime.datetime.strptime(cstr(followup_date),'%d-%m-%Y')
			if i.get("status") in ["Intrested"]:
				lead_property.schedule_se = 0
		elif followup_type=='Follow-Up For SE':
			lead_property.se_follow_up_status = i.get('status')
			lead_property.se_followup_date = datetime.datetime.strptime(cstr(followup_date),'%d-%m-%Y')
			if i.get("status") in ["Reschedule","Intrested"]:
				lead_property.schedule_se = 1
		else:
			lead_property.acm_followup_status = i.get('status')
			lead_property.acm_followup_date = datetime.datetime.strptime(cstr(followup_date),'%d-%m-%Y')
			if i.get("status") in ["Reschedule"]:
				lead_property.schedule_acm = 1
		lead_property.save(ignore_permissions=True)


	return True

@frappe.whitelist()
def update_followup_date(prop_list=None,followup_type=None,followup_date=None,doc_name=None):
	properties = json.loads(prop_list)
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
	# lmdoc = frappe.get_doc("Lead Management",doc_name)
	# lmdoc.lead_status = 'Processed'
	# lmdoc.save(ignore_permissions=True)
			

def has_permission(doc, ptype, user):
	# print get_permitted_and_not_permitted_links(doc.doctype)
	links = get_permitted_and_not_permitted_links(doc.doctype)
	if not links.get("not_permitted_links"):
		# optimization: don't determine permissions based on link fields
		return True

	# True if any one is True or all are empty
	names = []
	for df in (links.get("permitted_links") + links.get("not_permitted_links")):
		doctype = df.options
		name = doc.get(df.fieldname)

		names.append(name)

		if name and frappe.has_permission(doctype, ptype, doc=name):
			return True

	if not any(names):
		return True

	else:
		return False





def get_permitted_and_not_permitted_links(doctype):
	permitted_links = []
	not_permitted_links = []

	meta = frappe.get_meta(doctype)
	# print meta
	# print meta.get_link_fields()
	for df in meta.get_link_fields():
		print df.as_dict()
		# if df.options not in ("Customer", "Supplier", "Sales Partner"):
		# 	continue

		print frappe.has_permission(df.options)
		if frappe.has_permission(df.options):
			permitted_links.append(df)
		else:
			not_permitted_links.append(df)

	return {
		"permitted_links": permitted_links,
		"not_permitted_links": not_permitted_links
	}	

def get_permission_query_conditions(user):
	if not user: user = frappe.session.user
	"""
		Filter condition for user
	"""
	#pass
	if not user == 'Administrator':
		return """(`tabLead Management`.consultant ='{0}')""".format(user)

@frappe.whitelist()
def get_total_lms():
	cond = ''
	cond = build_conds(cond)
	stat_list=["Total Lead Allocations"]
	count = frappe.db.sql("""select count(*) 
		from `tabLead Management` {0}""".format(cond),as_list=1)[0][0]
	stat_list.append(count)
	return {"field":"total","label":"Total","stat":[stat_list]}

def build_conds(cond):
	if 'Consultant' in frappe.get_roles(frappe.session.user) and not frappe.session.user =="Administrator":
		cond += "where consultant='%s'"%frappe.session.user
	return cond



