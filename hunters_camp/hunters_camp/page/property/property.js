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
					fieldtype: "Link",
					options:"Area"
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

		$('[data-fieldname=tag]').css('display','none')
		$('[data-fieldname=share]').css('display','none')
		$('[data-fieldname=lead_management]').css('display','none')

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
						"request_source":'Hunterscamp',
						//"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						console.log(r.message)
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
		if(me.prop_list){
			var d = new frappe.ui.Dialog({

				title: __("Add Advance filters"),
						fields: [
							{fieldtype:"Link", label:__("Property Type"),
								options:"Property Type", reqd:1, fieldname:"property_type"},
							{fieldtype:"Select", label:__("Operation"),
								options:"\nBuy\nRent", reqd:1, fieldname:"operation"},
							{fieldtype:"Select", label:__("Minimum Budget"),options:"\n0\n25Lac\n50Lac\n75Lac\n1Cr",
							 reqd:0, fieldname:"minimum_budget"},
							{fieldtype:"Select", label:__("Transaction Type")
								,options:"\nResale\nSale\nNew",reqd:0, fieldname:"transaction_type"},
							{fieldtype:"Select", label:__("Age Of Property"),
							 options:"\n1 Year\n2 Years\n3 Years\n4 Years",reqd:0, fieldname:"age_of_property"},
							{fieldtype:"Data", label:__("Amenities"),
								options:"\nOwner\nBroker",reqd:0, fieldname:"amenities"},
							{fieldtype:"Column Break",
								reqd:0, fieldname:"cl"},
							{fieldtype:"Link", label:__("Property Sub Type"),
							options:"Property Subtype", reqd:1, fieldname:"property_subtype"},
							{fieldtype:"Date", label:__("Posted Date"),
								reqd:0, fieldname:"posting_date"},
							{fieldtype:"Select", label:__("Maximum Budget"),options:"\n25Lac\n50Lac\n75Lac\n1Cr", reqd:0, fieldname:"maximum_budget"},
							{fieldtype:"Select", label:__("Possession"),
							 options:"\nReady\n5 Months\n6 Months",reqd:0, fieldname:"possession"},
							{fieldtype:"Select", label:__("Listed By"),
								options:"\nOwner\nBroker",reqd:0, fieldname:"listed_by"},
							{fieldtype:"Button", label:__("Submit"),
							 fieldname:"submit"}			

						]			
			});
			
			fields=d.fields_dict
			$('[data-fieldname=submit]').css('display','none')

			fields.property_type.input.value = me.filters.property_type.$input.val()
			fields.property_subtype.input.value = me.filters.property_subtype.$input.val()
			fields.operation.input.value = me.filters.operation.$input.val()
			fields.minimum_budget.input.value = me.filters.budget_min.$input.val()
			fields.maximum_budget.input.value = me.filters.budget_max.$input.val()

			$('[data-fieldname=submit]').css('display','block')
			d.show();

			values = ['property_type','property_subtype','operation','transaction_type','age_of_property','listed_by']
			final_result = []
			$(fields.submit.input).click(function() {
				this.filter_object = {}
				var me1 = this

				$.each(values, function(i, d) {
					if(fields[d].input.value)
						me1.filter_object[d]=fields[d].input.value
				})

				this.filter_length=Object.keys(this.filter_object).length
				var arrByID = me.prop_list.filter(filterByID);
				function filterByID(obj) {
					var flag=0
				 	$.each(me1.filter_object, function(k,v) {
						if(v!=obj[k])
							return false
						else
							flag+=1
							
					})
					if(flag==me1.filter_length){
						return true
					}
					else
						return false
	 	 	}

 			var date=fields.posting_date.input.value
	 	 	var newdate2 = date.split("-").reverse().join("-");
			var date2 = new Date(newdate2)

			posting_list=[]
	 	 	//POSTING DATE FILTER.....................
	 	 	if(fields.posting_date.input.value){
	 	 		$.each(arrByID, function(k,v) {
	 	 			var newdate1 = v['posting_date'].split("-").reverse().join("-")
				 	date1 = new Date(newdate1)
	 	 			if(date1>date2){
	 	 				posting_list.push(v)
	 	 			}
	 	 			
				});
				final_result=posting_list
	 	 	}
	 	 	else{
	 	 		final_result=arrByID
	 	 	}

	 	 	budget_final_result=[]
	 	 	// FOR MIN MAX BUDGET........................
	 	 	if(fields.minimum_budget.input.value && !fields.maximum_budget.input.value){
	 	 		if(fields.minimum_budget.input.value=='25Lac' || fields.minimum_budget.input.value=='50Lac' || fields.minimum_budget.input.value=='75Lac' ||fields.minimum_budget.input.value=='0'){
	 	 			var amount=(fields.minimum_budget.input.value.split("Lac")[0]*100000)
		 	 		$.each(final_result, function(k,v) {
		 	 			if(v['price']>=amount)
		 	 				budget_final_result.push(v)
		 	 		})
		 	 		final_result=budget_final_result
		 	 	}
		 	 	else{
		 	 		amount=10000000
		 	 		$.each(final_result, function(k,v) {
		 	 			if(v['price']>=amount)
		 	 				budget_final_result.push(v)
		 	 		})
		 	 		final_result=budget_final_result
		 	 	}
	 	 	}
	 	 	else if(!fields.minimum_budget.input.value && fields.maximum_budget.input.value){
	 	 		if(fields.maximum_budget.input.value=='25Lac' || fields.maximum_budget.input.value=='50Lac' || fields.maximum_budget.input.value=='75Lac'){
	 	 			amount=(fields.maximum_budget.input.value.split("Lac")[0]*100000)
		 	 		$.each(final_result, function(k,v) {
		 	 			if(v['price']<amount)
		 	 				budget_final_result.push(v)
		 	 		})
		 	 		final_result=budget_final_result
		 	 	}
		 	 	else{
		 	 		amount=10000000
		 	 		$.each(final_result, function(k,v) {
		 	 			if(v['price']<amount)
		 	 				budget_final_result.push(v)
		 	 		})
		 	 		final_result=budget_final_result
		 	 	}
	 	 	}
	 	 	else if(fields.minimum_budget.input.value && fields.maximum_budget.input.value){
	 	 		if(fields.minimum_budget.input.value=='25Lac' || fields.minimum_budget.input.value=='50Lac' || fields.minimum_budget.input.value=='75Lac' ||fields.minimum_budget.input.value=='0'){
	 	 			min_amount=fields.minimum_budget.input.value.split("Lac")[0]*100000
	 	 		}
	 	 		else{
	 	 			min_amount=10000000
	 	 		}
	 	 		if(fields.maximum_budget.input.value=='25Lac' || fields.maximum_budget.input.value=='50Lac' || fields.maximum_budget.input.value=='75Lac'){
	 	 			max_amount=fields.maximum_budget.input.value.split("Lac")[0]*100000
	 	 		}
	 	 		else{
	 	 			max_amount=10000000
	 	 		}
	 	 		$.each(final_result, function(k,v) {
	 	 			if(v['price']>=min_amount && v['price']<max_amount)
	 	 				budget_final_result.push(v)
	 	 		})
	 	 		final_result=budget_final_result
	 	 	}
	 	 	else{
	 	 		final_result=final_result
	 	 	}

	 	 	// POSSESSION DATE FILTER
	 	 	possession_list=[]
	 	 	var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!
				var yyyy = today.getFullYear();

				if(dd<10) {
				    dd='0'+dd
				} 

				if(mm<10) {
				    mm='0'+mm
				} 

				today = dd+'-'+mm+'-'+yyyy;

	 	 	if(fields.possession.input.value){
	 	 		if(fields.possession.input.value=='Ready'){
	 	 			$.each(final_result, function(k,v) {
	 	 				if(v['possession_status']=='Immediate')
	 	 					possession_list.push(v)
	 	 		});
	 	 		final_result=possession_list
	 	 	}
	 	 	else if(fields.possession.input.value=='5 Months'){
	 	 		$.each(final_result, function(k,v) {
	 	 			if(v['possession_date']){
		 	 			var today_date=new Date(today.split("-").reverse().join("-"));//Remember, months are 0 based in JS
						var past_date=new Date(v['possession_date'].split("-").reverse().join("-"));
						var months = past_date.getMonth() - today_date.getMonth() + (12 * (past_date.getFullYear() - today_date.getFullYear()));
						if(months<5)
							possession_list.push(v)
					}
					final_result=possession_list
	 	 		})
	 	 	}
	 	 	else if(fields.possession.input.value=='6 Months'){
	 	 		$.each(final_result, function(k,v) {
	 	 			if(v['possession_date']){
		 	 			var today_date=new Date(today.split("-").reverse().join("-"));//Remember, months are 0 based in JS
						var past_date=new Date(v['possession_date'].split("-").reverse().join("-"));
						var months = past_date.getMonth() - today_date.getMonth() + (12 * (past_date.getFullYear() - today_date.getFullYear()));
						if(months<5)
							possession_list.push(v)
					}
					final_result=possession_list
	 	 		})
	 	 	}
	 	 	else{
	 	 		final_result=final_result
	 	 	}
	 	 }
	 	 else
	 	 	final_result=final_result


	 	//FILTER FOR AMENITIES.....................
	 	amenities_list=[]
	 	if(fields.amenities.input.value){
	 		filter_ammenities=fields.amenities.input.value.split(",")
	 		x=[]
			$.each(filter_ammenities, function(i,n) {
			    x.push(n);
			});
	 		$.each(final_result, function(k, v) {
	 			flag_new=0
	 			amenities=[]
				$.each(v['amenities'], function(i, j) {
						amenities.push(j['name'])
				})
				$.each(filter_ammenities, function(k,f) {
					
					$.each(amenities, function(k,a) {
						if(f.toLowerCase()==a.toLowerCase()){
							flag_new+=1
						}
					})
					
				})
				if(flag_new==filter_ammenities.length)
						amenities_list.push(v)
			})
			final_result=amenities_list
	 	}
	 	else{
	 		final_result=final_result
	 	}

	 	 	//return original result
			if(final_result.length>0)
				me.render(final_result,final_result.length)
			else{
				$("#property").remove();
				$("#buttons").remove();
				$("#sorting").remove();
				me.prop_list=[]
			}
			d.hide();
            	
        	});
		}

		else
			msgprint("There is no any property is available to filter it further")

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
								'async': false,
								args :{
									"data":{
									"property_id": j,
									"tags": Object.keys(tag_list),
									"discount_percentage": parseInt(fields.discount_percentage.$input.val()),
									"user_id": frappe.get_cookie('user_id'),
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
				$("<a href='#' class='thumbnail img-class'><img id='theImg' src="+d['property_photo']+"/ style='height:110px; align:center'></a>").appendTo($(me.body).find("#"+i+""))
			// else
			// 	$("<img id='theImg' src='/files/Home-icon.png'/ class='img-rounded' align='center'>").appendTo($(me.body).find("#"+i+""))
				

			$("<ul id='mytab' class='nav nav-tabs' role='tablist' >\
			      <li role='presentation' class='active'><a href='#general"+""+i+"' id='home-tab' style='height:35px;margin-top:-3px;'role='tab' data-toggle='tab' aria-controls='home' aria-expanded='false'><i class='icon-li icon-file'></i>&nbsp;&nbsp;General Details</a></li>\
			      <li role='presentation' class=''><a href='#more"+""+i+"' role='tab' id='profile-tab' style='height:35px;margin-top:-3px;' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;More Details</a></li>\
			      <li role='presentation' class=''><a href='#amenities"+""+i+"' role='tab' id='profile-tab' data-toggle='tab'  style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-building'></i>&nbsp;&nbsp;Amenities</a></li>\
			      <li role='presentation' class=''><a href='#contact"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-user'></i>&nbsp;&nbsp;Contacts</a></li>\
			      <li role='presentation' class=''><a href='#tag"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-tag'></i>&nbsp;&nbsp;Tags</a></li>\
			      <div id="+d['property_id']+" style='float:right;'>\
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
		$($(me.body).find("#"+d['property_id']+"")).find("#bhk").append('<div class="row property-row">'+d['bhk'] ? d['bhk'] :" "+'</div>')
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
		console.log("in selct status")
		console.log(me.check_property_list)
		console.log(me)
		console.log(this)

		result_set= []
		if($("#select_status").val()=='Deactivate'){
			console.log(me.check_property_list)
			
		}
		else if($("#select_status").val()=='Sold'){
			console.log(me.check_property_list)
		}
		status=status

		$.each(me.check_property_list, function(i, j) {
			console.log(j)
			console.log($("#select_status").val())
			 frappe.call({
						method:'propshikari.versions.v1.update_property_status',
						'async': false,
						args :{
							"data":{
							"property_id": j,
							"property_status":$("#select_status").val(),
							"user_id": frappe.get_cookie('user_id'),
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
