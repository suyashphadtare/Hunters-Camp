frappe.provide("frappe.ui.form");
frappe.provide("project")
{% include 'hunters_camp/hunters_camp/doctype/property/upload.js' %};
{% include 'hunters_camp/hunters_camp/doctype/property/get_lat_lon.js' %};
/*
	Page to Manage Project posting and view project
	data will be saved on Elastic search and shown by calling api
	if has route options and property id it should behave as view page 
	it should have menu items for various operations and update button.
	else it should have post project button.
*/

cur_frm.add_fetch("amenity_name", "icon", "image")

frappe.ui.form.on("Projects", "refresh", function(frm) {
	var me = this;
	$(cur_frm.get_field("attachment_display").wrapper).empty()
	project.operations.init(frm);
	cur_frm.cscript.render_google_map(frm)
	cur_frm.cscript.check_for_possession_status(frm)
	
});

frappe.ui.form.on("Projects", "possession", function(frm) {
	var me = this;
	cur_frm.cscript.check_for_possession_status(frm)
});


frappe.ui.form.on("Projects", "operation", function(frm) {
	var me = this;
	frm.toggle_reqd("month", frm.doc.operation==="Buy");
	frm.toggle_reqd("year", frm.doc.operation==="Buy");
});



cur_frm.cscript.render_google_map = function(frm){
	$(frm.fields_dict['search_location'].wrapper).html("<input type='text' class='form-control' id='search-input'\
		placeholder='Search Location' style='width:200px;margin-top:10px'><div id='my_map' style='width:400px;height:300px'></div>")
	this.my_map = document.getElementById('my_map')
	this.search_input = document.getElementById('search-input')
	gmap = new GoogleMap(this.my_map, this.search_input)
	gm = new GeoCodeManager(gmap, frm)

}

