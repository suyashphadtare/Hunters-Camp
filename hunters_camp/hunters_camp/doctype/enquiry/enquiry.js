// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

cur_frm.add_fetch('location', 'area', 'location_name');
cur_frm.add_fetch('lead', 'lead_name', 'lead_name');
cur_frm.add_fetch('lead', 'middle_name', 'middle_name');
cur_frm.add_fetch('lead', 'last_name', 'last_name');
cur_frm.add_fetch('lead', 'email_id', 'email_id');
cur_frm.add_fetch('lead', 'lead_from', 'lead_from');
cur_frm.add_fetch('lead', 'reference', 'reference');
cur_frm.add_fetch('lead', 'description', 'description');
cur_frm.add_fetch('lead', 'mobile_no', 'mobile_no');





//Return query for getting contact name in link field
cur_frm.fields_dict['address'].get_query = function(doc) {
	return {
		filters: {
			
			"lead": doc.lead
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

cur_frm.cscript.lead = function(doc,cdt,cdn){
	console.log("n lead")
	// doc.address=null
	// doc.address_details=null
	// refresh_fields(['address','address_details'])

}


cur_frm.cscript.address = function(doc,cdt,cdn){
	frappe.call({
			method: "erpnext.utilities.doctype.address.address.get_address_display",
			args: {"address_dict": doc.address },
			callback: function(r) {
				if(r.message){
					doc.address_details=r.message
					refresh_field('address_details')
				}
			}
		})
}

cur_frm.cscript.customer_address = function(doc,cdt,cdn){

	frappe.call({
			method: "erpnext.utilities.doctype.address.address.get_address_display",
			args: {"address_dict": doc.customer_address },
			callback: function(r) {
				if(r.message){
					doc.customer_address_details=r.message
					refresh_field('customer_address_details')
				}
			}
		})
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



