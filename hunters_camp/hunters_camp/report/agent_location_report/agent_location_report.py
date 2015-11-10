# Copyright (c) 2013, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data =get_result(filters)
	return columns, data








def get_result(filters):
	res = frappe.db.sql(""" select ag.name, ag.first_name, ag.last_name, ag.contact_no, group_concat(aop.location_name) 
		 					from `tabAgent` as ag  join `tabArea Of Operaation` as aop
		 					on ag.name = aop.parent
		 					where ag.name != '{0}'	and ag.status= 'Active' {1}
		 					group by ag.name	
						 """.format(frappe.session.user, get_conditions(filters)),as_list=1)
	return res




def get_conditions(filters):
	cond = ''
	if filters.get("location"):
		cond += "and aop.location='{0}' ".format(filters.get("location"))
	if filters.get("city"):
		cond += "and aop.city='{0}' ".format(filters.get("city"))
	if filters.get("state"):
		cond += "and aop.state='{0}' ".format(filters.get("state"))			
	return cond	



def get_columns():
	return [_("Agent") + ":Link/Agent:200",
			_("First Name") + ":Data:100",
			_("Last Name") + ":Data:120", 
			_("Contact No") + ":Data:160",
			_("Location") + ":Data:250"
		   ]