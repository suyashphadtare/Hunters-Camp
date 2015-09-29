# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
import datetime
import json

STANDARD_USERS = ("Guest", "Administrator")


class LeadManagement(Document):
	pass


@frappe.whitelist()
def make_visit(doc=None,lead=None,lead_name=None,mobile_no=None,address=None,address_details=None,customer=None,customer_contact=None,contact_details=None,
				customer_contact_no=None,customer_address=None,customer_address_details=None,enquiry_id=None,consultant=None,
				enquiry_from=None,assign_to=None,property_id=None,property_name=None,area=None,price=None,property_address=None,
				bhk=None,bathroom=None,posting_date=None,button_name=None,completion_date=None,property_doc=None,location=None):
	if button_name  == 'SE Visit':
		doctype = 'Site Visit'
		name = schedule_se_visit(doctype,doc,lead,lead_name,mobile_no,address,address_details,customer,customer_contact,contact_details,
				customer_contact_no,customer_address,customer_address_details,enquiry_id,consultant,
				enquiry_from,assign_to,property_id,property_name,area,price,property_address,
				bhk,bathroom,posting_date,button_name,completion_date,location)
		update_se_status_in_leadform(property_doc)
		if name:
			return name
	elif button_name == 'ACM Visit':
		doctype = 'ACM Visit'
		name = schedule_se_visit(doctype,doc,lead,lead_name,mobile_no,address,address_details,customer,customer_contact,contact_details,
				customer_contact_no,customer_address,customer_address_details,enquiry_id,consultant,
				enquiry_from,assign_to,property_id,property_name,area,price,property_address,
				bhk,bathroom,posting_date,button_name,completion_date,location)
		update_acm_status_in_leadform(property_doc)
		if name:
			return name


def schedule_se_visit(doctype,doc,lead,lead_name,mobile_no,address,address_details,customer,customer_contact,contact_details,
				customer_contact_no,customer_address,customer_address_details,enquiry_id,consultant,
				enquiry_from,assign_to,property_id,property_name,area,price,property_address,
				bhk,bathroom,posting_date,button_name,completion_date,location):
	se_visit = frappe.get_doc({
		"doctype":doctype ,
		"lead":lead,
		"lead_name": lead_name,
		"mobile_no":mobile_no,
		"address":address,
		"address_details":address_details,
		"customer":customer,
		"customer_contact":customer_contact,
		"contact_details":contact_details,
		"customer_contact_no": customer_contact_no,
		"customer_address": customer_address,
		"customer_address_details":customer_address_details,
		"property_id": property_id,
		"property_name": property_name,
		"area": area,
		"bhk": bhk,
		"bathroom": bathroom,
		"price": price,
		"property_address": property_address,
		"enquiry_id":enquiry_id,
		"consultant": consultant,
		"form_posting_date":nowdate(),
		"lead_management_id":doc,
		"enquiry_from": enquiry_from ,
		"visiter": assign_to,
		"location": location,
		"posting_date":posting_date,
		"schedule_date": datetime.datetime.strptime(cstr(completion_date),'%d-%m-%Y')
	})

	se_visit.insert(ignore_permissions=True)
	se_visit.save()
	return se_visit.name
	

def update_se_status_in_leadform(source_name):
	lead_name = frappe.get_doc("Lead Property Details", source_name)
	lead_name.se_status = 'Scheduled'
	lead_name.save()

def update_acm_status_in_leadform(source_name):
	lead_name = frappe.get_doc("Lead Property Details", source_name)
	lead_name.acm_status = 'Scheduled'
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
			and name in (select parent from `tabUserRole` where role='Sales Executive')
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


def acm_query(doctype, txt, searchfield, start, page_len, filters):
	from frappe.desk.reportview import get_match_cond
	txt = "%{}%".format(txt)
	return frappe.db.sql("""select name, concat_ws(' ', first_name, middle_name, last_name)
		from `tabUser`
		where ifnull(enabled, 0)=1
			and docstatus < 2
			and name not in ({standard_users})
			and user_type != 'Website User'
			and name in (select parent from `tabUserRole` where role='Account Closure Manager')
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


@frappe.whitelist()
def get_diffrent_property(data=None,lead_management=None):
	property_id_list = frappe.db.sql("""select property_id from `tabLead Property Details` 
		where parent='%s' """%lead_management,as_dict=1)
	if property_id_list:

		return {"property_id": property_id_list}

@frappe.whitelist()
def get_administartor(property_type=None,property_subtype=None,location=None,operation=None,
						area_minimum=None,area_maximum=None,budget_minimum=None,budget_maximum=None):
	
	users =  frappe.db.sql("""select parent from `tabUserRole` where role='System Manager' 
						and parent!='Administrator'""",as_list=1)
	frappe.errprint(users)
	if users:
		for user_id in users:
			frappe.errprint(user_id[0])
			create_email(user_id[0],property_type,property_subtype,location,operation,
						area_minimum,area_maximum,budget_minimum,budget_maximum)

def create_email(user_id,property_type=None,property_subtype=None,location=None,operation=None,
						area_minimum=None,area_maximum=None,budget_minimum=None,budget_maximum=None):
	style_data= """table, th, td {
			    border: 1px solid black;
			    border-collapse: collapse;
			}
			th, td {
			    padding: 5px;
			}"""
	msg="""Hello, 
		here is no any property is available for the specified serach criteria-
			<html>
			<head>
			<style>{style_data}</style>
			</head>
			<body>
			<table style="width:100%">
			<tr>
				<th>Property Type</th>
				<th>Property Subtype</th>
				<th>Location</th>
				<th>Operation</th>
				<th>Area Minimum</th>
				<th>Area Maximum</th>
				<th>Budget Minimum</th>
				<th>Budget Maximum</th>
			</tr>
			<tr>
				<td>{property_type}</td>	
				<td>{property_subtype}</td>
				<td>{location}</td>
				<td>{operation}</td>
				<td>{area_minimum}</td>
				<td>{area_maximum}</td>	
				<td>{budget_minimum}</td>
				<td>{budget_maximum}</td>	
			</tr>
			</table>
			</body>
			</html>""".format(style_data=style_data,property_type=property_type,property_subtype=property_subtype,location=location,operation=operation,area_minimum=area_minimum,area_maximum=area_maximum,budget_minimum=budget_minimum,budget_maximum=budget_maximum)


	# frappe.errprint(msg)
	frappe.sendmail(user_id,subject='Property Serach Criteria',message=msg)