// Copyright (c) 2013, GNU and contributors
// For license information, please see license.txt

frappe.query_reports["Builder Projects"] = {
		"filters": [
			{
			"fieldname":"agent",
			"label": __("Builder"),
			"fieldtype": "Link",
			"options": "User",
			"reqd": 1,
			"get_query": function() {
				return {
						"query": "hunters_camp.hunters_camp.report.builder_projects.builder_projects.get_builders",	
						"filters":{"builder_flag":inList(user_roles, "Builder")}
					}
			}
		},
		{
			"fieldname":"project_id",
			"label": __("Project ID"),
			"fieldtype": "Link",
			"options":"Property",
			"get_query": function() {
				return {
					"query": "hunters_camp.hunters_camp.report.builder_projects.builder_projects.get_my_projects",
					"filters":{"agent":frappe.query_report.filters_by_name.agent.get_value()}
				}
			}
		},

	]
}


function get_on_click_trigger(project_id){
return frappe.call({
			type: 'GET',
			method:'hunters_camp.hunters_camp.doctype.projects.projects.view_project',
			args: {
				'project_id':project_id,
				'sid':frappe.get_cookie('sid')
			},
			freeze: true,
			callback: function(r) {
				if(!r.exc) {
					var doc = frappe.model.sync(r.message);
					frappe.route_options = {'doc':doc};
					frappe.set_route('Form','Projects','Projects');
				}
			}
		})

}