cur_frm.cscript.check_for_possession_status = function(frm){
	frm.toggle_reqd("month", frm.doc.possession == 0);
	frm.toggle_reqd("year", frm.doc.possession == 0);
}


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
		new SearchProperty(frm)
		//me.set_mm_yy_format_for_posssession(frm)
	},
	set_mm_yy_format_for_posssession:function(frm){
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
							me.reload_doc(frm)
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
				method:'hunters_camp.hunters_camp.doctype.projects.projects.view_project',
				args: {
					'project_id':frm.doc.project_id,
					'sid':frappe.get_cookie('sid')
				},
				freeze_message:"Reloading Project details, Please Wait..",
				freeze: true,
				callback: function(r) {
					if(!r.exc) {
						var doc = frappe.model.sync(r.message);
						frm.page.clear_primary_action();
						me.enable_project_editing(frm, doc)
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
		prj_flag = false
		$.each(frappe.model.get_all_docs(frm.doc), function(i, doc) {
			if (doc.doctype != 'Projects' || prj_flag == false){
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
				if (doc.doctype == "Projects"){
					prj_flag = true
				}
			}
		});
		return !has_errors;
	},
	enable_project_editing:function(frm, doc){
		var me = this;
		if(doc){
			me.add_data_to_form(frm,doc)
			me.display_property_photo(frm, doc)
		}
		me.manage_primary_operations_for_update(frm)
		me.add_status_and_tag_to_menu(frm)
		me.add_possession_status(frm, doc)
		this.make_property_details_read_only(frm)
	
	},
	make_property_details_read_only:function(frm){
		console.log("in property_details")
		cur_frm.set_df_property("property_details", "read_only", true)
		$.each([2,3,4,5,6,7,8,9], function(index , value){
			cur_frm.get_field("property_details").grid.docfields[value].read_only = 1
		})
		refresh_field(["property_details"])
	},
	add_possession_status : function(frm, doc){
		if (cur_frm.doc.possession != 1){
			if (cur_frm.doc.possession_status){
				po_list = cur_frm.doc.possession_status.split('-')
				cur_frm.doc.month = po_list[0]  
				cur_frm.doc.year =  po_list[1]
				refresh_field(["month","year","possession"])
			}			
		}		
	},
	add_status_and_tag_to_menu:function(frm){
		var me = this
		frm.page.add_menu_item(__("Activate Project"),function(){ me.update_status("Active",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Deactivate Project"),function(){ me.update_status("Deactivated",frm) },"icon-file-alt");
	},
	update_status:function(status,frm){
		frappe.call({
			freeze: true,
			freeze_message:"Updaing Project Status,Please Wait..",
			method:"hunters_camp.hunters_camp.doctype.projects.projects.update_status",
			args:{doc: frm.doc,sid:frappe.get_cookie('sid'),"status":status},
			callback: function(r) {
				if (!r.exec){
					frappe.msgprint(r.message[0].message)
					refresh_field("project_id")
					frm.doc.status = r.message[1]
					refresh_field("status")
				}
			},
			always: function() {
				frappe.ui.form.is_saving = false;
			}
		})
	},
	manage_primary_operations_for_update:function(frm){
		var me = this;
		frm.disable_save();
		frm.page.set_primary_action(__("Update Project"), function() {
			me.update_project(frm)		
		});
	},
	update_project:function(frm){
		var me = this
		if(me.check_mandatory(frm)) {
				frappe.call({
					freeze: true,
					freeze_message:"Updating Project,Please Wait..",
					method:"hunters_camp.hunters_camp.doctype.projects.projects.update_project",
					args:{doc: frm.doc, sid:frappe.get_cookie('sid')},
					callback: function(r) {	
						frm.doc.project_photos = []
						cur_frm.set_df_property("property_details", "read_only", true)
						refresh_field(["project_photos", "property_details"])
						msgprint(r.message.message)
						me.reload_doc(frm)

					},
					always: function() {
						frappe.ui.form.is_saving = false;
					}	
				})
			}
	},
	add_data_to_form:function(frm,doc){
		$.each(frappe.meta.docfield_list["Projects"] || [], function(i, docfield) {
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
		var me = this
		wrapper = $(cur_frm.get_field("attachment_display").wrapper)
		wrapper.empty()
		if(frm.doc.thumbnails){
			thumbnails_list = frm.doc.thumbnails.split(',')
			$.each(thumbnails_list ,function(index, thumbnail){
			$("<div class='img-wrap'> <span class='close'>&times;</span><img class='imageThumb prj_img' src="+thumbnail+" ></div>").appendTo(wrapper);
			})
			me.init_delete_project_photo(frm)
		}
	},
	add_distance_from_imp_loc: function(frm, doc){
		if (doc[0]["distance_from_imp_locations"]){
			frm.doc["airport"] = doc[0]["distance_from_imp_locations"].airport
			frm.doc["railway_station"] = doc[0]["distance_from_imp_locations"].railway_station
			frm.doc["central_bus_stand"] = doc[0]["distance_from_imp_locations"].central_bus_stand
			refresh_field(["airport", "railway_station", "central_bus_stand"])
		}
		
	},
	init_delete_project_photo:function(frm){
		var me = this
		$(".close").click(function(){
			console.log($(this).siblings())
			if ($(this).siblings().hasClass("prj_img")){
				me.delete_project_photo(frm, this)
			}else{
				img_src = $(this).siblings().attr("src")
				index = 0
				$.each(frm.doc.project_photos, function(i,value){
					if (value.file_data == img_src){
						index = i
						return false
					}
				})
				frm.doc.project_photos.splice(index, 1)
				refresh_field(["project_photos"])
				photo_names = $.map(frm.doc.project_photos, function(d){ return d.file_name })
				frm.doc.photo_names = photo_names.join(',')
				refresh_field(["photo_names"])
				$(this).parent().remove()
			}


		})

	},
	delete_project_photo:function(frm, cur_img){
		img_src = $(cur_img).siblings().attr("src") 
		frappe.confirm(__("Are you sure you want to delete Project Photo"), function() {
			return frappe.call({
				freeze:true,
				freeze_message:"Deleting Project Photo Please wait.........",
				method:"hunters_camp.hunters_camp.doctype.projects.projects.delete_photo",
				args: {doc: frm.doc, sid:frappe.get_cookie('sid'), img_url:img_src},
				callback: function(r) {
					console.log(r.message)
					frappe.msgprint(r.message.message)
					frm.doc.full_size_images = r.message.full_size
					frm.doc.thumbnails = r.message.thumbnails
					frm.doc.project_photo = r.message.photo 
					refresh_field(["full_size_images", "thumbnails", "project_photo"])
					$(cur_img).parent().remove()	
				}
			});
		});
	}

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
				$("<div class='img-wrap'> <span class='close'>&times;</span><img class='imageThumb' title="+img["file_name"]+"  src="+img["file_data"]+" ></div>").appendTo(wrapper);
			});
		}
	}
	display_existing_images(frm,wrapper)
}


display_existing_images = function(frm, wrapper){
	if (frm.doc.thumbnails){
		thumbnails_list = frm.doc.thumbnails.split(',')
		$.each(thumbnails_list ,function(index, thumbnail){
			$("<div class='img-wrap'> <span class='close'>&times;</span><img class='imageThumb prj_img' src="+thumbnail+" ></div>").appendTo(wrapper);
		})		
	}
	project.operations.init_delete_project_photo(frm)
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
		cur_frm.add_custom_button(__('Search Project'),function() {
				me.render_dialog_for_property_search() },"btn-primary");
	},
	render_dialog_for_property_search: function(){
		this.dialog = new frappe.ui.Dialog({
		title: __(__("Search Individual Project")),
		fields: [
			{"fieldtype": "Data", "label": __("Enter Project ID"), "fieldname": "property", "reqd":1},
			{"fieldtype": "Button", "label": __("View Project"), "fieldname": "search"},
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
		        $(me.dialog.body).find("input[data-fieldname=property]").val( ui.item.project_id );
		        return false;
		      },
		      select: function( event, ui ) {
		        $(me.dialog.body).find("input[data-fieldname=property]").val( ui.item.project_id );		     
		        return false;
		      }
    	}).autocomplete( "instance" )._renderItem = function( ul, property ) {
      			return $( "<li>" ).append( "<a><b>" + property.project_id + "</b><br>" + property.overview + "</a>" ).appendTo( ul );
    		};
	},
	get_property_data:function(){
		var me = this
		frappe.call({
			method:"hunters_camp.hunters_camp.doctype.projects.projects.get_all_projects",
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
         	if (hasMatch(obj.project_id) || hasMatch(obj.overview)) {
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
						method:'hunters_camp.hunters_camp.doctype.projects.projects.view_project',
						args: {
							'project_id':prop_id,
							'sid':frappe.get_cookie('sid')
						},
						freeze_message:"Reloading Project details, Please Wait..",
						freeze: true,
						callback: function(r) {
							if(!r.exc) {
									var doc = frappe.model.sync(r.message);
									frappe.route_options = {"doc":doc};
									frappe.set_route("Form",'Projects','Projects');
									cur_frm.reload_doc()
									me.dialog.hide()
								}
							}
					})
				}
				else{
					msgprint("Please Select Project Id First")	
				}
    	})
    }

})


cur_frm.fields_dict.project_by.get_query = function(doc) {
	return {
			query:"hunters_camp.hunters_camp.doctype.projects.projects.get_builders",
		}
}


cur_frm.fields_dict.project_tieup_by.get_query = function(doc) {
	return {
			query:"hunters_camp.hunters_camp.doctype.projects.projects.get_consultant",
		}
}