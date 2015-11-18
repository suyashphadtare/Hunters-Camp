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
			me.enable_project_editing(frm, frappe.route_options["doc"])
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
	reload_doc:function(frm){
	var me = this
	return frappe.call({
				type: 'GET',
				method:'hunters_camp.hunters_camp.doctype.property.property.view_property',
				args: {
					'property_id':frm.doc.property_id,
					'sid':frappe.get_cookie('sid')
				},
				freeze_message:"Reloading Property details, Please Wait..",
				freeze: true,
				callback: function(r) {
					if(!r.exc) {
						var doc = frappe.model.sync(r.message);
						frm.page.clear_primary_action();
						me.enable_property_editing(frm, doc)
					}
				}
		})
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
	enable_project_editing:function(frm, doc){
		var me = this;
		if(doc){
			me.add_data_to_form(frm,doc)
			me.display_property_photo(frm, doc)
		}
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
	add_data_to_form:function(frm,doc){
		$.each(frappe.meta.docfield_list["Project"] || [], function(i, docfield) {
			var df = frappe.meta.get_docfield(doc.doctype,
				docfield.fieldname, frm.doc.name);
			if (in_list(['tag', 'thumbnails', 'full_size_images'], docfield.fieldname ) && Array.isArray(doc[0][docfield.fieldname])){
				frm.doc[docfield.fieldname] = doc[0][docfield.fieldname].join(',')
			}
			else{
				frm.doc[docfield.fieldname] = doc[0][docfield.fieldname]
			}

			refresh_field(docfield.fieldname)
		});
		this.add_distance_from_imp_loc(frm,doc)
	},
	display_property_photo:function(frm, doc){
		wrapper = $(cur_frm.get_field("attachment_display").wrapper)
		wrapper.empty()
		thumbnails_list = frm.doc.thumbnails.split(',')
		$.each(thumbnails_list ,function(index, thumbnail){
			$("<img></img>",{
	 				class : "imageThumb",
	 				src : thumbnail
	 			}).appendTo(wrapper);
		})

	},
	add_distance_from_imp_loc: function(frm, doc){
		if (doc[0]["distance_from_imp_locations"]){
			frm.doc["airport"] = doc[0]["distance_from_imp_locations"].airport
			frm.doc["railway_station"] = doc[0]["distance_from_imp_locations"].railway_station
			frm.doc["central_bus_stand"] = doc[0]["distance_from_imp_locations"].central_bus_stand
			refresh_field(["airport", "railway_station", "central_bus_stand"])
		}
		
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
				image_list.push.apply(image_list, file_data)
				frm.doc.project_photos = image_list
				if (frm.doc.photo_names){
					show_list = (frm.doc.photo_names).split(',')
				}
			}	
			else{
					img_list = []
					img_list.push.apply(img_list, file_data)
					frm.doc.project_photos = img_list
				}
			console.log(frm.doc.project_photos)
			show_list.push.apply(show_list, $.map(file_data, function(d){ return d.file_name }))
			frm.doc.photo_names = show_list.join(',')
			refresh_field(["project_photos","photo_names"])

		}
	}
}
check_file_exists = function(frm,file_data){
	var res = true
	// if (frm.doc.project_photos){
	// 	image_list = frm.doc.project_photos
	// 	if(image_list){
	// 		$.each(image_list,function(i,img){
	// 			if (img["file_name"] == file_data["file_name"]){
	// 				res = false
	// 			}
	// 		});
	// 	}
	// }
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
	display_existing_images(frm,wrapper)
}


display_existing_images = function(frm, wrapper){
	thumbnails_list = frm.doc.thumbnails.split(',')
	$.each(thumbnails_list ,function(index, thumbnail){
			$("<img></img>",{
	 				class : "imageThumb",
	 				src : thumbnail
	 			}).appendTo(wrapper);
		})
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








SearchProperty = Class.extend({
	init:function(frm){
		this.frm = frm
		this.init_for_search_property()
	},
	init_for_search_property:function(){
		var me = this
		cur_frm.add_custom_button(__('Search Property'),function() {
				me.render_dialog_for_property_search() },"btn-primary");
	},
	render_dialog_for_property_search: function(){
		this.dialog = new frappe.ui.Dialog({
		title: __(__("Search Individual Property")),
		fields: [
			{"fieldtype": "Data", "label": __("Enter Property ID"), "fieldname": "property", "reqd":1},
			{"fieldtype": "Button", "label": __("View Property"), "fieldname": "search"},
			]
		});
		this.dialog.show();
		this.get_property_data()
		this.make_search_property()
	},																																	
	init_for_autocomplete: function(){
		var me = this
		$(this.dialog.body).find("input[data-fieldname=property]").attr("property_data", JSON.stringify(this.property_data))
		$(this.dialog.body).find("input[data-fieldname=property]").autocomplete({
     		 source: me.init_search,
     		 focus: function( event, ui ) {
		        $(me.dialog.body).find("input[data-fieldname=property]").val( ui.item.property_id );
		        return false;
		      },
		      select: function( event, ui ) {
		        $(me.dialog.body).find("input[data-fieldname=property]").val( ui.item.property_id );		     
		        return false;
		      }
    	}).autocomplete( "instance" )._renderItem = function( ul, property ) {
      			return $( "<li>" ).append( "<a><b>" + property.property_id + "</b><br>" + property.property_title + "</a>" ).appendTo( ul );
    		};
	},
	get_property_data:function(){
		var me = this
		frappe.call({
			method:"hunters_camp.hunters_camp.doctype.property.property.get_all_properties",
			args:{sid:frappe.get_cookie('sid')},
			callback:function(r){
				me.property_data = r.message.data
				me.init_for_autocomplete()
			}
		})
	},
	init_search:function(request, response) {
        var me = this
        this.property_data = JSON.parse($(this.bindings[0]).attr("property_data"))
        function hasMatch(s) {
	           	if (s){
	           		return s.toLowerCase().indexOf(request.term.toLowerCase())!==-1;	
	           		}          	
       		 }
        var matches = [];

        if (request.term==="") {
		    response([]);
            return;
        }
         
        $.each(me.property_data, function(index, obj){
         	if (hasMatch(obj.property_id) || hasMatch(obj.property_title)) {
                matches.push(obj);
            }
        })  
        response(matches);
    },
    make_search_property:function(){
    	var me = this
    	$(this.dialog.fields_dict.search.input).click(function(){
    		prop_id = me.dialog.fields_dict.property.input.value
    		if(prop_id){
		    		return frappe.call({
						type: 'GET',
						method:'hunters_camp.hunters_camp.doctype.property.property.view_property',
						args: {
							'property_id':prop_id,
							'sid':frappe.get_cookie('sid')
						},
						freeze_message:"Reloading Property details, Please Wait..",
						freeze: true,
						callback: function(r) {
							if(!r.exc) {
									var doc = frappe.model.sync(r.message);
									frappe.route_options = {"doc":doc};
									frappe.set_route("Form",'Property','Property');
									cur_frm.reload_doc()
									me.dialog.hide()
								}
							}
					})
				}
				else{
					msgprint("Please Select Property Id First")	
				}
    	})
    }

})