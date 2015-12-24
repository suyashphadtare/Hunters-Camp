frappe.provide("hc.hc_summary");
frappe.pages['hc_summary'].on_page_load = function(parent) {
	hc.hc_summary = new hc.hc_summary(parent);
};	

hc.hc_summary = Class.extend({
	init: function(parent) {
		this.parent = parent;
		this.get_data_for_report();
	},
	get_data_for_report: function() {
		var me = this;
		return frappe.call({
			method: "hunters_camp.hunters_camp.page.hc_summary.hc_summary.get_data",
			callback: function(r) {
				var data = r.message;
				me.make_page();
				me.render_data(data);
			}
		});
	},
	make_page: function() {
		if (this.page)
			return;
		frappe.ui.make_app_page({
			parent: this.parent,
			title: 'Hunters Camp Summary',
			single_column: true
		});
		this.page = this.parent.page;
		this.wrapper = $('<div></div>').appendTo(this.page.main);
	},
	render_data: function(data) {
		var me = this;
		$(frappe.render_template("hc_summary", {data:data})).appendTo(me.wrapper);
	}
})