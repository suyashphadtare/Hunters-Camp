// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

cur_frm.add_fetch('location', 'area', 'location_name');

// Return query for getting contact name in link field
/*cur_frm.fields_dict['address'].get_query = function(doc) {
	return {
		filters: {
			
			"lead": doc.lead
		}
	}
}*/
cur_frm.fields_dict.address.get_query = function(doc) {
	return{
		filters:{
			'lead': doc.lead
		}
	}
}


// Return query for getting customer address name in link field
cur_frm.fields_dict['customer_address'].get_query = function(doc) {
	return {
		filters: {
			
			"customer": doc.customer
		}
	}
}

// Return query for getting customer contact name in link field
cur_frm.fields_dict['customer_contact'].get_query = function(doc) {
	return {
		filters: {
			
			"customer": doc.customer
		}
	}
}

cur_frm.fields_dict['property_subtype'].get_query = function(doc) {
	return {
		filters: {
			
			"property_type": doc.property_type
		}
	}
}

cur_frm.cscript.address = function(doc,cdt,cdn){

	erpnext.utils.get_address_display(this.frm, "address","address_details");
}

cur_frm.cscript.customer_address = function(doc,cdt,cdn){

	erpnext.utils.get_address_display(this.frm, "customer_address","customer_address_details");
}


//frappe call for retriveing contact details and setting all details to a field
cur_frm.cscript.customer_contact = function(doc,cdt,cdn){
	frappe.call({
			method:"hunters_camp.hunters_camp.doctype.enquiry.enquiry.get_contact_details",
			args:{"contact": doc.customer_contact},
			callback: function(r) {
				if (r.message){
					doc.contact_details = (r.message['contact_display'] + '<br>' + r.message['contact_person'] + '<br>' + r.message['contact_email'] + '<br>' + r.message['contact_mobile'] + '<br>' + r.message['contact_personal_email'])
					refresh_field('contact_details')
				}
				
			}
		});

}

//adding allocate lead button onenquiry from and allocating entry to consultant
frappe.ui.form.on("Enquiry", "refresh", function(frm) {
	if (!frm.doc.__islocal){
		property_details = frm.doc.property_details || [];
		if(frm.doc.enquiry_status=='Unprocessed'){
			frm.add_custom_button(__("Allocate Lead"), function() { new enquiry.Composer({
				doc: frm.doc,
				frm: frm,
			}) 
		});

	}	

		
	}

});

frappe.provide("enquiry")
enquiry.Composer = Class.extend({
	init: function(opts) {
		$.extend(this, opts);
		if(this.doc['enquiry_status'] == 'Unprocessed')
			this.add()
		else
			msgprint("This enquiry form is already processed for lead management")
	},
	add: function() {
		var me = this;

		if(this.frm.doc.__unsaved == 1) {
			frappe.throw(__("Please save the document before assignment"));
			return;
		}

		if(!me.dialog) {
			me.dialog = new frappe.ui.Dialog({
				title: __('Add to To Do'),
				fields: [
					
					{fieldtype:'Link', fieldname:'assign_to', options:'User',
						label:__("Assign To Consultant"),
						description:__("Add to To Do List Of"), reqd:true}
				],
				primary_action: function() { me.create_lead_management(); },
				primary_action_label: __("Add")
			});

			me.dialog.fields_dict.assign_to.get_query = "hunters_camp.hunters_camp.doctype.enquiry.enquiry.user_query";
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
	add_assignment: function(property_id) {
		var me = this;
		var assign_to = me.dialog.fields_dict.assign_to.get_value();
		var args = me.dialog.get_values();
		if(args && assign_to) {
			return frappe.call({
				method:'frappe.desk.form.assign_to.add',
				args: $.extend(args, {
					doctype: 'Lead Management',
					name: property_id,
					description:'Please Check',
					assign_to: assign_to
				}),
				callback: function(r,rt) {
					if(r.message) {
						me.frm.reload_doc();
						me.dialog.hide();
						me.frm.refresh_field('property_status')
						me.frm.refresh_field('lead_management_id')
						me.frm.refresh_field('enquiry_status')
						msgprint("Lead Allocation completed successfully..!!")
					}
				},
				btn: this
			});
		}
	},
	create_lead_management: function(){
		var me = this;
		property = this.doc.property_details || []
		return frappe.call({
            method: "hunters_camp.hunters_camp.doctype.enquiry.enquiry.create_lead_management_form",
            args:{ 
            		source_name:me.doc.name,
            		assign_to: me.dialog.fields_dict.assign_to.get_value()
        	},
            callback: function(r, rt) {
                if(r.message) {
                	me.add_assignment(r.message)
                }
            }
    })
	}
});

