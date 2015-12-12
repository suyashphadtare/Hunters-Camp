# Copyright (c) 2013, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
import json
import re
from  propshikari.propshikari.property_update_api import get_builder_projects
from  propshikari.propshikari.project_api import get_project_of_given_id


def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_result(filters)
	return columns, data



def get_result(filters):
	user_id = frappe.db.get_value("User", filters.get("agent"), "user_id")
	res_list = []
	if user_id:
		request_data = json.dumps({"user_id":user_id, "project_id":filters.get("project_id")})
		if not filters.get("project_id"):
			response = get_builder_projects(request_data) 
		else: 
			try:
				response = get_project_of_given_id(request_data)
			except Exception,e:
				frappe.throw(e)
			response["data"] = [response.get("data")]
		for prop in response.get("data"):
			proj_id = prop.get("project_id")
			project_id = "<a onclick=get_on_click_trigger('{0}')>{0}</a>".format(proj_id)
			res_list.append([ project_id , prop.get("overview"), prop.get("project_type"),
							prop.get("project_subtype"), prop.get("project_by"), prop.get("location"), 
							prop.get("status")])
			
	return res_list





def get_columns():
	return [_("Project Id") + ":Data:200",
			_("Project Title") + ":Data:200",
			_("Project Type") + ":Data:120", 
			_("Project Subtype") + ":Data:160",
			_("Project By") + ":Link/User:140",
			_("Location") + ":Data:100",
			_("Status") + ":Data:100",
		   ]



def get_my_projects(doctype, txt, searchfield, start, page_len, filters):
	user_id = frappe.db.get_value("User", filters.get("agent"), "user_id")
	res_list = []
	if user_id:
		request_data = json.dumps({"user_id":user_id})
		response = get_builder_projects(request_data)
		for prop in response.get("data"):
			if re.search(txt, prop.get("project_id"), re.IGNORECASE) or re.search(txt, prop.get("overview"), re.IGNORECASE): 
				res_list.append([prop.get("project_id"),prop.get("overview")])
	return res_list



@frappe.whitelist()
def get_builders(doctype, txt, searchfield, start, page_len, filters):
	if frappe.session.user == "Administrator":
		return frappe.db.sql("""select usr.name, concat_ws(' ', usr.first_name, usr.middle_name, usr.last_name)
			from `tabUser` usr
			where usr.name not in ("Guest", "Administrator")
				and usr.user_type != 'Website User'
				and usr.name in (select parent from `tabUserRole` where role='Builder' and parent!='Administrator' and parent!='Guest') 
				and {0} like '{1}' """.format(searchfield,"%%%s%%" % txt))
	else:
		return [[frappe.session.user]]