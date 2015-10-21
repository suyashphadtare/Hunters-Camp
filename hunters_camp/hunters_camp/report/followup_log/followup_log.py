# Copyright (c) 2013, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _


def execute(filters=None):
	columns = get_columns()
	filter_details = get_filter_conditions(filters)
	lm_entries = get_followup_details(filters)
	
	data = []
	if lm_entries:
		return columns, lm_entries
	else:
		lm_entries = []
		return columns, lm_entries


def get_columns():
	return [ _("Property ID") + "::200",_("Lead") + ":Link/Lead:130",_("Lead Name") + "::130", 
			_("Email ID") + "::100", _("Mobile No") + "::100"]

def get_followup_details(filters):
	if filters.get("type_followup") == 'Follow Up For Share':
		return frappe.db.sql("""select pd.property_id,lm.lead,lm.lead_name,lm.email_id,lm.mobile_no from `tabLead Property Details` as pd,
			`tabLead Management` as lm where pd.share_followup_date ='%s'
					and pd.parent=lm.name"""%filters.get("followup_date"))

	elif filters.get("type_followup") == 'Follow Up For SE':
		return frappe.db.sql("""select pd.property_id,lm.lead,lm.lead_name,lm.email_id,lm.mobile_no from `tabLead Property Details` as pd,
			`tabLead Management` as lm where pd.se_followup_date ='%s'
					and pd.parent=lm.name"""%filters.get("followup_date"))

	elif filters.get("type_followup") == 'Follow Up For ACM':
		return frappe.db.sql("""select pd.property_id,lm.lead,lm.lead_name,lm.email_id,lm.mobile_no from `tabLead Property Details` as pd,
			`tabLead Management` as lm where pd.acm_followup_date ='%s'
					and pd.parent=lm.name"""%filters.get("followup_date"))

	else:
		return None


def get_filter_conditions(filters):
	conditions = []
	if filters.get("type_followup"):
		conditions.append("type_followup='%(type_followup)s'"%filters)
	if filters.get("followup_date"):
		conditions.append("followup_date='%(followup_date)s'"%filters)

	return " and "+" and ".join(conditions) if conditions else ""