# Copyright (c) 2013, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from  propshikari.propshikari.property_update_api import get_agent_properties
import json
import re
from frappe import _

def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_result(filters)
	return columns, data



def get_result(filters):
	if filters.get("agent")
		res = frappe.db.sql(""" select 
								usr.name, usr.first_name, usr.last_name, 
								usr.mobile_no, sp.visiting_date ,sp.property_id, sp.property_title
								from `tabShow Contact Property` as sp join `tabUser` as usr  
								on sp.user_id = usr.user_id
								{0} order by sp.visiting_date desc			
							 """.format(get_conditions(filters)),as_list=1)
	return res if res else [[]]




def get_conditions(filters):
	cond = ''
	if filters.get("property_id"):
		cond = "where sp.property_id='{0}' ".format(filters.get("property_id"))
	elif filters.get("agent"):
		user_id = frappe.db.get_value("User", filters.get("agent"), "user_id")
		agent_properties = get_agent_properties(json.dumps({"user_id":user_id}))
		if agent_properties:
			cond_build = ", ".join(['"{0}"'.format(prop.property_id) for prop in agent_properties.get("data")])
			cond = "where sp.property_id in ({})".format(cond_build)
	return cond	




def get_columns():
	return [_("User") + ":Link/User:200",
			_("First Name") + ":Data:100",
			_("Last Name") + ":Data:120", 
			_("Contact No") + ":Data:160",
			_("Visiting Date") + ":Datetime:200",
			_("Property Id") + ":Data:180",
			_("Property Title") + ":Data:200",
		   ]



def get_my_properties(doctype, txt, searchfield, start, page_len, filters):
	user_id = frappe.db.get_value("User", filters.get("agent"), "user_id")
	res_list = []
	if user_id:
		request_data = json.dumps({"user_id":user_id})
		response = get_agent_properties(request_data)
		for prop in response.get("data"):
			if re.search(txt, prop.get("property_id"), re.IGNORECASE) or re.search(txt, prop.get("property_title"), re.IGNORECASE): 
				res_list.append([prop.get("property_id"),prop.get("property_title")])
	return res_list


def get_agent_list(doctype, txt, searchfield, start, page_len, filters):
	if frappe.db.get_value("Agent", frappe.session.user, "name"):
		return [[frappe.session.user]]
	return frappe.get_all("Agent",fields= ['name'], as_list=1)