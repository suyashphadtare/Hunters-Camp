// Copyright (c) 2013, GNU and contributors
// For license information, please see license.txt

frappe.query_reports["Followup Log"] = {
	"filters": [

		{
			"fieldname":"type_followup",
			"label": __("Type Of Followup"),
			"fieldtype": "Select",
			"options": "\nFollow Up For Share\nFollow Up For SE\nFollow Up For ACM"
		},

		{
			"fieldname":"followup_date",
			"label": __("Followup Date"),
			"fieldtype": "Date"
		},

	]
}
