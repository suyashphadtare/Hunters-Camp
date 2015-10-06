frappe.pages['property'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Property',
		single_column: true
	});

	$("<div class='user-settings' \
		style='min-height: 2600px; padding: 15px;'></div>").appendTo(page.main);

	wrapper.property = new Property(wrapper);
}

Property = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".user-settings");
		this.filters = {};
		this.property_list = []
		this.make();
		this.refresh();
	},
	make: function() {
		var me = this;
		console.log("in make")
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
					options: "Property Subtype"
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
					fieldtype: "Data"
		});
		me.filters.budget_max = me.wrapper.page.add_field({
					fieldname: "budget_max",
					label: __("Budget Maximum"),
					fieldtype: "Data"
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
						fieldtype: "Data"
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

		
		// SEARCH CLICK
		me.search.$input.on("click", function() {
			if(me.filters.operation.$input.val() && me.filters.property_type.$input.val() && me.filters.property_subtype.$input.val()){
				return frappe.call({
					method:'propshikari.versions.v1.search_property',
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
						"page_number":1,
						"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						if(!r.exc) {
							console.log(["serach property",r.message])
							if(r.message['total_records']>0){
								me.render(r.message['data'],r.message['total_records'])
							}
							else{
								return frappe.call({
									method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_administartor',
									args :{
										"property_type": me.filters.property_type.$input.val(),
										"property_subtype": me.filters.property_subtype.$input.val(),
										"operation":me.filters.operation.$input.val(),
										"location": me.filters.location.$input.val(),
										"budget_minimum": me.filters.budget_min.$input.val(),
										"budget_maximum": me.filters.budget_max.$input.val(),
										"area_minimum": me.filters.area_min.$input.val(),
										"area_maximum": me.filters.area_max.$input.val()
									},
									callback: function(r,rt) {
										msgprint("There is no any properties found aginst the specified criteria so,email with property search criteria is sent to administartor.")
									},
								})
							}		
					}

				},
				
			});

	}
	else
		msgprint("OPERATION,PROPERTY TYPE,PROPERTY SUBTYPE are the amnadatory fields tos erach criteria please specify it")

	});

	
	// ADVANCE FILTERING
	me.advance_filters.$input.on("click", function() {

		var d = new frappe.ui.Dialog({

			title: __("Add Advance filters"),
					fields: [
						{fieldtype:"Link", label:__("Property Type"),
							options:"Property Type", reqd:1, fieldname:"a_property_type"},
						{fieldtype:"Select", label:__("Operation"),
							options:"\nBuy\nRent", reqd:1, fieldname:"a_operation"},
						{fieldtype:"Select", label:__("Minimum Budget"),
							options:"\n0\n25lac\n50lac\n75lac\n1cr", reqd:0, fieldname:"a_min_budget"},
						{fieldtype:"Data", label:__("Transaction Type"),
							reqd:0, fieldname:"transaction_type"},
						{fieldtype:"Data", label:__("Age Of Property"),
						reqd:0, fieldname:"age"},
						{fieldtype:"Data", label:__("Amenities"),
							options:"\nOwner\nBroker",reqd:0, fieldname:"amenities"},
						{fieldtype:"Column Break",
							reqd:0, fieldname:"cl"},
						{fieldtype:"Link", label:__("Property Sub Type"),
						options:"Property Subtype", reqd:1, fieldname:"a_property_subtype"},
						{fieldtype:"Date", label:__("Posted Date"),
							reqd:0, fieldname:"psoting_date"},
						{fieldtype:"Select", label:__("Maximum Budget"),
							options:"\n25lac\n50lac\n75lac\n1cr", reqd:0, fieldname:"a_max_budget"},
						{fieldtype:"Data", label:__("Possession"),
						 reqd:0, fieldname:"possession"},
						{fieldtype:"Select", label:__("Listed By"),
							options:"\nOwner\nBroker",reqd:0, fieldname:"listed_by"},			

					]			
		});

		d.show();

	});

	
	me.share.$input.on("click", function() {
		var final_property_result = {}
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
						}
					},
				});	
			}
			else{
				//alert("popup for sharing property for user")
				var d = new frappe.ui.Dialog({
					title: __("Shared properties to user"),
					fields: [
						{fieldtype:"Link", label:__("User"),
							options:"User", reqd:1, fieldname:"user"},
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
		

	})
	


	// bind change event
	// $.each(me.filters, function(k, f) {
	// 	f.$input.on("change", function() {
	// 		me.refresh();
	// 	});
	// });

	},

	refresh: function() {
		var me = this;

		if(!frappe.route_options){
			this.body.html("<p class='text-muted'>"+__("Specify filters to serach property.")+"</p>");
			return;
		}

		me.filters.property_type.input.value= frappe.route_options['property_type']
		me.filters.property_subtype.input.value=frappe.route_options['property_subtype']
		me.filters.operation.input.value= frappe.route_options['operation'] ? frappe.route_options['operation'] : null
		me.filters.location.input.value= frappe.route_options['location'] ? frappe.route_options['location'] : null
		me.filters.budget_min.input.value=frappe.route_options['budget_minimum'] ? frappe.route_options['budget_minimum'] : null
		me.filters.budget_max.input.value=frappe.route_options['budget_maximum'] ? frappe.route_options['budget_maximum'] : null
		me.filters.area_max.input.value=frappe.route_options['area_maximum'] ? frappe.route_options['area_maximum'] : null
		me.filters.area_min.input.value=frappe.route_options['area_minimum'] ? frappe.route_options['area_minimum'] : null
		me.lead_management.input.value=frappe.route_options['lead_management']

		me.render(frappe.route_options['data'],frappe.route_options['total_records']);
		console.log(["frrrr",frappe.route_options['total_records']])
	},
	
	render: function(prop_list,total_records) {
		console.log("in render")
		console.log(total_records)
		console.log(prop_list.length)
		var me = this;
		var current_page = 1;
		var records_per_page = 10;
		var numPages=Math.ceil(total_records/records_per_page)
		console.log(["numPages",numPages])
		var listing_table = document.getElementById("listingTable");
		this.property_list = []
		this.body.empty();
		this.prop_list=prop_list
		this.changePage(1,numPages,prop_list,records_per_page,prop_list.length,listing_table);
		

	},


	changePage: function(page,numPages,values,records_per_page,length,listing_table)
	{	
		$("#property").empty();
		$("#buttons").empty();
		var me=this;
		var arr= []
		console.log(["values",values])
	    if (page < 1) page = 1;
	    if (page > numPages) page = numPages;

	    me.show_user_property_table(page,numPages,values,records_per_page,length,listing_table);

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


	show_user_property_table: function(page,numPages,values,records_per_page,length,listing_table) {
		var me = this
		console.log("show_user_property_table")
		console.log(page)

		$("<div id='property' class='col-md-12'>\
			<div class='row'><ul id='mytable'style='list-style-type:none'></ul>\
			</div>\
		<div id='buttons' >\
		<p align='right'><input type='button' value='Prev' class='btn btn-default btn-sm btn-modal-close' id='btn_prev'>\
		<input type='button' value='Next' class='btn btn-default btn-sm btn-modal-close' id='btn_next'></p>\
		<b>Total Documents:</b> <span id='page'></span></div></div>").appendTo(me.body);


		$.each(values, function(i, d) {
			var amenities = [];
			//console.log(d['total_records'])
			$.each(d['amenities'], function(i, j) {
				amenities.push(j['name'])
			})

			$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
				<div id='image' class='col-md-2 property-image'>  \
				<div id='img' class='col-md-12'>\
				<div id="+i+" class='row'></div>\
				</div>\
				</div>\
			 <div id='details' class='col-md-10'>\
			 <div id="+d['property_id']+" class='col-md-12'>\
			 </div></div>\
			 </div></li>").appendTo($(me.body).find("#mytable"))

			if(d['property_photo'])
				$("<img id='theImg' src="+d['property_photo']+"/ width='60%' height='60%'>").appendTo($(me.body).find("#"+i+""))
			else
				$("<div class='ui-icon ui-icon-image'></div>").appendTo($(me.body).find("#"+i+""))

			$("<ul id='mytab' class='nav nav-tabs' role='tablist'>\
      <li role='presentation' class='active'><a href='#general"+""+i+"' id='home-tab' role='tab' data-toggle='tab' aria-controls='home' aria-expanded='false'><i class='icon-li icon-file'></i>&nbsp;&nbsp;General Details</a></li>\
      <li role='presentation' class=''><a href='#more"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;More Details</a></li>\
      <li role='presentation' class=''><a href='#amenities"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-building'></i>&nbsp;&nbsp;Amenities</a></li>\
      <li role='presentation' class=''><a href='#contact"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-user'></i>&nbsp;&nbsp;Contacts</a></li>\
      <div id="+d['property_id']+" style='float:right;'>\
	<input type='checkbox' class='cb' />\
	</div></ul></div>\
    </ul>\
    <div id='mytable' class='tab-content'>\
      <div role='tabpanel' class='tab-pane fade active in' id='general"+""+i+"' aria-labelledby='home-tab'>\
       <table width= '100%'>\
       <thead><tbody><tr>\
       <td width ='50%''><table width='100%'>\
<<<<<<< HEAD
       <p><tr><td><b>Property ID:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['property_id']+"</td></tr></p>\
=======
       <p><tr><td><b>Property ID:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a class='pv' id="+d['property_id']+">"+d['property_id']+"</a></td></tr></p>\
>>>>>>> postings
       <p><tr><td><b>Area:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['carpet_area']+"</td></tr></p>\
       <p><tr><td><b>Price:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['price']+"</td></tr></p>\
       <p><tr><td><b>Location:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['location']+"</td></tr></p>\
       <p></p>\
       </table></td>\
       <td width ='50%''><table width='100%'>\
       <p><tr><td><b>Property Name:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['property_title']+"</td></tr></p>\
       <p><tr><td><b>BHK:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2</td></tr></p>\
       <p><tr><td><b>Posting Date:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['posting_date']+"</td></tr></p>\
       <p><tr><td><b>Bathroom:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['no_of_bathroom']+"</td></tr></p>\
       <p></p>\
       </table></td>\
       </tr></tbody></thead></table>\
       </div>\
      <div role='tabpanel' class='tab-pane fade' id='more"+""+i+"' aria-labelledby='profile-tab'>\
      <table width= '100%'>\
       <thead><tbody><tr>\
       <td width ='50%''><table width='100%'>\
       <p><tr><td><b>Property Owenership:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['property_ownership']+"</td></tr></p>\
       <p><tr><td><b>Number Of Floors.:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['no_of_floors']+"</td></tr></p>\
       <p><tr><td><b>Maintenance:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['maintainance_charges']+"</td></tr></p>\
       <p><tr><td><b>Security Deposit:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['security_deposit']+"</td></tr></p>\
       <p></p>\
       </table></td>\
       <td width ='50%''><table width='100%'>\
       <p><tr><td><b>Age Of Property:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['property_age']+"</td></tr></p>\
       <p><tr><td><b>Furnishing Type:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['furnishing_type']+"</td></tr></p>\
       <p><tr><td><b>Society Name:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['society_name']+"</td></tr></p>\
       <p><tr><td><b>Address:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['address']+"</td></tr></p>\
       <p></p>\
       </table></td>\
       </tr></tbody></thead></table>\
      </div>\
      <div role='tabpanel' class='tab-pane fade' id='amenities"+""+i+"' aria-labelledby='profile-tab'>\
      <table width= '100%'>\
       <thead><tbody><tr>\
       <td width ='50%''><table width='100%'>\
       <p><tr><td><b>Amenities:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+amenities[0]+"</td></tr></p>\
       <p><tr><td><b>Amenities.:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+amenities[1]+"</td></tr></p>\
       <p><tr><td><b>Amenities:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+amenities[2]+"</td></tr></p>\
       <p><tr><td><b>Amenities:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+amenities[3]+"</td></tr></p>\
       <p></p>\
       </table></td>\
       <td width ='50%''><table width='100%'>\
       <p><tr><td><b>Amenities:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+amenities[4]+"</td></tr></p>\
       <p><tr><td><b>Amenities:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+amenities[5]+"</td></tr></p>\
       <p><tr><td><b>Amenities:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+amenities[6]+"</td></tr></p>\
       <p><tr><td><b>Amenities:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+amenities[7]+"</td></tr></p>\
       <p></p>\
       </table></td>\
       </tr></tbody></thead></table>\
      </div>\
      <div role='tabpanel' class='tab-pane fade' id='contact"+""+i+"' aria-labelledby='profile-tab'>\
      <table width= '100%'>\
       <thead><tbody><tr>\
       <td width ='50%''><table width='100%'>\
       <p><tr><td><b>Agent Name:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['agent_name']+"</td></tr></p>\
       <p><tr><td><b>Agent No:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['agent_no']+"</td></tr></p>\
       <p></p>\
       </table></td>\
       <td width ='50%''><table width='100%'>\
       <p><tr><td><b>Contact Person:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['contact_person']+"</td></tr></p>\
       <p><tr><td><b>Contact No.:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+d['contact_no']+"</td></tr></p>\
       <p></p>\
       </table></td>\
       </tr></tbody></thead></table>\
      </div>\
    </div>").appendTo($(me.body).find("#"+d['property_id']+""))

	

	$(me.body).find("#property_list"+i+"").after('<hr class="line"></hr>');
	

	})
	me.init_for_checkbox();

	$('.pv').click(function(){
		return frappe.call({
			type: "GET",
			method:"hunters_camp.hunters_camp.doctype.property.property.view_property",
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
		if (page > 1) {
        	page--;
       		return frappe.call({
					method:'propshikari.versions.v1.search_property',
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
							console.log(["message",r.message['data']])
							if(r.message['data'].length>0)
								me.changePage(page,numPages,r.message['data'],records_per_page,r.message['data'].length);
						}
					},
			});	
    }

    })

    $('#btn_next').click(function(){
    	console.log("Next button")
    	console.log(me.filters.operation.$input.val())
    	console.log(page)
    	if (page < numPages) {
       	 	page++;
       	 	console.log(["page",page])
       	 	return frappe.call({
					method:'propshikari.versions.v1.search_property',
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
							console.log(["message",r.message['data']])
							if(r.message['data'].length>0)
								me.changePage(page,numPages,r.message['data'],records_per_page,r.message['data'].length);
						}
					},
			});	

       	}
    })


	},



	init_for_checkbox: function(){
		var me = this;
		$('.cb').click(function(){
			if ($(this).prop('checked')==true){ 
				console.log($(this).parent().attr("id"));
				me.property_list.push($(this).parent().attr("id"))
				console.log(me.property_list)
			}
			else if($(this).prop('checked')==false){
				var removeItem = $(this).parent().attr("id");
				me.property_list = jQuery.grep(me.property_list, function(value) {
				  return value != removeItem;
				});

			}
	});

	
	},

})


