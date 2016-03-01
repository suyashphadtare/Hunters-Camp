frappe.listview_settings["Property Confirmation"] = {
	onload: function(listview) {
		new property_confirmation.Composer({
		action:"allocate",
		})

	},
}

frappe.provide("property_confirmation")
property_confirmation.Composer = Class.extend({
	init: function(opts) {
		$.extend(this, opts);
		if (this.action == 'allocate'){
			this.enquiry_count
			 
		}
	},

	}); 

	 

	 

	 




