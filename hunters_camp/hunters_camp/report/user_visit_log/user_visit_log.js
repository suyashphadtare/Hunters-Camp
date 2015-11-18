// Copyright (c) 2013, GNU and contributors
// For license information, please see license.txt

frappe.query_reports["User Visit Log"] = {
	"filters": [
			{
			"fieldname":"agent",
			"label": __("Agent"),
			"fieldtype": "Link",
			"options": "Agent",
			"reqd": 1,
			"get_query": function() {
				return {
					"query": "hunters_camp.hunters_camp.report.user_visit_log.user_visit_log.get_agent_list",
				}
			}
		},
		{
			"fieldname":"property_id",
			"label": __("Property ID"),
			"fieldtype": "Link",
			"options":"Property",
			"get_query": function() {
				return {
					"query": "hunters_camp.hunters_camp.report.user_visit_log.user_visit_log.get_my_properties",
					"filters":{"agent":frappe.query_report.filters_by_name.agent.get_value()}
				}
			}
		},

	]
}
