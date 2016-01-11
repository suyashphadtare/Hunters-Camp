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
	return frappe.db.sql("""select 
		group_title,operation,
		property_type,property_subtype,
		property_subtype_option,
		location,
		min_area,max_area,
		min_budget,max_budget,
		unit_of_area 
		from `tabGroup`""",as_list=1)


def get_columns():
	return [_("Group Title") + ":Data:200",
			_("Operation") + ":Data:100",
			_("Property Type") + ":Data:100", 
			_("Property Subtype") + ":Data:100",
			_("Property Subtype Option") + ":Data:100",
			_("Location") + ":Data:100",
			_("Min Area") + ":Data:100",
			_("Max Area") + ":Data:100",
			_("Min Budget") + ":Data:100",
			_("Max Budget") + ":Data:100",
			_("Unit Of Area") + ":Data:100",
			_("Status") + ":Data:100",
			#_("Total Users in Group") + ":Data:100",
		   ]



