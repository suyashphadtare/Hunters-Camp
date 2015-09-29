frappe.provide("frappe.ui.form");
frappe.provide("property")
/*
	Page to Manage Property posting and view property
	data will be saved on Elastic search and shown by calling api
	if has route options and property id it should behave as view page 
	it should have menu items for various operations and update button.
	else it should have post property button.
*/
frappe.ui.form.on("Property", "refresh", function(frm) {
	var me = this;
	property.operations.init(frm);
	
});

property.operations = {
	init:function(frm){
		var me = this;
		this.doc = frm.doc
		if (frappe.route_options){
			console.log("view")
		}
		else {
			me.enable_property_posting(frm)
		}
	},
	enable_property_posting:function(frm){
		var me = this;
		me.manage_primary_operations(frm)	
		me.remove_menu_operations(frm)
	},
	manage_primary_operations:function(frm){
		var me = this;
		frm.disable_save();
		frm.page.set_primary_action(__("Post Property"), function() {
			me.post_property(frm,frm.doc)		
		});
	},
	post_property:function(frm,doc){
		var me = this
		if(me.check_mandatory(frm)) {
			frappe.call({
				freeze: true,
				freeze_message:"Posting Property,Please Wait..",
				method:"hunters_camp.hunters_camp.doctype.property.property.post_property",
				args:{doc: frm.doc},
				callback: function(r) {
					
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
			})
		} else {
			$(btn).prop("disabled", false);
		}	
	},
	remove_menu_operations:function(frm){
		frm.page.clear_menu();
	},
	check_mandatory :function(frm) {
		var me = this;
		var has_errors = false;
		frm.scroll_set = false;

		
		$.each(frappe.model.get_all_docs(frm.doc), function(i, doc) {

			var error_fields = [];
			var folded = false;

			$.each(frappe.meta.docfield_list[doc.doctype] || [], function(i, docfield) {
				if(docfield.fieldname) {
					var df = frappe.meta.get_docfield(doc.doctype,
						docfield.fieldname, frm.doc.name);

					if(df.fieldtype==="Fold") {
						folded = frm.layout.folded;
					}

					if(df.reqd && !frappe.model.has_value(doc.doctype, doc.name, df.fieldname)) {
						has_errors = true;
						error_fields[error_fields.length] = __(df.label);

						if(folded) {
							frm.layout.unfold();
							folded = false;
						}
					}

				}
			});
			if(error_fields.length)
				msgprint(__('Mandatory fields required in {0}', [(doc.parenttype
					? (__(frappe.meta.docfield_map[doc.parenttype][doc.parentfield].label) + ' ('+ __("Table") + ')')
					: __(doc.doctype))]) + '\n' + error_fields.join('\n'));
		});

		return !has_errors;
	},


}

frappe.ui.form.on("Property", "refresh", function(frm) {
	var me = this;
	property.operations.init(frm);
	
});




