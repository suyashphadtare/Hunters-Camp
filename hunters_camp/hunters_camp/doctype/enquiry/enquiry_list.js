frappe.listview_settings["Enquiry"] = {
	onload: function(listview) {
		listview.page.add_inner_button(__("Allocate Lead"), function() { 
			new enquiry.Composer({
				action:"allocate",
			})
		});
		
	},
}

frappe.provide("enquiry")
enquiry.Composer = Class.extend({
	init: function(opts) {
		$.extend(this, opts);
		if (this.action == 'allocate'){
			this.enquiry_count
			this.get_count()
			//this.make()
		}
	},

	get_count: function(){
		var me=this
		frappe.call({
			method:"hunters_camp.hunters_camp.doctype.enquiry.enquiry.get_non_allocated_enquiry",
			callback: function(r,rt) {
				me.enquiry_count=r.message
				me.make(r.message)
			}
		});

	},

	make: function(count) {
		var me = this;
		this.dialog = new frappe.ui.Dialog({
			title: __("Allocate Lead"),
			fields: [
				{fieldtype:'HTML', fieldname:'enquiry_count',options:'<div id="count"></div>', label:__('Total Not Allocated Enquiry'), reqd:false, 
				description:__("Total No. Of Not Allocated Enquiry")},

				{fieldtype: "Section Break","name":"cc_sec"},

				{label:__("Allocate Enquiry"), fieldtype:"Data", reqd: 1, fieldname:"allocate_enquiry_no"}
				
			],
			primary_action_label: "Allocate",
			primary_action: function() {
				me.allocate_lead(count);
			}
		});
		
		$('#count').html("<b>" +	'Not Allocated Enquiry Count'	+"	:  "  +count)
		if(count>0)
			this.dialog.show();
		else
			msgprint("All enquiries are allocated...!!")

	},

	allocate_lead: function(count) {
		var me = this,
		form_values = me.dialog.get_values(),
		btn = me.dialog.get_primary_btn();
		if(!form_values) return;
		if(parseInt(form_values['allocate_enquiry_no'])>0){
			if(count < parseInt(form_values['allocate_enquiry_no']))
				msgprint("No. of enquiry must be less than the total no of not allocated enquiry")
			else
				me.make_enquiry_allocation(count,parseInt(form_values['allocate_enquiry_no']))
				me.dialog.hide();
		}
		else{
			msgprint("Valuse shoud be a positive number")
		}
		
	},

	make_enquiry_allocation: function(count,allocation_count){
		frappe.call({
			method:"hunters_camp.hunters_camp.doctype.enquiry.enquiry.consultant_allocation",
			args:{
				"count":count,
				"allocation_count":allocation_count
			},
			callback: function(r,rt) {
			}
		});

	},
});




