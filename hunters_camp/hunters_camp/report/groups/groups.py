# Copyright (c) 2013, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	columns, data = [], []
	return columns, data

def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_result(filters)
	data = get_location_names_user_count(data)
	return columns, data


def get_columns():
	return [
			_("Group Id") + ":Link/Group:100",
			_("Group Title") + ":Data:200",
			_("Operation") + ":Data:100",
			_("Property Type") + ":Data:100", 
			_("Property Subtype") + ":Data:100",
			_("Property Subtype Option") + ":Data:100",
			_("Location") + ":Data:100",
			_("Min Area") + ":Data:50",
			_("Max Area") + ":Data:50",
			_("Min Budget") + ":Data:50",
			_("Max Budget") + ":Data:50",
			_("Unit Of Area") + ":Data:100",
			_("Status") + ":Data:100",
			_("Total Users in Group") + ":Data:50",
		   ]

def get_result(filters):
	return frappe.db.sql("""select 
		name,group_title,operation,
		property_type,property_subtype,
		property_subtype_option,
		ifnull(location, "") as location,
		min_area,max_area,
		min_budget,max_budget,
		unit_of_area,status 
		from `tabGroup`""",as_list=1)



def get_location_names_user_count(data):
	for group in data:
		if group[6]:
			group[6] = get_location_names(group[6])
		group.append(get_user_count(group[0]))	
	return data 

def get_location_names(locations):
	location_ids = locations.split(',')
	location_names = []
	[location_names.append(frappe.db.get_value("Area",{"name":loc_id},"area")) for loc_id in location_ids]
	locations = ",".join('{0}'.format(loc) for loc in location_names)
	return locations

def get_user_count(group_id):
	user_count = frappe.db.sql("""select count(*) from 
		`tabGroup User` where group_id='{0}'""".format(group_id),as_list=1)[0][0]
	return user_count