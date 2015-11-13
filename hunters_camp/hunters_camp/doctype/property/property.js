frappe.provide("frappe.ui.form");
frappe.provide("property")
{% include 'hunters_camp/hunters_camp/doctype/property/upload.js' %};
/*
	Page to Manage Property posting and view property
	data will be saved on Elastic search and shown by calling api
	if has route options and property id it should behave as view page 
	it should have menu items for various operations and update button.
	else it should have post property button.
*/


cur_frm.add_fetch("amenity_name", "icon", "image")
cur_frm.add_fetch("facility_name", "icon", "image")

frappe.ui.form.on("Property", "refresh", function(frm) {
	var me = this;
	console.log("refresh")
	$(cur_frm.get_field("attachment_display").wrapper).empty()
	new prop_operations(frm)
	
});
frappe.ui.form.on("Property", "possession", function(frm) {
	var me = this;
	frm.toggle_reqd("month", frm.doc.possession===0);
	frm.toggle_reqd("year", frm.doc.possession===0);
	
});

frappe.ui.form.on("Property", "operation", function(frm) {
	var me = this;
	frm.toggle_reqd("month", frm.doc.operation==="Buy");
	frm.toggle_reqd("year", frm.doc.operation==="Buy");
});
// frappe.ui.form.on("Property", "railway_station", function(frm) {
// 	map = frm.doc.distance_from_imp_locations
// 	console.log([frm.doc.railway_station,typeof map])
// 	map["railway_station"] = frm.doc.railway_station
// 	console.log(map["railway_station"])
// });
// frappe.ui.form.on("Property", "central_bus_stand", function(frm) {
// 	map = frm.distance_from_imp_locations
// });
// frappe.ui.form.on("Property", "airport", function(frm) {
// 	map = frm.distance_from_imp_locations
// });



