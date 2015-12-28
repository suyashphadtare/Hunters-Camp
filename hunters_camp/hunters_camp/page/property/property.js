frappe.require("assets/hunters_camp/agent_sharing.css");
frappe.require("assets/hunters_camp/multiselect.js");


frappe.pages['property'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Property',
		single_column: true
	});

	$("<div class='user-settings' \
		style='padding: 15px;'></div>").appendTo(page.main);

	wrapper.property = new Property(wrapper);
}

Property = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".user-settings");
		this.filters = {};
		this.page=1
		this.property_list = []
		this.make();
		this.refresh();
	},
	make: function() {
		var me = this;
		me.filters.property_type = me.wrapper.page.add_field({
					fieldname: "property_type",
					label: __("Property Type"),
					fieldtype: "Link",
					options: "Property Type"
		});
		me.filters.property_subtype = me.wrapper.page.add_field({
					fieldname: "property_subtype",
					label: __("Property Subtype"),
					fieldtype: "Link",
					options: "Property Subtype",
					"get_query": function() {
				return {
					"doctype": "Property Subtype",
					"filters": {
						"property_type": me.filters.property_type.$input.val(),
					}
				}
			}
		});
		me.filters.operation = me.wrapper.page.add_field({
					fieldname: "operation",
					label: __("Operation"),
					fieldtype: "Select",
					options: "\nBuy\nRent"
		});
		me.filters.location = me.wrapper.page.add_field({
					fieldname: "location",
					label: __("Location"),
					fieldtype: "Data"
		});
		
		me.filters.budget_min = me.wrapper.page.add_field({
					fieldname: "budget_min",
					label: __("Budget Minimum"),
					fieldtype: "Currency",
					options:'Company:company:default_currency'
		});
		me.filters.budget_max = me.wrapper.page.add_field({
					fieldname: "budget_max",
					label: __("Budget Maximum"),
					fieldtype: "Currency",
					options:'Company:company:default_currency'
		});
		me.filters.area_min = me.wrapper.page.add_field({
					fieldname: "area_min",
					label: __("Area Minimum"),
					fieldtype: "Data"
		});
		me.filters.area_max = me.wrapper.page.add_field({
					fieldname: "area_max",
					label: __("Area Maximimum"),
					fieldtype: "Data"
		});

		me.lead_management = me.wrapper.page.add_field({
						fieldname: "lead_management",
						label: __("Lead Management"),
						fieldtype: "Data",
						disp_status:"Read"
		});

		me.search = me.wrapper.page.add_field({
						fieldname: "search",
						label: __("Search Property"),
						fieldtype: "Button",
						icon: "icon-search"
		});

		me.advance_filters = me.wrapper.page.add_field({
						fieldname: "advance_filters",
						label: __("Advance Filters"),
						fieldtype: "Button",
						icon: "icon-filter"
		});
		me.share = me.wrapper.page.add_field({
						fieldname: "share",
						label: __("Share"),
						fieldtype: "Button",
						icon: "icon-share-sign"
		});

		me.tag = me.wrapper.page.add_field({
						fieldname: "tag",
						label: __("Apply Tag"),
						fieldtype: "Button",
						icon: "icon-tag"
		});
		me.clear_form = me.wrapper.page.add_field({
						fieldname: "clear_form",
						label: __("Clear Form"),
						fieldtype: "Button",
						icon: "icon-filter"
		});

		$('[data-fieldname=tag]').css('display','none')
		$('[data-fieldname=share]').css('display','none')
		$('[data-fieldname=lead_management]').css('display','none')
		this.init_for_multiple_location()
		// SEARCH CLICK
		//var me = this;
		me.search.$input.on("click", function() {
			//var me = this;
			console.log($(me.filters.location.$input).attr("data-field-city"))
			if(me.filters.operation.$input.val() && me.filters.property_type.$input.val() && me.filters.property_subtype.$input.val()){
				return frappe.call({
					method:'hunters_camp.hunters_camp.page.property.property.build_data_to_search_with_location_names',
					freeze: true,
					freeze_message:"Building Search.....This Might Take Some Time",
					args :{
						"data":{
						"operation": me.filters.operation.$input.val(),
						"property_type": me.filters.property_type.$input.val(),
						"property_subtype": me.filters.property_subtype.$input.val(),
						"location": me.filters.location.$input.val(),
						"budget_minimum": me.filters.budget_min.$input.val(),
						"budget_maximum": me.filters.budget_max.$input.val(),
						"area_minimum": me.filters.area_min.$input.val(),
						"area_maximum": me.filters.area_max.$input.val(),
						"city":$(me.filters.location.$input).attr("data-field-city"),
						"records_per_page": 10,
						"page_number":1,
						"request_source":'Hunterscamp',
						//"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						if(!r.exc) {
							if(r.message['total_records']>0){
								me.render(r.message['data'],r.message['total_records'])
							}
							else{
								$("#property").remove();
								$("#buttons").remove();
								$("#sorting").remove();
								msgprint("Property is not available related to search criteria which you have specified.")
							}		
					}

				},
				
			});
	}
	else
		msgprint("OPERATION,PROPERTY TYPE,PROPERTY SUBTYPE are the mandatory fields to search criteria please specify it.")

	});

	
	// ADVANCE FILTERING...................................................................................
	me.advance_filters.$input.on("click", function() {
		var d = new frappe.ui.Dialog({

			title: __("Add Advance filters"),
					fields: [
						{fieldtype:"Link", label:__("Property Type"),
							options:"Property Type", reqd:1, fieldname:"property_type"},
						{fieldtype:"Select", label:__("Operation"),
							options:"\nBuy\nRent", reqd:1, fieldname:"operation"},
						{fieldtype:"Int", label:__("Min Area"),
						 fieldname:"min_area"},	
						{fieldtype:"Select", label:__("Minimum Budget"),options:"\n0\n25Lac\n50Lac\n75Lac\n1Cr\n2Cr\n3Cr\n4Cr\n5Cr\n10Cr",
						 reqd:0, fieldname:"min_budget"},
						{fieldtype:"Select", label:__("Transaction Type")
							,options:"\nResale\nNew Booking",reqd:0, fieldname:"transaction_type"},
						{fieldtype:"Select", label:__("Age Of Property"),
						 options:"\nUnder Construction\n0-1 Years\n1-5 Years\n5-10 Years\n10+ Years",reqd:0, fieldname:"property_age"},
						{fieldtype:"Data", label:__("Amenities"),
							options:"Amenities",reqd:0, fieldname:"amenities"},
						{fieldtype:"HTML",fieldname:"amenity_html"},	
						{fieldtype:"Column Break",
							reqd:0, fieldname:"cl"},
						{fieldtype:"Link", label:__("Property Sub Type"),
						options:"Property Subtype", reqd:1, fieldname:"property_subtype"},
						{fieldtype:"Data", label:__("Property SubType option"),
							fieldname:"property_subtype_option"},
						{fieldtype:"Int", label:__("Max Area"),
						 fieldname:"max_area"},	
						{fieldtype:"Select", label:__("Maximum Budget"),options:"\n0\n25Lac\n50Lac\n75Lac\n1Cr\n2Cr\n3Cr\n4Cr\n5Cr\n10Cr", reqd:0, fieldname:"max_budget"},
						{fieldtype:"Date", label:__("Posted Date"),
							reqd:0, fieldname:"posting_date"},
						{fieldtype:"Data", label:__("Possession"),
						fieldname:"possession"},
						{fieldtype:"Select", label:__("Listed By"),
							options:"\nOwner\nBroker",reqd:0, fieldname:"listed_by"},	
						{fieldtype:"Section Break",
							reqd:0, fieldname:"sb"},
						{fieldtype:"Button", label:__("Search Property"),
						 fieldname:"submit"}			

					]			
		});
		
		fields=d.fields_dict
		$('[data-fieldname=submit]').css('display','none')

		fields.property_type.input.value = me.filters.property_type.$input.val()
		fields.property_subtype.input.value = me.filters.property_subtype.$input.val()
		fields.operation.input.value = me.filters.operation.$input.val()
		fields.min_budget.input.value = me.filters.budget_min.$input.val()
		fields.max_budget.input.value = me.filters.budget_max.$input.val()

		$('[data-fieldname=submit]').css('display','block')
		d.show();
		$(d.body).find("input[data-fieldname=possession]").datepicker({ dateFormat: 'mm-yy' });
		me.init_for_property_type_change(d, fields)
		$(d.body).find("input[data-fieldname=property_type]").trigger("change")
		values = ['property_type','property_subtype','operation','transaction_type','age_of_property','listed_by']
		final_result = []
		search_fields = ["property_type", "property_subtype", "operation", "property_subtype_option", "property_age",
							"possession", "posting_date", "listed_by", "amenities", "transaction_type", "min_budget",
							"max_budget", "min_area", "max_area"]
		$(fields.submit.input).click(function() {
			search_dict = {}
			$.each(search_fields,function(index, field){
				value = fields[field].$input.val()
				if (value){
					search_dict[field]= value
				}
			})
			search_dict["user_id"] = frappe.get_cookie("hc_user_id")
			search_dict["sid"] = frappe.get_cookie("sid")
			search_dict["location"] = me.filters.location.$input.val()
			frappe.call({
				method:"hunters_camp.hunters_camp.page.property.property.search_property_with_advanced_criteria",
				freeze: true,
				freeze_message:"Building Search.....This Might Take Some Time",
				args:{"property_dict":search_dict},
				callback:function(r){
					if(r.message['total_records']>0){
						me.render(r.message['data'],r.message['total_records'])
					}
					else{
							$("#property").remove();
							$("#buttons").remove();
							$("#sorting").remove();
							msgprint("Property is not available related to search criteria which you have specified.")
						}
					d.hide()			
				}
			})
        	
    	});


	});

	// SHARE FEATURE..............................................
	me.share.$input.on("click", function() {
		var final_property_result = {}
		if(me.prop_list){
			if(me.property_list.length>0){
				lead_record=me.lead_management.$input.val()
				$.each(me.property_list,function(i, property_id){
						final_property_result[property_id]=''
							
				});
				final_result = jQuery.grep(me.prop_list, function( d ) {
							return (d['property_id'] in final_property_result)
				});
				if (me.lead_management.$input.val().length != 0){
					return frappe.call({
						method:'hunters_camp.hunters_camp.page.property.property.add_properties_in_lead_management',
						args :{
							"lead_management":me.lead_management.$input.val(),
							"property_resultset": final_result
						},
						callback: function(r,rt) {
							if(!r.exc) {
								frappe.set_route("Form", 'Lead Management', me.lead_management.$input.val());
								location.reload()
							}
						},
					});	
				}
				else if (in_list(user_roles, "Agent")){
					new AgentPropertyShare()
				}
				else{
					//alert("popup for sharing property for user")
					var d = new frappe.ui.Dialog({
						title: __("Shared properties to user"),
						fields: [
							{fieldtype:"Data", label:__("User"),
								reqd:1, fieldname:"user"},
							{fieldtype:"Small Text", label:__("Comments"),
								fieldname:"comments"},
							{fieldtype:"Button", label:__("Share Property"),
							 fieldname:"share_property"}		
						]

					});
					fields=d.fields_dict
				
					d.show();
					$('[data-fieldname=share_property]').css('display','none')

					$(fields.user.input).change(function(){
			            $('[data-fieldname=share_property]').css('display','block')
			            
			        });

					$(fields.share_property.input).click(function() {
	            		if(fields.user.$input.val()!=null){
	            		return frappe.call({
							method:'hunters_camp.hunters_camp.page.property.property.share_property_to_user',
							freeze:true,
							freeze_message:"Sharing properties....Please Wait",
							args :{
								"user": fields.user.$input.val(),
								"property_resultset": final_result,
								"comments":fields.comments.$input.val()
							},
							callback: function(r,rt) {
								if(!r.exc) {
									msgprint("property is successfully shared to the spcified user.")
									d.hide();
								}
							},
					});	
	            		}
	        		});
					
				}
			}

		else
			msgprint("To share the properties. you must have  to check at least one property.")
	}
		else
			msgprint("There is no any property is available to share.")

	});
	me.clear_form.$input.on("click", function() {
		frappe.ui.toolbar.clear_cache()
	});
	
	// TAG FEATURE...............................................................................
	me.tag.$input.on("click", function() {
		tag_list=[]
		frappe.route_options=[]
		discount_percentage=0.0
		var d = new frappe.ui.Dialog({
			title: __("Apply Tags On Property"),
			fields: [
				{fieldtype:"Check", label:__("Verified"),
					 fieldname:"verified"},
				{fieldtype:"Check", label:__("Invested"),
					fieldname:"invested"},
				{fieldtype:"Check", label:__("Discounted"),
				 fieldname:"discounted"},

				{fieldtype:"Int", label:__("Discounted Percentage"),
				 fieldname:"discount_percentage"},

				 {fieldtype:"Button", label:__("Apply Tag"),
				 fieldname:"apply_tag"}

			]

		});

		fields=d.fields_dict

		$('[data-fieldname=discount_percentage]').css('display','none')
		d.show();
		$(fields.verified.input).click(function() {
			if ($(fields.verified.$input).prop('checked')==true){
				tag_list['Verified']=1
			}
			else if($(fields.verified.$input).prop('checked')==false){
				delete tag_list['Verified']
			}
		})

		$(fields.invested.input).click(function() {
			if ($(fields.invested.$input).prop('checked')==true){
				tag_list['Invested']=1
			}
			else if($(fields.invested.$input).prop('checked')==false){
				delete tag_list['Invested']
			}
		})

		$(fields.discounted.input).click(function() {
			if ($(fields.discounted.$input).prop('checked')==true){
				$('[data-fieldname=discount_percentage]').css('display','block')
				tag_list['Discounted']=1
				
			}
			else if($(fields.discounted.$input).prop('checked')==false){
				$('[data-fieldname=discount_percentage]').css('display','none')
				delete tag_list['Discounted']
				discount_percentage=0.0
			}
		})


		$(fields.apply_tag.input).click(function() {
			if((Object.keys(tag_list).length)>0){
				$.each(me.property_list, function(i, j) {
					 frappe.call({
								method:'propshikari.versions.v1.update_property_tag',
								freeze:true,
								freeze_message:"Applying Tag....",
								'async': false,
								args :{
									"data":{
									"property_id": j,
									"tags": Object.keys(tag_list),
									"discount_percentage": parseInt(fields.discount_percentage.$input.val()),
									"user_id": frappe.get_cookie('hc_user_id'),
									"sid": frappe.get_cookie('sid')
								  },
								},
								callback: function(r,rt) {
									if(!r.exc) {
										if(i+1==me.property_list.length){
											$('[data-fieldname=search]').trigger("click");	
										}
										d.hide();		
									}
								},
						});	
				})
			}
		})	
	});

	// bind change event
	// $.each(me.filters, function(k, f) {
	// 	f.$input.on("change", function() {
	// 		me.refresh();
	// 	});
	// });

	},
	init_for_multiple_location:function(){
		var me = this
		frappe.call({
			method:"hunters_camp.hunters_camp.page.property.property.get_location_list",
			callback:function(r){
				me.location_list = r.message
				LocationMultiSelect.prototype.init($(me.wrapper).find("input[data-fieldname=location]"), r.message)
				//new LocationMultiSelect($(me.wrapper).find("input[data-fieldname=location]"), r.message)
			}
		})	
	},
	init_for_property_type_change:function(dialog, dialog_fields){
		var amenity_obj = ''
		var subtype_obj = ''
		$(dialog.body).find("input[data-fieldname=property_type]").change(function(){
			$(dialog.body).find("input[data-fieldname=amenities]").val("")
			$(dialog.body).find("input[data-fieldname=property_subtype_option]").val("")
			frappe.call({
				method:"hunters_camp.hunters_camp.page.property.property.get_amenities",
				args:{"property_type":$(this).val()},
				callback:function(r){
					console.log(r.message)
					if (!amenity_obj && !subtype_obj){
						amenity_obj = new Multiselect($(dialog.body).find("input[data-fieldname=amenities]"), r.message.amenities)		
						subtype_obj = new Multiselect($(dialog.body).find("input[data-fieldname=property_subtype_option]"), r.message.subtype_options)
					}
					else{
						amenity_obj.source = r.message.amenities
						subtype_obj.source = r.message.subtype_options
					}
					
				}
			})
		})
	},
	init_for_multiselect:function(availableTags, autocomplete_field){
		autocomplete_field.autocomplete({
	        minLength: 0,
	        source: function( request, response ) {
	          // delegate back to autocomplete, but extract the last term
	          response( $.ui.autocomplete.filter(
	            availableTags, extractLast( request.term ) ) );
	        },
	        focus: function() {
	          // prevent value inserted on focus
	          return false;
	        },
	        select: function( event, ui ) {
	          console.log(this.value)
	          var terms = split( this.value );
	          // remove the current input
	          terms.pop();
	          // add the selected item
	          terms.push( ui.item.value );
	          // add placeholder to get the comma-and-space at the end
	          terms.push( "" );
	          this.value = terms.join( "," );
	          return false;
	        }
      	});

      	function split( val ) {
  			return val.split( /,\s*/ );
		}
    	function extractLast( term ) {
      		return split( term ).pop();
    	}
	},
	refresh: function() {
		var me = this;
		
		if(!frappe.route_options){
			// me.filters.property_type.input.value= 'Residential'
			// me.filters.property_subtype.input.value='Family Home'
			// me.filters.operation.input.value='Rent'
			this.body.html("<p class='text-muted'>"+__("Specify filters to serach property.")+"</p>");
			return;
		}
		me.filters.property_type.input.value= frappe.route_options['property_type']
		me.filters.property_subtype.input.value=frappe.route_options['property_subtype']
		me.filters.operation.input.value= frappe.route_options['operation'] ? frappe.route_options['operation'] : null
		me.filters.location.input.value= frappe.route_options['location'] ? frappe.route_options['location'] : null
		$(me.filters.location.input).attr("data-field-city",frappe.route_options['city'])
		me.filters.budget_min.input.value=frappe.route_options['budget_minimum'] ? frappe.route_options['budget_minimum'] : null
		me.filters.budget_max.input.value=frappe.route_options['budget_maximum'] ? frappe.route_options['budget_maximum'] : null
		me.filters.area_max.input.value=frappe.route_options['area_maximum'] ? frappe.route_options['area_maximum'] : null
		me.filters.area_min.input.value=frappe.route_options['area_minimum'] ? frappe.route_options['area_minimum'] : null
		me.lead_management.input.value=frappe.route_options['lead_management']

		if(me.lead_management.$input.val().length != 0)
			$('[data-fieldname=search]').css('display','none')
		else
			$('[data-fieldname=search]').css('display','block')


		me.render(frappe.route_options['data'],frappe.route_options['total_records']);
	},
	
	render: function(prop_list,total_records) {
		var me = this;
		var current_page = 1;
		var records_per_page = 10;
		var property_data
		var check_property_list =[]
		var flag 
		var numPages=Math.ceil(total_records/records_per_page)
		this.property_list = []
		this.final_data = []
		this.body.empty();
		this.prop_list=prop_list
		
		this.changePage(1,numPages,this.prop_list,records_per_page,this.prop_list.length,flag='Normal');
		

	},


	changePage: function(page,numPages,values,records_per_page,length,flag)
	{	
		var me=this
		if(flag=='Normal'){
			$("#property").remove();
			$("#buttons").remove();
			$("#sorting").remove();
			$("#status").remove();
			$("<div><div id='sorting' style='float:right;text-align=right'>\
			<select name='primary' class='input-with-feedback form-control input-sm' id='select_alert' >\
			<option class='form-control' value='sort_by'>Sort By</option>\
  			<option class='form-control' value='posting_date'>Posting Date</option>\
   			<option class='form-control' value='rate'>Rate</option>\
			</select></div>\
			<div id='status' style='float:right;text-align=right;margin-right:10px'>\
			<select name='primary' class='input-with-feedback form-control input-sm' id='select_status' >\
			<option class='form-control' value='status'>Status</option>\
   			<option class='form-control' value='Deactivated'>Deactivated</option>\
   			<option class='form-control' value='Sold'>Sold</option>\
			</select></div>\
			</div>").appendTo(me.body)
			var e = document.getElementById("status");
			e.style.display = 'none';
		}
		else{
			$("#property").remove();
			$("#buttons").remove();
		}

		

		var arr= []
	    if (page < 1) page = 1;
	    if (page > numPages) page = numPages;

	    me.show_user_property_table(page,numPages,values,records_per_page,length,flag);

	    $("#page").text(length)
	    if(length==1)
	    	$("#page")

	    if (page == 1) {
	        btn_prev.style.visibility = "hidden";
	    } else {
	        btn_prev.style.visibility = "visible";
	    }
	    if (page == numPages){
	        btn_next.style.visibility = "hidden";
	     } 
	     else {
	        btn_next.style.visibility = "visible";
	    }
	  
	},


	show_user_property_table: function(page,numPages,values,records_per_page,length,flag) {

		var me = this
		me.property_data=values
		$("<div id='property' class='col-md-12'>\
			<div class='row'><ul id='mytable'style='list-style-type:none'></ul>\
			</div></div>\
			<div id='buttons' >\
		<p align='right'><input type='button' value='Prev' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_prev'>\
		<input type='button' value='Next' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_next'></p>\
		<p align='left'><b>Total Documents:</b> <span id='page'></span></p></div>").appendTo(me.body);


		$.each(values, function(i, d) {

			$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
				<div id='image' class='col-md-2 property-image' style='border: 1px solid #d1d8dd;'>  \
				<div id='img' class='col-md-12 image-div'>\
				<div id="+i+" class='row property_img'></div>\
				</div>\
				</div>\
			 <div id='details' class='col-md-10 property-main-div'>\
			 <div id="+d['property_id']+" class='col-md-12 property-id' style='border: 1px solid #d1d8dd;'>\
			 </div></div>\
			 </div></li>").appendTo($(me.body).find("#mytable"))

			if(d['property_photo'])
				$("<a class='thumbnail img-class'><img id='theImg' src="+d['property_photo']+" style='height:110px; align:center'></a>").appendTo($(me.body).find("#"+i+""))
			else
				$("<img id='theImg' src='/assets/hunters_camp/No_image_available.jpg'/ class='img-rounded' align='center'>").appendTo($(me.body).find("#"+i+""))
				

			$("<ul id='mytab' class='nav nav-tabs' role='tablist' >\
			      <li role='presentation' class='active'><a href='#general"+""+i+"' id='home-tab' style='height:35px;margin-top:-3px;'role='tab' data-toggle='tab' aria-controls='home' aria-expanded='false'><i class='icon-li icon-file'></i>&nbsp;&nbsp;General Details</a></li>\
			      <li role='presentation' class=''><a href='#more"+""+i+"' role='tab' id='profile-tab' style='height:35px;margin-top:-3px;' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;More Details</a></li>\
			      <li role='presentation' class=''><a href='#amenities"+""+i+"' role='tab' id='profile-tab' data-toggle='tab'  style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-building'></i>&nbsp;&nbsp;Amenities</a></li>\
			      <li role='presentation' class=''><a href='#contact"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-user'></i>&nbsp;&nbsp;Contacts</a></li>\
			      <li role='presentation' class=''><a href='#tag"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-tag'></i>&nbsp;&nbsp;Tags</a></li>\
			      <div id="+d['property_id']+" style='float:right;' >\
				<input type='checkbox' class='cb' />\
				</div></ul></div>\
			    </ul>\
			    <div id='mytable' class='tab-content' style='background-color=#fafbfc;'>\
			      <div role='tabpanel' class='tab-pane fade active in' style='overflow:auto;height: 110px;' id='general"+""+i+"' aria-labelledby='home-tab'>\
			       <div class='col-md-6' style='background-color=#fafbfc;'>\
			        <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Property Id :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='property-id'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Area :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='area'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Location :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='location'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Price :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='price'></div>\
			        </div>\
			       </div>\
			       </div>\
			       <div class='col-md-6' style='background-color=#fafbfc;'>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Property Name :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='property-name'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>BHK :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='bhk'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Posting Date :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='posting_date'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Bathroom :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='bathroom'></div>\
			        </div>\
			       </div>\
			       </div>\
			       </div>\
			      <div role='tabpanel' class='tab-pane fade' style='overflow:auto;height: 110px;' id='more"+""+i+"' aria-labelledby='profile-tab'>\
			      <div class='col-md-6' style='background-color=#fafbfc;'>\
			        <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Property Ownership :</b></div>\
			       </div>\
			       <div class='col-md-6 row' style='margin-left: 10px'>\
			        <div class='row property-row' id='property-ownership'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Number Of Floors :</b></div>\
			       </div>\
			       <div class='col-md-6 row main-row'style='margin-left: 10px'>\
			        <div class='row property-row' id='floors'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row '>\
			       <div class='row property-row'><b>Maintenance :</b></div>\
			       </div>\
			       <div class='col-md-6 row main-row' style='margin-left: 10px'>\
			        <div class='row property-row' id='maintainance'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Security Deposit :</b></div>\
			       </div>\
			       <div class='col-md-6 row main-row' style='margin-left: 10px'>\
			        <div class='row property-row' id='deposite'></div>\
			        </div>\
			       </div>\
			       </div>\
			       <div class='col-md-6' style='background-color=#fafbfc;'>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Age Of Property :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='age'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Furnishing Type :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='furnishing_type'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Society Name :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='society_name'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Address :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='address'></div>\
			        </div>\
			       </div>\
			       </div>\
			      </div>\
			      <div role='tabpanel' class='tab-pane fade' style='overflow:auto;height: 110px;' id='amenities"+""+i+"' aria-labelledby='profile-tab'>\
			      <div class='col-md-6' id='amenities-first' style='background-color=#fafbfc;'>\
			      </div>\
			      <div class='col-md-6' id='amenities-second' style='background-color=#fafbfc;'>\
			      </div>\
			      </div>\
			      <div role='tabpanel' class='tab-pane fade'  id='contact"+""+i+"' aria-labelledby='profile-tab'>\
			      <div class='col-md-6' style='background-color=#fafbfc;'>\
			        <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Agent Name :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='agent_name'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Agent No. :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='agent_no'></div>\
			        </div>\
			       </div>\
			       </div>\
			       <div class='col-md-6' style='background-color=#fafbfc;'>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Contact Person :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='contact-name'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Contact No :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='contact_no'></div>\
			        </div>\
			       </div>\
			      </div>\
			      </div>\
			      <div role='tabpanel' class='tab-pane fade' style='overflow:auto;height: 110px;' id='tag"+""+i+"' aria-labelledby='profile-tab'>\
			      <div class='col-md-6' id='tag-first' style='background-color=#fafbfc;'>\
			      </div>\
			      <div class='col-md-6' id='tag-second' style='background-color=#fafbfc;'>\
			      </div>\
			      </div>\
			    </div>").appendTo($(me.body).find("#"+d['property_id']+""))

	
		

		$($(me.body).find("#"+d['property_id']+"")).find("#property-id").append('<div class="row property-row"><a class="pv" id="'+d['property_id']+'">'+d['property_id']+'<a></div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#area").append('<div class="row property-row">'+d['carpet_area'] ? d['carpet_area'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#location").append('<div class="row property-row">'+d['location'] ? d['location'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#price").append('<div class="row property-row">'+d['price'] ? d['price'] : ""+'</div>')
		
		$($(me.body).find("#"+d['property_id']+"")).find("#property-name").append('<div class="row property-row">'+d['property_title'] ? d['property_title'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#bhk").append('<div class="row property-row">'+d['bhk'] ? d['property_subtype_option'] :" "+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#posting_date").append('<div class="row property-row">'+d['posting_date'] ? d['posting_date'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#bathroom").append('<div class="row property-row">'+d['no_of_bathroom'] ? d['no_of_bathroom'] : ""+'</div>')


		$($(me.body).find("#"+d['property_id']+"")).find("#property-ownership").append('<div class="row property-row">'+d['property_ownership'] ? d['property_ownership'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#floors").append('<div class="row property-row">'+d['no_of_floors'] ? d['no_of_floors'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#maintainance").append('<div class="row property-row">'+d['maintainance_charges'] ? d['maintainance_charges'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#deposite").append('<div class="row property-row">'+d['security_deposit'] ? d['security_deposit'] : ""+'</div>')
		
		$($(me.body).find("#"+d['property_id']+"")).find("#age").append('<div class="row property-row">'+d['property_age'] ? d['property_age'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#furnishing_type").append('<div class="row property-row">'+d['furnishing_type'] ? d['furnishing_type'] :" "+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#society_name").append('<div class="row property-row">'+d['society_name'] ? d['society_name'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#address").append('<div class="row property-row">'+d['address'] ? d['address'] : ""+'</div>')


		

		if(d['amenities']!=null){

			$.each(d['amenities'], function(i, j){
				if(j['status']=='Yes'){
					console.log("hi")
					if(i%2==0)
					{
						$($(me.body).find("#"+d['property_id']+"")).find("#amenities-first").append('<div class="row row-id"><div class="col-md-6 row"><div class="row property-row"><b>'+j['name']+' :</b></div></div><div class="col-md-6 row"><div class="row property-row">'+j['status']+'</div></div></div>')
					}
					else if(Math.abs(i) % 2 == 1){
						$($(me.body).find("#"+d['property_id']+"")).find("#amenities-second").append('<div class="row row-id"><div class="col-md-6 row"><div class="row property-row"><b>'+j['name']+' :</b></div></div><div class="col-md-6 row"><div class="row property-row">'+j['status']+'</div></div></div>')

				}

				}
					
				})
		}


		$($(me.body).find("#"+d['property_id']+"")).find("#contact-name").append('<div class="row property-row">'+d['contact_person'] ? d['property_person'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#contact_no").append('<div class="row property-row">'+d['contact_no'] ? d['contact_no'] :" "+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#agent_name").append('<div class="row property-row">'+d['agent_name'] ? d['agent_name'] : ""+'</div>')
		$($(me.body).find("#"+d['property_id']+"")).find("#agent_no").append('<div class="row property-row">'+d['agent_no'] ? d['agent_no'] : ""+'</div>')


		

		if(d['tag']!=null){

		if(d['tag'].length!=0){
			$.each(d['tag'], function(i, j){
				if(i%2==0){
					$($(me.body).find("#"+d['property_id']+"")).find("#tag-first").append('<div class="row row-id"><div class="col-md-6 row"><div class="row property-row"><b><i class="icon-check"></i></b></div></div><div class="col-md-6 row"><div class="row property-row tag-row">'+j+'</div></div></div>')
					
				}
				else if(Math.abs(i) % 2 == 1){
					$($(me.body).find("#"+d['property_id']+"")).find("#tag-second").append('<div class="row row-id"><div class="col-md-6 row"><div class="row property-row"><i class="icon-check"></i></div></div><div class="col-md-6 row"><div class="row property-row tag-row">'+j+'</div></div></div>')
				}
			})
		}

	}

		// $(me.body).find("#property_list"+i+"").after('<hr class="line"></hr>');
		

	})


	me.init_for_checkbox();


	$('.pv').click(function(){
		return frappe.call({
			type: "GET",
			method:"hunters_camp.hunters_camp.doctype.property.property.view_property",
			freeze:true,
			freeze_message:"Loading Property....",
			args: {
				"property_id":$(this).attr('id'),
				"sid":frappe.get_cookie("sid")
			},
			freeze: true,
			callback: function(r) {
				if(!r.exc) {
					var doc = frappe.model.sync(r.message);
					frappe.route_options = {"doc":doc};
					frappe.set_route("Form",'Property','Property');
				}
			}
		})
	})



	$('#btn_prev').click(function(){
		//console.log(page)
		if (page > 1) {
			//console.log(page)
        	page--;
       		return frappe.call({
					method:'propshikari.versions.v1.search_property',
					freeze:true,
					freeze_message:"Getting properties..",
					args :{
						"data":{
						"operation": me.filters.operation.$input.val(),
						"property_type": me.filters.property_type.$input.val(),
						"property_subtype": me.filters.property_subtype.$input.val(),
						"location": me.filters.location.$input.val(),
						"budget_minimum": me.filters.budget_min.$input.val(),
						"budget_maximum": me.filters.budget_max.$input.val(),
						"area_minimum": me.filters.area_min.$input.val(),
						"area_maximum": me.filters.area_max.$input.val(),
						"records_per_page": 10,
						"page_number":page,
						"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						if(!r.exc) {
							if(r.message['data'].length>0){
								if(me.lead_management.$input.val().length != 0){
									me.show_unique_properties(page,numPages,r.message['data'],records_per_page,r.message['data'].length,flag='Normal');
								}
								else
									me.changePage(page,numPages,r.message['data'],records_per_page,r.message['data'].length,flag='Normal');
						}
					}
					},
			});	
    }

    })



    $('#btn_next').click(function(){
    	if (page < numPages) {
       	 	page++;
       	 	return frappe.call({
					method:'propshikari.versions.v1.search_property',
					freeze:true,
					freeze_message:"Loading More Properties....",
					args :{
						"data":{
						"operation": me.filters.operation.$input.val(),
						"property_type": me.filters.property_type.$input.val(),
						"property_subtype": me.filters.property_subtype.$input.val(),
						"location": me.filters.location.$input.val(),
						"budget_minimum": me.filters.budget_min.$input.val(),
						"budget_maximum": me.filters.budget_max.$input.val(),
						"area_minimum": me.filters.area_min.$input.val(),
						"area_maximum": me.filters.area_max.$input.val(),
						"records_per_page": 10,
						"page_number":page,
						"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						if(!r.exc) {
							if(r.message['data'].length>0){
								me.prop_list=r.message['data']
								me.property_list=[]
								if(me.lead_management.$input.val().length != 0){
									me.show_unique_properties(page,numPages,r.message['data'],records_per_page,r.message['data'].length,flag='Normal');
								}
								else
									me.changePage(page,numPages,r.message['data'],records_per_page,r.message['data'].length,flag='Normal');
							}
							else{
								msgprint("There is no more properties available against the required serach criteria")
							}
						}
					},
			});	

       	}
    })


	
	//$( "#sorting" ).click(function() {
	$( "#select_alert" ).change(function(){
		result_set= []
		if($("#select_alert").val()=='posting_date'){
			me.property_data.sort(date_sort_desc);
			me.changePage(page,numPages,me.property_data,records_per_page,me.property_data.length,flag='Sorting');
		}
		else if($("#select_alert").val()=='rate'){
			me.property_data.sort(rate_sort_asc);
			me.changePage(page,numPages,me.property_data,records_per_page,me.property_data.length,flag='Sorting');
		}


	});

	var date_sort_desc = function (object1, object2) {
	  if (object1['posting_date'] > object2['posting_date']) return -1;
	  if (object1['posting_date'] < object2['posting_date']) return 1;
	  return 0;
	};

	var rate_sort_asc = function (object1, object2) {
	  if (object1['price'] > object2['price']) return 1;
	  if (object1['price'] < object2['price']) return -1;
	  return 0;
	};



	//$( "#status change" ).click(function() {
	$( "#select_status" ).change(function(){
		var status
		result_set= []
		status = status

		$.each(me.check_property_list, function(i, j) {
			frappe.call({
				method:'propshikari.versions.v1.update_property_status',
				freeze_message:"Updating property Status....",
				freeze:true,
				'async': false,
				args :{
					"data":{
					"property_id": j,
					"property_status":$("#select_status").val(),
					"user_id": frappe.get_cookie('hc_user_id'),
					"sid": frappe.get_cookie('sid')
				  },
				},
				callback: function(r,rt) {
					if(!r.exc) {
						console.log(r.message)
						if(i+1==me.check_property_list.length){
							$('[data-fieldname=search]').trigger("click");	
						}
							
					}
				},
			});	
		})
	});


	

	},

	


	init_for_checkbox: function(){
		var me = this;
		me.flag=0
		var e = document.getElementById("status");
		$('.cb').click(function(){
			if ($(this).prop('checked')==true){ 
				me.property_list.push($(this).parent().attr("id"))
				if(me.property_list.length==1){
					$('[data-fieldname=tag]').css('display','block')
					$('[data-fieldname=share]').css('display','block')
					e.style.display = 'block';


				}
				
			}
			else if($(this).prop('checked')==false){
				var removeItem = $(this).parent().attr("id");
				me.property_list = jQuery.grep(me.property_list, function(value) {
				  return value != removeItem;
				});
				if(me.property_list.length==0){
					$('[data-fieldname=tag]').css('display','none')
					$('[data-fieldname=share]').css('display','none')
					$('[data-fieldname=status]').css('display','none')
					e.style.display = 'none';
				}

			}
			me.check_property_list=me.property_list
			
	});
	
	
	},


	show_unique_properties:function(page,numPages,data,records_per_page,length,flag){
		var me=this
		result=data
		return frappe.call({
			method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_diffrent_property',
			args :{
				"data":data,
				"lead_management":me.lead_management.input.value
			},
			callback: function(r,rt) {
				var final_property_result = {}
				if(r.message){
					if(Object.keys(r.message).length>0){
						$.each(r.message['property_id'],function(i, property){
								final_property_result[(property['property_id'].trim())]=''
								
						});
						final_result = jQuery.grep(result, function( d ) {
								return !(d['property_id'] in final_property_result)
						});
						if(final_result.length>0){
							final_result=final_result
							me.changePage(page,numPages,final_result,records_per_page,final_result.length,flag='Normal');
						}
						else{
							return frappe.call({
								method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_administartor',
								args :{
									"operation": me.filters.operation.$input.val(),
									"property_type": me.filters.property_type.$input.val(),
									"property_subtype": me.filters.property_subtype.$input.val(),
									"location": me.filters.location.$input.val(),
									"budget_minimum": me.filters.budget_min.$input.val(),
									"budget_maximum": me.filters.budget_max.$input.val(),
									"area_minimum": me.filters.area_min.$input.val(),
									"area_maximum": me.filters.area_max.$input.val()
								},
								callback: function(r,rt) {
									msgprint("There is no any properties found against the specified criteria so,email with property search criteria is sent to administartor.")
									
								},
							})
				  }		}
			}
			  else{
			  	me.changePage(page,numPages,result,records_per_page,result.length,flag='Normal');
			  }
			},
		});		

	},

	


})



AgentPropertyShare = Class.extend({
	init:function(){
		this.render_dialog()	
	},
	render_dialog:function(){
		this.dialog = new frappe.ui.Dialog({
						title: __("Shared properties to Agent"),
						fields: [
							{fieldtype:"Link", label:__("Agent"), reqd:1, fieldname:"agent", "options":"Agent"},
							{fieldtype:"Small Text",fieldname:"agents", label:"Email ID"},
							{fieldtype:"HTML", fieldname:"share_html"},
							{fieldtype:"Button", label:__("Share Property"), fieldname:"share_prop"}		
						]
					});

		this.fields=this.dialog.fields_dict
		this.dialog.show();
		console.log($(this.dialog.body))
		$(".modal-dialog").css("width","750px");
		$(this.dialog.body).find("textarea[data-fieldname='agents']").css("height", "50px")
		$(this.dialog.body).find("textarea[data-fieldname='agents']").attr("disabled",true)
		this.render_property_table();
		this.init_for_agent_selection() 
		this.init_for_share_property()
	},
	render_property_table:function(){
		this.prop_ids = this.get_checked_property_id()
		this.render_prop_table()
	},
	get_checked_property_id:function(){
		var me = this
		this.checked_prop = $(".cb:checkbox:checked")
		this.prop_list = []
		$.each(this.checked_prop, function(index, property){
			prop_dict = {}
			prop_dict["property_id"] =  $(property).parent().attr("id")
			me.prop_list.push(prop_dict)
		})
		console.log(this.prop_list)
		return this.prop_list
	},
	render_prop_table:function(){
		console.log()
		$(this.dialog.body).find("[data-fieldname='share_html']").html(this.get_table_html())
	},
	get_table_html:function(){
		table_html = "<table class='table table-fixed' id='prop_table' style='margin-top:20px'><thead ><tr class='row'><th class='col-xs-4 text-center'>Property Id</th>\
				<th class='col-xs-4'>Comments</th><th class='col-xs-2'>Property Through</th><th class='col-xs-2'>Doc Available</th></tr></thead><tbody>"
		$.each(this.prop_ids, function(i,property){
			select_html = '<select class="form-control prop_through"><option></option><option>Direct</option><option>Through 1</option>\
							<option>Through 2</option><option>Through 3+</option></select>'
			doc_select = '<select class="form-control doc_available"><option></option><option>Yes</option><option>No</option></select>'
			values = { "property_id":property["property_id"], "select":select_html, "doc_select":doc_select}
			row = repl("<tr class='row'><td class='col-xs-4 p_id text-center' >%(property_id)s</td><td class='col-xs-4'><textarea type='text' class='comments'></textarea></td>\
				<td class='col-xs-2'>%(select)s</td><td class='col-xs-2'>%(doc_select)s</td></tr>", values)
			table_html += row
		})
		table_html += "</tbody>"
		return table_html
	},
	init_for_agent_selection:function(){
		var me = this
		$(this.dialog.body).find("input[data-fieldname='agent']").change(function(){
			agents = $(me.dialog.body).find("textarea[data-fieldname='agents']").val()
			if(agents){
				agent_values = agents.split(',')
				agent_values.push($(this).val())
				agent_values = agent_values.join(",")
			}else{
				agent_values = $(this).val()
			}
			$(me.dialog.body).find("textarea[data-fieldname='agents']").val(agent_values)

		})
	},
	init_for_share_property:function(){
		var me = this
		$(this.dialog.body).find("button[data-fieldname='share_prop']").click(function(){
			if(me.check_for_mandatory_fields()){
				comment_list = me.get_property_object()
				agents_list = $(me.dialog.body).find("textarea[data-fieldname='agents']").val()
				me.dialog.hide()
				frappe.call({
					freeze:true,
					freeze_message:"Share property opertaion is in progress........",
					method:"hunters_camp.hunters_camp.page.property.property.share_property_to_agents",
					args:{"email_id":agents_list, "comments":comment_list, "sid":frappe.get_cookie("sid"), "user_id":frappe.get_cookie("hc_user_id")},
					callback:function(r){
						frappe.msgprint(r.message.message)
					}
				})
			}
		})	
	},
	check_for_mandatory_fields:function(){
		var me = this
		if (! $(me.dialog.body).find("textarea[data-fieldname='agents']").val()){
			frappe.msgprint("Agent Email Ids are mandatory for property sharing.")
			return false
		}
		return true
	},
	get_property_object:function(){
		comments_list = []
		var me = this
		$.each($(me.dialog.body).find("#prop_table tbody tr"), function(i, row){
			prop_dict = {}
			prop_dict["property_id"] = $(row).find(".p_id").text()
			prop_dict["comment"] = $(row).find(".comments").val()
			prop_dict["prop_through"] = $(row).find(".prop_through").val()
			prop_dict["doc_available"] = $(row).find(".doc_available").val()
			comments_list.push(prop_dict)
		})
		return comments_list
	}

})
