frappe.provide("frappe.ui.form");
frappe.provide("property")
{% include 'hunters_camp/hunters_camp/doctype/property/upload.js' %};
{% include 'hunters_camp/hunters_camp/doctype/property/get_lat_lon.js' %};
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
	$(cur_frm.get_field("attachment_display").wrapper).empty()
	//alert("prop_operation");
	prop_operations.init(frm);
	cur_frm.cscript.render_google_map(frm)
	
			
});


cur_frm.cscript.render_google_map = function(frm){
	$(frm.fields_dict['search_location'].wrapper).html("<input type='text' class='form-control' id='search-input'\
		placeholder='Search Location' style='width:200px;margin-top:10px'><div id='my_map' style='width:400px;height:300px'></div>")
	this.my_map = document.getElementById('my_map')
	this.search_input = document.getElementById('search-input')
	gmap = new GoogleMap(this.my_map, this.search_input)
	gm = new GeoCodeManager(gmap, frm)

}





frappe.ui.form.on("Property", "possession", function(frm) {
	var me = this;
	frm.toggle_reqd("month", frm.doc.possession == 0);
	frm.toggle_reqd("year", frm.doc.possession == 0);
});

frappe.ui.form.on("Property", "operation", function(frm) {
	var me = this;
	frm.toggle_reqd("month", frm.doc.operation==="Buy");
	frm.toggle_reqd("year", frm.doc.operation==="Buy");
	if (frm.doc.operation=='Rent') frm.fields_dict["price"].set_label("Expected Rent");
	else frm.fields_dict["price"].set_label("Price");
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



prop_operations = {
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
		// added by arpit , if user is Agent;
		if(!(frappe.get_cookie("user_id") == "Administrator") && inList(user_roles, "Agent") ){
				//data = frappe.meta.get_docfield(cur_frm.doctype, "listed_by", cur_frm.docname);
				//data.read_only =1;
				//refresh_field("listed_by")
			cur_frm.set_df_property("listed_by", "read_only", !frm.doc.__islocal)
			cur_frm.set_value("listed_by","Agent");		
		}
		 
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
		var me = this;
		var has_errors = false;
		frm.scroll_set = false;
		prop_flag = false;
		$.each(frappe.model.get_all_docs(frm.doc), function(i, doc) {
			if (doc.doctype != 'Property' || prop_flag == false){
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
				if (doc.doctype == "Property"){
					prop_flag = true
				}
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
		me.make_fields_read_only_according_to_roles(frm)

	},
	make_fields_read_only_according_to_roles:function(frm){
		prop_fields = ["listed_by", "operation", "property_type", "property_subtype", "property_subtype_option", 
						"no_of_bathroom", "state", "city", "location_link", "city_link", "possession", "transaction_type" ,"property_age",
						"month", "year"]

		if (!(frappe.get_cookie("user_id") == "Administrator" || inList(user_roles, "Propshikari Project Manager"))){
			frm.toggle_enable(prop_fields, false)
		}
	},
	add_possession_status : function(frm, doc){
		if (cur_frm.doc.possession == 1){
					
		}
		else{
			if (cur_frm.doc.possession_status){
				po_list = cur_frm.doc.possession_status.split('-')
				cur_frm.doc.month = po_list[0]  
				cur_frm.doc.year =  po_list[1]
				refresh_field(["month","year","possession"])
			}
		}
	},
	display_property_photo:function(frm, doc){
		wrapper = $(cur_frm.get_field("attachment_display").wrapper)
		wrapper.empty()
		if (frm.doc.thumbnails){
			thumbnails_list = frm.doc.thumbnails.split(',')
			$.each(thumbnails_list ,function(index, thumbnail){
			$("<div class='img-wrap'> <span class='close'>&times;</span><img class='imageThumb prj_img' src="+thumbnail+" ></div>").appendTo(wrapper);
			})
			this.init_delete_property_photo(frm)			
		}
	},
	add_status_and_tag_to_menu:function(frm){
		var me = this;
		frm.page.add_menu_item(__("Set as Discounted"),function(){ me.update_tag("Discounted",frm,"add") },"icon-file-alt");
		frm.page.add_menu_item(__("Set as Verified"),function(){ me.update_tag("Verified",frm,"add") },"icon-file-alt");
		frm.page.add_menu_item(__("Set as Invested"),function(){ me.update_tag("Invested",frm,"add") },"icon-file-alt");
		frm.page.add_menu_item(__("Activate Property"),function(){ me.update_status("Active",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Deactivate Property"),function(){ me.update_status("Deactivated",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Set as Sold"),function(){ me.update_status("Sold",frm) },"icon-file-alt");
		frm.page.add_menu_item(__("Remove Discounted"),function(){ me.update_tag("Discounted",frm,"remove") },"icon-file-alt");
		frm.page.add_menu_item(__("Remove Invested"),function(){ me.update_tag("Invested",frm,"remove") },"icon-file-alt");
		frm.page.add_menu_item(__("Remove Verified"),function(){ me.update_tag("Verified",frm,"remove") },"icon-file-alt");
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
				//frm.doc[docfield.fieldname] = doc[0][docfield.fieldname].join(',')
				cur_frm.set_value(docfield.fieldname,doc[0][docfield.fieldname].join(','))
			}
			else{
				//cur_frm.set_value(docfield.fieldname,doc[0][docfield.fieldname])
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
	update_tag:function(tag,frm,operation){
		var me = this;
		frappe.call({
			freeze: true,
			freeze_message:"Updaing Proeprty Tag,Please Wait..",
			method:"hunters_camp.hunters_camp.doctype.property.property.update_tag",
			args:{doc: frm.doc,sid:frappe.get_cookie('sid'),"tag":tag,"operation":operation},
			callback: function(r) {
				if (!r.exec){
					frappe.msgprint(r.message[0].message)
					//frm.doc.tag = r.message[1]
					cur_frm.set_value("tag",r.message[1])
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
	},
	init_delete_property_photo:function(frm){
		var me = this
		$(".close").click(function(){
			var inner_me = this
			frappe.confirm(__("Are you sure you want to delete Property Photo"), function() {
				if ($(inner_me).siblings().hasClass("prj_img")){
					me.delete_property_photo(frm, inner_me)
				}else{
					img_src = $(inner_me).siblings().attr("src")
					index = 0
					$.each(frm.doc.property_photos, function(i,value){
						if (value.file_data == img_src){
							index = i
							return false
						}
					})
					frm.doc.property_photos.splice(index, 1)
					refresh_field(["property_photos"])
					photo_names = $.map(frm.doc.property_photos, function(d){ return d.file_name })
					frm.doc.photo_names = photo_names.join(',')
					refresh_field(["photo_names"])
					$(inner_me).parent().remove()
				}
			});			

		})

	},
	delete_property_photo:function(frm, cur_img){
		img_src = $(cur_img).siblings().attr("src") 
		return frappe.call({
			freeze:true,
			freeze_message:"Deleting Property Photo Please wait.........",
			method:"hunters_camp.hunters_camp.doctype.property.property.delete_photo",
			args: {doc: frm.doc, sid:frappe.get_cookie('sid'), img_url:img_src},
			callback: function(r) {
				frappe.msgprint(r.message.message)
				frm.doc.full_size_images = r.message.full_size
				frm.doc.thumbnails = r.message.thumbnails
				frm.doc.property_photo = r.message.photo 
				refresh_field(["full_size_images", "thumbnails", "property_photo"])
				$(cur_img).parent().remove()	
			}
		});
	}

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
					img_list.push.apply(img_list, file_data)
					frm.doc.property_photos = img_list
				}
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
				$("<div class='img-wrap'> <span class='close'>&times;</span><img class='imageThumb' title="+img["file_name"]+"  src="+img["file_data"]+" ></div>").appendTo(wrapper);
			});
		}
	}
	display_existing_images(frm,wrapper)
}

display_existing_images = function(frm, wrapper){
	if(frm.doc.thumbnails){
		thumbnails_list = frm.doc.thumbnails.split(',')
		$.each(thumbnails_list ,function(index, thumbnail){
			$("<div class='img-wrap'> <span class='close'>&times;</span><img class='imageThumb prj_img' src="+thumbnail+" ></div>").appendTo(wrapper);
		})
	}
	prop_operations.init_delete_property_photo(frm)
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
	var operation = {}
	if (doc.operation == "Buy"){
		operation["buy"] = 1
	}else if(doc.operation == "Rent"){
		operation["rent"] = 1
	}
	return{
		filters:$.extend({"property_type":doc.property_type}, operation)
	}
}
cur_frm.fields_dict.city_link.get_query = function(doc) {
	return{
		filters:{"state_name":doc.state}
	}
}
cur_frm.fields_dict.location_link.get_query = function(doc) {
	return{
		filters:{"city_name":doc.city_link}
	}
}
cur_frm.fields_dict["amenities"].grid.get_field("amenity_name").get_query = function(doc) {
	return{
		filters:{"property_type":doc.property_type}
	}	
}
cur_frm.fields_dict["flat_facilities"].grid.get_field("facility_name").get_query = function(doc) {
	return{
		filters:{"property_type":doc.property_type}
	}	
}





SearchProperty = Class.extend({
	init:function(frm){
		//alert("second init");
		this.frm = frm
		this.init_for_search_property()
	},
	init_for_search_property:function(){
		var me = this
		cur_frm.add_custom_button(__('Search Property'),function() {
				me.render_dialog_for_property_search() },"btn-primary");
		cur_frm.add_custom_button(__('Clear form'),function() {
				me.clear_form() },"btn-primary");
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
    },
    clear_form: function(){
		frappe.ui.toolbar.clear_cache()
	}

})


cur_frm.fields_dict.property_subtype_option.get_query = function(doc) {
	return {
			filters:{"property_type":doc.property_type},
		}
}

