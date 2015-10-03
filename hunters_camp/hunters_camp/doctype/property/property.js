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

frappe.ui.form.on("Property", "possession_date", function(frm) {
	var me = this;
	me.$input.datepicker({
		dateFormat: 'MM yy'
	})
	alert("hshsh")
	
});

property.operations = {
	init:function(frm){
		var me = this;
		this.doc = frm.doc
		if (frappe.route_options){
			me.enable_property_editing(frm)
		}
		else {
			me.enable_property_posting(frm)
		}
		//me.set_mm_yy_format_for_posssession(frm)
	},
	set_mm_yy_format_for_posssession:function(frm){
		console.log(cur_frm.get_field("possession_date").$input)
		/*$input = cur_frm.get_field("possession_date").$input
		console.log([$input,"ss"])
		*//*$($input.find('[data-fieldtype="date"]' )).datepicker({
						dateFormat: 'MM yy'
		})*/
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
				args:{doc: frm.doc,sid:frappe.get_cookie('sid')},
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
	enable_property_editing:function(frm){
		var me = this;
		me.manage_primary_operations_for_update(frm)
		me.add_status_and_tag_to_menu(frm)
	},
	add_status_and_tag_to_menu:function(frm){
		frm.page.add_menu_item(__("Set as Discounted"),function(){},"icon-file-alt");
		frm.page.add_menu_item(__("Set as Verified"),function(){},"icon-file-alt");
		frm.page.add_menu_item(__("Set as Invested"),function(){},"icon-file-alt");
		frm.page.add_menu_item(__("Deactivate Property"),function(){},"icon-file-alt");
		frm.page.add_menu_item(__("Set as Sold"),function(){},"icon-file-alt");
	},
	manage_primary_operations_for_update:function(frm){
		var me = this;
		frm.disable_save();
		frm.page.set_primary_action(__("Update Property"), function() {
			me.post_property(frm,frm.doc)		
		});
	},
}

frappe.ui.form.on("Property", "add_amenities", function(frm) {
	var me = this;
	if (frm.doc.amenities_link){
		amenities_list = []
		if (frm.doc.amenities){
			amenities_list = (frm.doc.amenities).split(',')
		}
		if ((amenities_list.indexOf(frm.doc.amenities_link))<0){
			amenities_list.push(frm.doc.amenities_link)
		}
		frm.doc.amenities = amenities_list.join(',')
		cur_frm.refresh_field("amenities")
		frm.doc.amenities_link = ''
		cur_frm.refresh_field("amenities_link") 	
	}
	
});

frappe.ui.form.on("Property", "add_flat_facilities", function(frm) {
	var me = this;
	if (frm.doc.fa_link){
		ff_list = []
		if (frm.doc.flat_facilities){
			ff_list = (frm.doc.flat_facilities).split(',')
		}
		if ((ff_list.indexOf(frm.doc.fa_link))<0){
			ff_list.push(frm.doc.fa_link)
		}
		frm.doc.flat_facilities = ff_list.join(',')
		cur_frm.refresh_field("flat_facilities")
		frm.doc.fa_link = ''
		cur_frm.refresh_field("fa_link") 	
	}
	
});



