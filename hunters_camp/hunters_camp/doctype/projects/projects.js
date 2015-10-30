frappe.provide("frappe.ui.form");
frappe.provide("project")
{% include 'hunters_camp/hunters_camp/doctype/property/upload.js' %};
/*
	Page to Manage Project posting and view project
	data will be saved on Elastic search and shown by calling api
	if has route options and property id it should behave as view page 
	it should have menu items for various operations and update button.
	else it should have post project button.
*/
frappe.ui.form.on("Projects", "refresh", function(frm) {
	var me = this;
	project.operations.init(frm);
	
});

project.operations = {
	init:function(frm){
		var me = this;
		this.doc = frm.doc
		if (frappe.route_options){
			me.enable_project_editing(frm)
		}
		else {
			me.enable_project_posting(frm)
		}
		//me.set_mm_yy_format_for_posssession(frm)
	},
	set_mm_yy_format_for_posssession:function(frm){
		console.log(cur_frm.get_field("possession_date").$input)
	},
	enable_project_posting:function(frm){
		var me = this;
		me.manage_primary_operations(frm)	
		me.remove_menu_operations(frm)
	},
	manage_primary_operations:function(frm){
		var me = this;
		frm.disable_save();
		frm.page.set_primary_action(__("Post Project"), function() {
			me.post_project(frm,frm.doc)		
		});
	},
	post_project:function(frm,doc){
		var me = this
		if(me.check_mandatory(frm)) {
			frappe.call({
				freeze: true,
				freeze_message:"Posting Project,Please Wait..",
				method:"hunters_camp.hunters_camp.doctype.projects.projects.post_project",
				args:{doc: frm.doc,sid:frappe.get_cookie('sid')},
				callback: function(r) {
					if (!r.exec){
						frappe.msgprint(r.message.message)
						frm.doc.project_id = r.message.project_id
						refresh_field("project_id")
						if (frm.doc.project_id){
							frm.page.clear_primary_action();
							me.enable_project_editing(frm)
						}
					}
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
	enable_project_editing:function(frm){
		var me = this;
		//me.manage_primary_operations_for_update(frm)
		//me.add_status_and_tag_to_menu(frm)
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
		frm.page.set_primary_action(__("Update Project"), function() {
			//me.post_property(frm,frm.doc)		
		});
	},
}

frappe.ui.form.on("Projects", "attach_image", function(frm) {
	var me = this;
	this.dialog = new frappe.ui.Dialog({
		title: __(__("Upload")),
		fields: [
			{fieldtype:"HTML", fieldname:"upload_area"},
		]
	});
	this.dialog.show();
	this.dialog.get_field("upload_area").$wrapper.empty();
	
	this.upload_options = {
		parent: this.dialog.get_field("upload_area").$wrapper,
		args: {from_form: 1,doctype: frm.doctype,docname: frm.docname},
		options: "Image",
		btn: this.dialog.set_primary_action(__("Attach")),
		on_no_attach: function() {
			msgprint(__("Please attach a file or set a URL"));
		},
		callback: function(file_data) {
			me.process_images(frm,file_data)
			me.display_thumbnail(frm)
			me.dialog.hide();
		},
		onerror: function() {
			me.dialog.hide();
		},
	}
	
	hc.upload.make(this.upload_options);
	
});

process_images = function(frm,file_data){
	var me = this;
	if (file_data){
		if (me.check_file_exists(frm,file_data)){
			image_list = frm.doc.project_photos
			show_list = []
			if (image_list){
				image_list.push(file_data)
				frm.doc.project_photos = image_list
				if (frm.doc.photo_names)
					show_list = (frm.doc.photo_names).split(',')
					show_list.push(file_data["file_name"])
					frm.doc.photo_names = show_list.join(',')
			}
			else {
				img_list = []
				img_list.push(file_data)
				frm.doc.project_photos = img_list
				show_list.push(file_data["file_name"])
				frm.doc.photo_names = show_list.join(',')
			}
			refresh_field(["project_photos","photo_names"])
		}
	}
}
check_file_exists = function(frm,file_data){
	var res = true
	if (frm.doc.project_photos){
		image_list = frm.doc.project_photos
		if(image_list){
			$.each(image_list,function(i,img){
				if (img["file_name"] == file_data["file_name"]){
					res = false
				}
			});
		}
	}
	return res
}

display_thumbnail =function(frm){
	wrapper = $(cur_frm.get_field("attachment_display").wrapper)
	wrapper.empty()
	if (frm.doc.project_photos){
		image_list = frm.doc.project_photos
		if(image_list){
			$.each(image_list,function(i,img){
				$("<img></img>",{
	 				class : "imageThumb",
	 				src : img["file_data"],
	 				title : img["file_name"]
	 			}).appendTo(wrapper);
			});
		}
	}
}

frappe.ui.form.on("Project Details", {
    "property_details_add": function(frm,cdt,cdn) {
      	var d = locals[cdt][cdn]
      	d.property_type = frm.doc.project_type
      	d.property_subtype = frm.doc.project_subtype
      	refresh_field["property_details"]
    }
});

frappe.ui.form.on("Projects", "possession", function(frm) {
	var me = this;
	frm.toggle_reqd("month", frm.doc.possession===0);
	frm.toggle_reqd("year", frm.doc.possession===0);
	
});

cur_frm.fields_dict.project_subtype.get_query = function(doc) {
	return{
		filters:{
			'property_type': doc.project_type
		}
	}
}
