// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt


cur_frm.cscript.onload = function(doc,cdt,cdn) {

$.extend(cur_frm.cscript, new lead_management.Composer({
	doc: cur_frm.doc,
	frm: cur_frm,
	cdt: cdt ,
	cdn:cdn

}));
	
}

frappe.provide("lead_management")
lead_management.Composer = Class.extend({
	schedule_se_visit: function(opts,cdt,cdn) {
		$.extend(this, opts);
			this.d = locals[cdt][cdn]
			this.button_name = 'SE Visit'
			if(opts.property_details[0]['location']!=null && opts.property_details[0]['area']!=null)	
				this.add()
			else
				msgprint("Property row values must be specified to create SE visit")
	},
	schedule_acm_visit: function(opts,cdt,cdn) {
		$.extend(this, opts);
			this.frm.reload_doc();
			this.d = locals[cdt][cdn]
			this.button_name = 'ACM Visit'
			if(opts.property_details[0]['location']!=null && opts.property_details[0]['area']!=null)	
				this.add_acm()
			else
				msgprint("Property row values must be specified to create ACM visit")
	},
	add: function(button_name) {
		var me = this;
		if(this.frm.doc.__unsaved == 1) {
			frappe.throw(__("Please save the document before assignment"));
			return;
		}

		if(!me.dialog) {
			me.dialog = new frappe.ui.Dialog({
				title: __('Add to To Do'),
				fields: [
					{fieldtype:'Check', fieldname:'myself', label:__("Assign to me"), "default":0},
					{fieldtype:'Link', fieldname:'assign_to', options:'User',
						label:__("Assign To Sales Executive"),
						description:__("Add to To Do List Of"), reqd:true},
					{fieldtype:'Data', fieldname:'description', label:__("Comment"), reqd:true},
					{fieldtype:'Check', fieldname:'notify',
						label:__("Notify by Email"), "default":1},
					{fieldtype:'Date', fieldname:'date', label: __("Due Date/Complete By")},
					{fieldtype:'Select', fieldname:'priority', label: __("Priority"),
						options:'Low\nMedium\nHigh', 'default':'Medium'},
				],
				primary_action: function() { me.create_se_visit(); },
				primary_action_label: __("Add")
			});

			me.dialog.fields_dict.assign_to.get_query = "hunters_camp.hunters_camp.doctype.lead_management.lead_management.sales_executive_query";
		}

		me.dialog.clear();

		if(me.frm.meta.title_field) {
			me.dialog.set_value("description", me.frm.doc[me.frm.meta.title_field])
		}

		me.dialog.show();

		me.dialog.get_input("myself").on("click", function() {
			if($(this).prop("checked")) {
				me.dialog.set_value("assign_to", user);
				me.dialog.set_value("notify", 0);
			} else {
				me.dialog.set_value("assign_to", "");
				me.dialog.set_value("notify", 1);
			}
		});
	},
	add_acm: function(button_name) {
		var me = this;
		if(this.frm.doc.__unsaved == 1) {
			frappe.throw(__("Please save the document before assignment"));
			return;
		}
		if(!me.dialog1) {
			me.dialog1 = new frappe.ui.Dialog({
				title: __('Add to To Do'),
				fields: [
					{fieldtype:'Check', fieldname:'myself', label:__("Assign to me"), "default":0},
					{fieldtype:'Link', fieldname:'assign_to', options:'User',
						label:__("Assign To ACM"),
						description:__("Add to To Do List Of"), reqd:true},
					{fieldtype:'Data', fieldname:'description', label:__("Comment"), reqd:true},
					{fieldtype:'Check', fieldname:'notify',
						label:__("Notify by Email"), "default":1},
					{fieldtype:'Date', fieldname:'date', label: __("Due Date/Complete By")},
					{fieldtype:'Select', fieldname:'priority', label: __("Priority"),
						options:'Low\nMedium\nHigh', 'default':'Medium'},
				],
				primary_action: function() { me.create_se_visit(); },
				primary_action_label: __("Add")
			});

			me.dialog1.fields_dict.assign_to.get_query = "hunters_camp.hunters_camp.doctype.lead_management.lead_management.acm_query";
		}

		me.dialog1.clear();

		if(me.frm.meta.title_field) {
			me.dialog1.set_value("description", me.frm.doc[me.frm.meta.title_field])
		}

		me.dialog1.show();

		me.dialog1.get_input("myself").on("click", function() {
			if($(this).prop("checked")) {
				me.dialog1.set_value("assign_to", user);
				me.dialog1.set_value("notify", 0);
			} else {
				me.dialog1.set_value("assign_to", "");
				me.dialog1.set_value("notify", 1);
			}
		});
	},
	add_assignment: function(visit_id) {
		var me = this;
		if (me.dialog){
			var assign_to = me.dialog.fields_dict.assign_to.get_value();
			var args = me.dialog.get_values();
		}
		if(me.dialog1){
			var assign_to = me.dialog1.fields_dict.assign_to.get_value();
			var args = me.dialog1.get_values();
		}
		if(me.button_name == 'SE Visit')
			doctype = 'Site Visit'
		if(me.button_name == 'ACM Visit')
			doctype = 'ACM Visit'
		if(args && assign_to) {
			return frappe.call({
				method:'frappe.desk.form.assign_to.add',
				args: $.extend(args, {
					doctype: doctype,
					name: visit_id,
					assign_to: assign_to
				}),
				callback: function(r,rt) {
					if(r.message) {
						me.frm.reload_doc();
						if(me.dialog)
							me.dialog.hide();
						if (me.dialog1)
							me.dialog1.hide();
						msgprint(" "+me.button_name+" created successfully..!! ")
					}
				},
				btn: this
			});
		}
	},
	create_se_visit: function(){
		var me = this;
		if(me.dialog){
			this.assign_to = me.dialog.fields_dict.assign_to.get_value()
            this.completion_date = me.dialog.fields_dict.date.get_value()

		}
		if(me.dialog1){
			this.assign_to = me.dialog1.fields_dict.assign_to.get_value()
            this.completion_date = me.dialog1.fields_dict.date.get_value()
		}
		return frappe.call({
            method: "hunters_camp.hunters_camp.doctype.lead_management.lead_management.make_visit",
            args:{ 
            		doc:me.name,
            		lead:me.lead,
            		lead_name: me.lead_name,
            		mobile_no: me.mobile_no,
            		address: me.address,
            		address_details: me.address_details,
            		customer: me.customer,
            		customer_contact: me.customer_contact,
            		contact_details: me.contact_details,
            		customer_contact_no: me.customer_contact_no,
            		customer_address: me.customer_address,
            		customer_address_details: me.customer_address_details,
            		enquiry_id: me.enquiry_id,
            		consultant: me.consultant,
            		enquiry_from: me.enquiry_from,
            		assign_to: this.assign_to,
            		completion_date: this.completion_date,
            		property_id: me.d['property_id'],
            		property_name: me.d['property_name'],
            		area: me.d['area'],
            		location: me.d['location'],
            		price: me.d['price'],
            		property_address: me.d['address'],
            		bhk: me.d['bhk'],
            		bathroom: me.d['bathroom'],
            		posting_date: me.d['posting_date'],
            		property_doc: me.d['name'],
            		button_name: me.button_name
        	},
            callback: function(r, rt) {
                if(r.message) {
                	me.add_assignment(r.message)
                }
            }
    })
	}
});


frappe.ui.form.on("Lead Management", "refresh", function(frm) {
	if (!frm.doc.__islocal){
		property_details = frm.doc.property_details || [];
		if(property_details.length < 1){
			frm.add_custom_button(__("Search Property"), function() { 

				make_dashboard(frm.doc)
			// 	frappe.route_options = {
			// 		"lead_management": frm.doc.name,
			// 		"property_type": frm.doc.property_type,
			// 		"property_subtype": frm.doc.property_subtype,
			// 		"location": frm.doc.location,
			// 		"budget_minimum": frm.doc.budget_minimum,
			// 		"budget_maximum": frm.doc.budget_maximum,
			// 		"area_minimum":frm.doc.area_minimum,
			// 		"area_maximum": frm.doc.area_maximum

			// };
			// 	frappe.set_route("property", "Hunters Camp");
			})

	}	

		
	}

	make_dashboard =  function(doc){
		console.log(doc)
	}

});


