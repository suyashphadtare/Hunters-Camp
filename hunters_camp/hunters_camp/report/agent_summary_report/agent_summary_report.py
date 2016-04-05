# Copyright (c) 2013, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
import json
from  propshikari.propshikari.property_update_api import get_agent_properties
from  propshikari.propshikari.propshikari_api import get_property_of_given_id


def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_results(filters)
	return columns, data




def get_columns():
	return [
			_("Agent") + ":Link/Agent:200",
			_("Location") + ":Data:250",
			_("Property Posted Count") + ":Data:150", 
			_("No Of Leads") + ":Data:160",
			_("Agent Package") + ":Link/Package:120" ]


def get_results(filters):
	results = frappe.db.sql(""" select ag.name, group_concat(aop.location_name) as location, 
	 							ag.user_id ,ag.first_name, ag.package_name
	 							from `tabAgent` as ag  join `tabArea Of Operaation` as aop
	 							on ag.name = aop.parent
	 							group by ag.name	""",as_list=1)
	for agent in results:
		request_data = json.dumps({"user_id":agent[2]})
		agent_data = get_agent_properties(request_data)
		agent[2] = agent_data.get("total_records", 0)
	return results	

