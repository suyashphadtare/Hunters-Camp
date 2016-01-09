// Copyright (c) 2013, GNU and contributors
// For license information, please see license.txt

frappe.query_reports["Groups User"] = {
	"filters": [
		{
			"fieldname":"group",
			"label": __("Group"),
			"fieldtype": "Link",
			"options": "Group",
			"reqd": 1,
		}
	]
}
