// Copyright (c) 2013, GNU and contributors
// For license information, please see license.txt

frappe.query_reports["Builder Properties"] = {
		"filters": [
			{
			"fieldname":"agent",
			"label": __("Builder"),
			"fieldtype": "Link",
			"options": "User",
			"reqd": 1,
			"get_query": function() {
				return {
						"query": "hunters_camp.hunters_camp.report.builder_properties.builder_properties.get_builders",	
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


function get_on_click_trigger(property_id){
return frappe.call({
			type: 'GET',
			method:'hunters_camp.hunters_camp.doctype.property.property.view_property',
			args: {
				'property_id':property_id,
				'sid':frappe.get_cookie('sid')
			},
			freeze: true,
			callback: function(r) {
				if(!r.exc) {
					var doc = frappe.model.sync(r.message);
					frappe.route_options = {'doc':doc};
					frappe.set_route('Form','Property','Property');
				}
			}
		})

}