// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt



frappe.ui.form.on("ACM Visit", "refresh", function(frm) {
	if (!frm.doc.__islocal)// && !frm.doc.lead_status=='Closed')
	{
		if(frm.doc.acm_status=='Close' && !frm.doc.amount){
			frm.add_custom_button(__("Book Property"), function() { 
				pop_up = new frappe.Book_Property();
			})	
		}

		}

	frappe.Book_Property = Class.extend({
		init: function() {
			this.make();
		},
		make: function() {
			var me = this;
			d = new frappe.ui.Dialog({
				title: "Book Property",
				no_submit_on_enter: true,
				fields: [

					{label:__("Bank"), fieldtype:"Data", fieldname:"bank",reqd:1},

					{label:__("Payer"), fieldtype:"Data", fieldname:"payer"},

					{label:__("Amount"), fieldtype:"Data", fieldname:"amount",reqd:1},

					{fieldtype: "Column Break","name":"cc_sec"},

					{label:__("Cheque No."), fieldtype:"Data", fieldname:"cheque_no"},

					{label:__("Cheque Date"), fieldtype:"Date", fieldname:"cheque_date"},

					{label:__("Description"), fieldtype:"Data", fieldname:"description"},

				],

				primary_action_label: "Done",
				primary_action: function() {
					// Update Clearance Date of the checked vouchers
					console.log(d.fields_dict.bank.$input.val())
					if(d.fields_dict.bank.$input.val() && d.fields_dict.amount.$input.val()){
						return frappe.call({
							method: "hunters_camp.hunters_camp.doctype.acm_visit.acm_visit.add_book_property_details",
							args: {
								"bank":d.fields_dict.bank.$input.val(),
								"cheque_no": d.fields_dict.cheque_no.$input.val(),
								"payer":d.fields_dict.payer.$input.val(),
								"cheque_date":d.fields_dict.cheque_date.$input.val(),
								"amount":d.fields_dict.amount.$input.val(),
								"description":d.fields_dict.description.$input.val(),
								"name": cur_frm.doc.name,
								"lead_management_id": cur_frm.doc.lead_management_id
							},
							callback: function(r) {
								//cur_frm.refresh_fields();
								if(r.message){
									cur_frm.reload_doc()
									setTimeout(function(){},1000)
									d.hide()
									
								}
							}
					});
					}
				}


			});

			d.show();

		},
	});

});