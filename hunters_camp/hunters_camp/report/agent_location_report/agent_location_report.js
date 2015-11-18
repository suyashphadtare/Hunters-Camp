// Copyright (c) 2013, GNU and contributors
// For license information, please see license.txt

frappe.query_reports["Agent Location Report"] = {
	"filters": [
		{
			"fieldname":"state",
			"label": __("State"),
			"fieldtype": "Link",
			"options": "State"

		},
		{
			"fieldname":"city",
			"label": __("City"),
			"fieldtype": "Link",
			"options": "City",
			"get_query": function() {
				return {
					"filters":{"state_name":frappe.query_report.filters_by_name.state.get_value()}
				}
			}
		},
		{
			"fieldname":"location",
			"label": __("Location"),
			"fieldtype": "Link",
			"options": "Area",
			"get_query": function() {
				return {
					"filters":{
								"state_name":frappe.query_report.filters_by_name.state.get_value(),
								"city_name":frappe.query_report.filters_by_name.city.get_value()
							}
				}
			}
		}

	]
}
