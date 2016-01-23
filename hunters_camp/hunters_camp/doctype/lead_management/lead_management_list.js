frappe.listview_settings["Lead Management"] = {
	refresh: function(listview) {
		wrapper = $(listview.page.sidebar).find('.list-sidebar')
		frappe.call({
			method:"hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_total_lms",
			callback: function(r) {
				if (r.message){
					$(frappe.render_template("list_sidebar_stat",r.message)).appendTo(wrapper)	
				}
			}
		});
	}
}