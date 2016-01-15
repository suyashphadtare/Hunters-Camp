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
	return columns, data



def get_result(filters):
	if filters.get("group"):
		return frappe.db.sql("""SELECT 
			`tabGroup`.name,
			`tabGroup`.group_title,
			`tabUser`.first_name,
			`tabUser`.last_name,
			`tabUser`.mobile_no,
			`tabUser`.email,
			`tabUser`.area  
			FROM `tabGroup User`
				left join `tabUser` on(
					`tabGroup User`.user = `tabUser`.name
				)
				left join `tabGroup` on(
					`tabGroup User`.group_id = `tabGroup`.name
				)
			WHERE `tabGroup User`.group_id ='{0}'""".format(filters.get("group")),as_list=1)

def get_columns():
	return [
			_("Group Id") + ":Link/Group:200",
			_("Group Title") + ":Data:200",
			_("First Name") + ":Data:100",
			_("Last Name") + ":Data:100", 
			_("Mobile No") + ":Data:100",
			_("Email ID") + ":Data:100",
			_("Location") + ":Data:100",
		]