prop_operations = Class.extend({
	init:function(frm){
		var me = this;
		this.doc = frm.doc
		if (frappe.route_options){
			me.enable_property_editing(frm,frappe.route_options["doc"])
		}
		else {
			me.enable_property_posting(frm)
		}
		new SearchProperty(frm)
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
		console.log("post property")
		if(me.check_mandatory(frm)) {
			frappe.call({
				freeze: true,
				freeze_message:"Posting Property,Please Wait..",
				method:"hunters_camp.hunters_camp.doctype.property.property.post_property",
				args:{doc: frm.doc,sid:frappe.get_cookie('sid')},
				callback: function(r) {
					if (!r.exec){
						frappe.msgprint(r.message.message)
						frm.doc.property_id = r.message.property_id
						refresh_field(["property_id"])
						if (frm.doc.property_id){
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
		console.log("check_mandatory")
		var me = this;
		var has_errors = false;
		frm.scroll_set = false;

		$.each(frappe.model.get_all_docs(frm.doc), function(i, doc) {
			if (i != frappe.model.get_all_docs(frm.doc).length - 1){
				var error_fields = [];
				var folded = false;
				$.each(frappe.meta.docfield_list[doc.doctype] || [], function(i, docfield) {
					if(docfield.fieldname) {
						var df = frappe.meta.get_docfield(doc.doctype,
							docfield.fieldname, frm.doc.name);
						if(df.fieldtype==="Fold") {
							folded = frm.layout.folded;
						}
						if(df.reqd && ! (frappe.model.has_value(doc.doctype, doc.name, df.fieldname)) ) {
							console.log(df.fieldname)
							console.log(frappe.model.has_value(doc.doctype, doc.name, df.fieldname))
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
			}
		});
		return !has_errors;
	},
	enable_property_editing:function(frm,doc){
		var me = this;
		if (doc){
			me.add_data_to_form(frm,doc)
			me.display_property_photo(frm, doc)
		}
		me.manage_primary_operations_for_update(frm)
		me.add_status_and_tag_to_menu(frm)
		me.add_possession_status(frm, doc)

	},
	add_possession_status : function(frm, doc){
		if (doc.possession){
			cur_frm.doc.possession = 1			
		}
		else{
			po_list = cur_frm.doc.possession_status.split('-')
			cur_frm.doc.month = po_list[0]  
			cur_frm.doc.year =  po_list[1]
		}
		refresh_field(["month","year","possession"])
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
	add_status_and_tag_to_menu:function(frm){
		var me = this;
		frm.page.add_menu_item(__("Set as Discounted"),function(){ me.update_tag("Discounted",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Set as Verified"),function(){ me.update_tag("Verified",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Set as Invested"),function(){ me.update_tag("Invested",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Activate Property"),function(){ me.update_status("Active",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Deactivate Property"),function(){ me.update_status("Deactivated",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Set as Sold"),function(){ me.update_status("Sold",frm) },"icon-file-alt");
	},
	manage_primary_operations_for_update:function(frm){
		var me = this;
		frm.disable_save();
		frm.page.set_primary_action(__("Update Property"), function() {
			me.update_property(frm)		
		});
	},
	update_property:function(frm){
		var me = this
		if(me.check_mandatory(frm)) {
				frappe.call({
					freeze: true,
					freeze_message:"Updating Property,Please Wait..",
					method:"hunters_camp.hunters_camp.doctype.property.property.update_property",
					args:{doc: frm.doc, sid:frappe.get_cookie('sid')},
					callback: function(r) {	
						frm.doc.property_photos = []
						refresh_field(["property_photos"])
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
		$.each(frappe.meta.docfield_list["Property"] || [], function(i, docfield) {
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
	add_distance_from_imp_loc: function(frm, doc){
		if (doc[0]["distance_from_imp_locations"]){
			frm.doc["airport"] = doc[0]["distance_from_imp_locations"].airport
			frm.doc["railway_station"] = doc[0]["distance_from_imp_locations"].railway_station
			frm.doc["central_bus_stand"] = doc[0]["distance_from_imp_locations"].central_bus_stand
			refresh_field(["airport", "railway_station", "central_bus_stand"])
		}
		
	},
	update_tag:function(tag,frm){
		var me = this;
		frappe.call({
			freeze: true,
			freeze_message:"Updaing Proeprty Tag,Please Wait..",
			method:"hunters_camp.hunters_camp.doctype.property.property.update_tag",
			args:{doc: frm.doc,sid:frappe.get_cookie('sid'),"tag":tag},
			callback: function(r) {
				if (!r.exec){
					frappe.msgprint(r.message[0].message)
					frm.doc.tag = r.message[1]
					refresh_field(["property_id","tag"])
				}	
			},
			always: function() {
				frappe.ui.form.is_saving = false;
			}
		})
	},
	update_status:function(status,frm){
		frappe.call({
			freeze: true,
			freeze_message:"Updaing Proeprty Status,Please Wait..",
			method:"hunters_camp.hunters_camp.doctype.property.property.update_status",
			args:{doc: frm.doc,sid:frappe.get_cookie('sid'),"status":status},
			callback: function(r) {
				if (!r.exec){
					frappe.msgprint(r.message[0].message)
					refresh_field("property_id")
					frm.doc.status = r.message[1]
					refresh_field("status")
				}
			},
			always: function() {
				frappe.ui.form.is_saving = false;
			}
		})
	}

})

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

frappe.ui.form.on("Property", "attach_image", function(frm) {
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
			console.log("in callback")
			// console.log(file_data)
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
			image_list = frm.doc.property_photos
			show_list = []
			if (image_list){
				image_list.push.apply(image_list, file_data)
				frm.doc.property_photos = image_list
				if (frm.doc.photo_names){
					show_list = (frm.doc.photo_names).split(',')
				}
			}	
			else{
					img_list = []
					console.log(file_data)
					img_list.push.apply(img_list, file_data)
					console.log(img_list)
					frm.doc.property_photos = img_list
				}
			console.log(frm.doc.property_photos)
			show_list.push.apply(show_list, $.map(file_data, function(d){ return d.file_name }))
			frm.doc.photo_names = show_list.join(',')
			refresh_field(["property_photos","photo_names"])
		}
	}
}
display_thumbnail =function(frm){
	wrapper = $(cur_frm.get_field("attachment_display").wrapper)
	wrapper.empty()
	if (frm.doc.property_photos){
		image_list = frm.doc.property_photos
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


check_file_exists = function(frm,file_data){
	var res = true
	// if (frm.doc.property_photos){
	// 	image_list = frm.doc.property_photos
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

cur_frm.fields_dict.property_subtype.get_query = function(doc) {
	return{
		filters:{
			'property_type': doc.property_type
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