// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt


// cur_frm.cscript.lead_status = function(doc,cdt,cdn){

// 	if(doc.lead_status=='Closed'){
// 		return frappe.call({
// 			method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.change_enquiry_status',
// 			args :{
// 				"lead_management": doc.name,
// 				"lead_status": 'Closed',
// 				"enquiry_id":doc.enquiry_id
// 			},
// 			callback: function(r,rt) {
// 				//msgprint("There is no any properties found against the specified criteria so,email with property search criteria is sent to administartor.")
// 			},
// 		})
// 	 }

// }
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
	if (!frm.doc.__islocal)// && !frm.doc.lead_status=='Closed')
	{
		property_details = frm.doc.property_details || [];
		frm.add_custom_button(__("Search Property"), function() { 
			make_dashboard(frm.doc)
		})	
	}

	make_dashboard =  function(doc){
		if(doc){
			return frappe.call({
					method:'propshikari.versions.v1.search_property',
					args :{
						"data":{
						"operation": doc.operation,
						"property_type": doc.property_type,
						"property_subtype": doc.property_subtype,
						"location": doc.location,
						"budget_minimum": doc.budget_minimum,
						"budget_maximum": doc.budget_maximum,
						"area_minimum": doc.area_minimum,
						"area_maximum": doc.area_maximum,
						"records_per_page": 10,
						"page_number":1,
						"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						if(!r.exc) {
							result=r.message['data']
							total_records = r.message['total_records']
							console.log(r.message['data'])
							console.log(["totalllll",r.message['total_records']])
							if(r.message['total_records']>0){
								var cl=doc.property_details || [ ]
								if(cl.length>0){
									return frappe.call({
										method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_diffrent_property',
										args :{
											"data":r.message["data"],
											"lead_management":doc.name
										},
										callback: function(r,rt) {
											var final_property_result = {}
											console.log(["r message",r.message])
											if(r.message){
												$.each(r.message['property_id'],function(i, property){
		  											final_property_result[(property['property_id'].trim())]=''
		  											
												});

												console.log(["final_property_result",final_property_result])
												final_result = jQuery.grep(result, function( d ) {
		 											return !(d['property_id'] in final_property_result)
												});

												console.log(["final_result",final_result.length])
												if(final_result.length>0){
													final_result=final_result
													frappe.route_options = {
													"lead_management": doc.name,
													"property_type": doc.property_type,
													"property_subtype": doc.property_subtype,
													"location": doc.location,
													"operation":doc.operation,
													"budget_minimum": doc.budget_minimum,
													"budget_maximum": doc.budget_maximum,
													"area_minimum": doc.area_minimum,
													"area_maximum": doc.area_maximum,
													"total_records":total_records,
													"data": final_result
												};
												frappe.set_route("property", "Hunters Camp");
												}
												else {
													console.log(["result",result])
													// final_result=result
													return frappe.call({
														method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_administartor',
														args :{
															"property_type": doc.property_type,
															"property_subtype": doc.property_subtype,
															"operation":doc.operation,
															"location": doc.location,
															"budget_minimum": doc.budget_minimum,
															"budget_maximum": doc.budget_maximum,
															"area_minimum": doc.area_minimum,
															"area_maximum": doc.area_maximum,
														},
														callback: function(r,rt) {
															msgprint("There is no any properties found against the specified criteria so,email with property search criteria is sent to administartor.")
															
														},
													})
												}
												
										  }
										},
									});		
								}
								frappe.route_options = {
													"lead_management": doc.name,
													"property_type": doc.property_type,
													"property_subtype": doc.property_subtype,
													"location": doc.location,
													"operation":doc.operation,
													"budget_minimum": doc.budget_minimum,
													"budget_maximum": doc.budget_maximum,
													"area_minimum": doc.area_minimum,
													"area_maximum": doc.area_maximum,
													"total_records": total_records,
													"data": r.message['data']
												};
												frappe.set_route("property", "Hunters Camp");
							}
							else{
								console.log("hi")// email to admin
								return frappe.call({
									method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_administartor',
									args :{
										"property_type": doc.property_type,
										"property_subtype": doc.property_subtype,
										"operation":doc.operation,
										"location": doc.location,
										"budget_minimum": doc.budget_minimum,
										"budget_maximum": doc.budget_maximum,
										"area_minimum": doc.area_minimum,
										"area_maximum": doc.area_maximum,
									},
									callback: function(r,rt) {
										msgprint("There is no any properties found against the specified criteria so,email with property search criteria is sent to administartor.")
										
									},
								})
							}
						}
					},
				});
			}
		}

});


