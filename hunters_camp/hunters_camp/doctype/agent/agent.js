

frappe.ui.form.on("Agent", {
	
	onload: function(frm) {
		console.log("in onload")
	},
	refresh:function(frm){
		if(!frm.doc.__islocal && !frappe.user.has_role("Agent")){

			cur_frm.add_custom_button(__('Assign Package'), cur_frm.cscript.assign_package).addClass("btn-primary");	
			
		}
	}

});

cur_frm.cscript.assign_package = function(){
		return frappe.call({
		method: "hunters_camp.hunters_camp.doctype.agent.agent.get_agent_package",
		args: {
			"agent_name": cur_frm.doc.name
		},
		callback: function(r) {
			var doclist = frappe.model.sync(r.message);
			frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
		}
	});
}

cur_frm.fields_dict.user.get_query = function(doc){
	return {
		method:"hunters_camp.hunters_camp.doctype.agent.agent.get_agent_list"
	}

}
cur_frm.add_fetch("user", "user_id", "user_id")
cur_frm.add_fetch("user", "first_name", "first_name")
cur_frm.add_fetch("user", "last_name", "last_name")
cur_frm.add_fetch("user", "mobile_no", "contact_no")
cur_frm.add_fetch("location", "city_name", "city")
cur_frm.add_fetch("location", "state_name", "state")
cur_frm.add_fetch("location", "area", "location_name")