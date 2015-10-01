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
					options: "Property Subtype",
					"get_query": function() {
				return {
					"doctype": "Property Subtype",
					"filters": {
						"property_type": me.filters.operation.$input.val(),
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
						fieldtype: "Data",
						disp_status:"Read"
		});

		$('[data-fieldname=lead_management]').css('display','none')

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
					//method:'hunters_camp.hunters_camp.page.property.property.get_property',
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
							//console.log(["serach property",r.message])
							//me.render(r.message['data'],10)
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
										msgprint("There is no any properties found against the specified criteria so,email with property search criteria is sent to administartor.")
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
		if(me.prop_list){
			console.log(me.prop_list)
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
			fields.property_type.input.value=me.filters.property_type.$input.val()
			fields.property_subtype.input.value=me.filters.property_subtype.$input.val()
			fields.operation.input.value=me.filters.operation.$input.val()
			fields.minimum_budget.input.value=me.filters.budget_min.$input.val()
			fields.maximum_budget.input.value=me.filters.budget_max.$input.val()	
			$('[data-fieldname=submit]').css('display','block')
			d.show();
			values = ['property_type','property_subtype','operation','transaction_type','age_of_property','listed_by']
			final_result=[]
			$(fields.submit.input).click(function() {
			
				this.filter_object={}
				var me1=this
				$.each(values, function(i, d) {
					if(fields[d].input.value)
						me1.filter_object[d]=fields[d].input.value
				})

				this.filter_length=Object.keys(this.filter_object).length
				console.log(this.filter_length)
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
						//console.log(["obj",obj])
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
	 	 			else
	 	 				console.log("done")
	 	 			
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
	 	 		console.log("mimimum Maximimum budget")
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
	 	 		console.log(["tday",typeof(today)])

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
	 	 			 ///http://stackoverflow.com/questions/2536379/difference-in-months-between-two-dates-in-javascript
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
	 		//console.log(["filter_ammenities",filter_ammenities])
	 		
	 		//console.log(typeof(fields.amenities.input.value))
	 		$.each(final_result, function(k, v) {
	 			flag_new=0
	 			amenities=[]
				$.each(v['amenities'], function(i, j) {
						amenities.push(j['name'])
				})
				//console.log(["amenities",amenities])
				$.each(filter_ammenities, function(k,f) {
					
					$.each(amenities, function(k,a) {
						console.log(["aaaa",typeof(a)])
						if(f.toLowerCase()==a.toLowerCase()){
							//console.log(["f",f])
							//console.log(["a",a])
							//console.log(v['property_id'])
							flag_new+=1
							console.log(flag_new)
						}
					})
					
				})
				if(flag_new==filter_ammenities.length)
						amenities_list.push(v)
			})
			//console.log(["amenities_list",amenities_list])
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
				// 	if(fields.user.$input.val()){
				// 		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				// 		if (!filter.test(fields.user.$input.val())) {
    // 						alert('Please provide a valid email address');
				// 	}
				// }
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
			me.filters.property_type.input.value= 'Residential'
		me.filters.property_subtype.input.value='Family Home'
		me.filters.operation.input.value='Rent'
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
		console.log("in render")
		console.log(total_records)
		console.log(prop_list)
		var me = this;
		var current_page = 1;
		var records_per_page = 10;
		var property_data
		var flag 
		var numPages=Math.ceil(total_records/records_per_page)
		this.property_list = []
		this.final_data = []
		this.body.empty();
		this.prop_list=prop_list
		this.changePage(1,numPages,prop_list,records_per_page,prop_list.length,flag='Normal');
		

	},


	changePage: function(page,numPages,values,records_per_page,length,flag)
	{	
		var me=this
		if(flag=='Normal'){
			$("#property").remove();
			$("#buttons").remove();
			$("#sorting").remove();
			$("<div id='sorting' style='float:right;text-align=right'>\
			<select name='primary' class='input-with-feedback form-control input-sm' id='select_alert' >\
			<option class='form-control' value='sort_by'>Sort By</option>\
  			<option class='form-control' value='posting_date'>Posting Date</option>\
   			<option class='form-control' value='rate'>Rate</option>\
			</select></div>").appendTo(me.body)
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
			var amenities = []
			var amenities_dict = new Array();
			//console.log(d['total_records'])
			$.each(d['amenities'], function(i, j) {
				if(d.amenities)
					if(j['name'])
						amenities.push(j['name'])
			})

			// amenities_dict[j['name']]=j['']
			// console.log(amenities_dict)

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
				$("<img id='theImg' src="+d['property_photo']+"/ width='60%' height='60%' class='img-rounded' align='center'>").appendTo($(me.body).find("#"+i+""))
			else
				$("<img id='theImg' src='/files/Home-icon.png'/ width='60%' height='60%' class='img-rounded' align='center'>").appendTo($(me.body).find("#"+i+""))
				//$("<div class='ui-icon ui-icon-home'></div>").appendTo($(me.body).find("#"+i+""))

			$("<ul id='mytab' class='nav nav-tabs' role='tablist'>\
			      <li role='presentation' class='active'><a href='#general"+""+i+"' id='home-tab' style='height:35px;margin-top:-3px;'role='tab' data-toggle='tab' aria-controls='home' aria-expanded='false'><i class='icon-li icon-file'></i>&nbsp;&nbsp;General Details</a></li>\
			      <li role='presentation' class=''><a href='#more"+""+i+"' role='tab' id='profile-tab' style='height:35px;margin-top:-3px;' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;More Details</a></li>\
			      <li role='presentation' class=''><a href='#amenities"+""+i+"' role='tab' id='profile-tab' data-toggle='tab'  style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-building'></i>&nbsp;&nbsp;Amenities</a></li>\
			      <li role='presentation' class=''><a href='#contact"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-user'></i>&nbsp;&nbsp;Contacts</a></li>\
			      <div id="+d['property_id']+" style='float:right;'>\
				<input type='checkbox' class='cb' />\
				</div></ul></div>\
			    </ul>\
			    <div id='mytable' class='tab-content '>\
			      <div role='tabpanel' class='tab-pane fade active in' style='height=100%;background-color=#fafbfc;' id='general"+""+i+"' aria-labelledby='home-tab'>\
			       <table width= '100%'>\
			       <thead><tbody><tr class='tr-div'>\
			       <td width ='50%''><table class='table table-hover table-condensed table-div' id='general-first' width='100%'>\
			       </table></td>\
			       <td width ='50%''><table class='table table-hover table-condensed table-div' id='general-second' width='100%'>\
			       </table></td>\
			       </tr></tbody></thead></table>\
			       </div>\
			      <div role='tabpanel' class='tab-pane fade' style='height=100%'  id='more"+""+i+"' aria-labelledby='profile-tab'>\
			      <table width= '100%'>\
			       <thead><tbody><tr>\
			       <td width ='50%''><table class='table table-hover table-condensed table-div' id='more-details-first' width='100%'>\
			       </table></td>\
			       <td width ='50%''><table class='table table-hover table-condensed table-div' id='more-details-second' width='100%'>\
			       </table></td>\
			       </tr></tbody></thead></table>\
			      </div>\
			      <div role='tabpanel' class='tab-pane fade' style='height=100%' id='amenities"+""+i+"' aria-labelledby='profile-tab'>\
			      <table width= '100%'>\
			       <thead><tbody><tr>\
			       <td width ='50%''><table class='table table-hover table-condensed table-div' id='amenities-first' width='100%'>\
			       </table></td>\
			       <td width ='50%''><table class='table table-hover table-condensed table-div' id='amenities-second' width='100%'>\
			       </table></td>\
			       </tr></tbody></thead></table>\
			      </div>\
			      <div role='tabpanel' class='tab-pane fade' style='height=100%' id='contact"+""+i+"' aria-labelledby='profile-tab'>\
			      <table width= '100%'>\
			       <thead><tbody><tr>\
			       <td width ='50%''><table class=' table table-hover table-condensed table-div' id='contact-first' width='100%'>\
			       </table></td>\
			       <td width ='50%''><table class='table table-hover table-condensed table-div' id='contact-second' width='100%'>\
			       </table></td>\
			       </tr></tbody></thead></table>\
			      </div>\
			    </div>").appendTo($(me.body).find("#"+d['property_id']+""))

	
		$($(me.body).find("#"+d['property_id']+"")).find("#more-details-first").append('<tr><th class="th-div" style="border-top: 1px;">Property Ownership :</th><td class="ng-binding td-div" style="border-top: 1px;">'+d['property_ownership']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#more-details-first").append('<tr><th class="th-div" style="border-top: 1px;">Number Of Floors :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['no_of_floors']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#more-details-first").append('<tr><th class="th-div" style="border-top: 1px;">Maintenance :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['maintainance_charges']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#more-details-first").append('<tr><th class="th-div" style="border-top: 1px;">Security Deposite :</th><td class="ng-b td-divinding td-div"style="border-top: 1px;">'+d['security_deposit']+'</ td-divtd></tr>')

		$($(me.body).find("#"+d['property_id']+"")).find("#general-first").append('<tr><th class="th-div" style="border-top: 1px;">Property ID :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['property_id']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#general-first").append('<tr><th class="th-div" style="border-top: 1px;">Area :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['carpet_area']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#general-first").append('<tr><th class="th-div"style="border-top: 1px;">Price :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['price']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#general-first").append('<tr><th class="th-div"style="border-top: 1px;">Location :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['location']+'</td></tr>')


		$($(me.body).find("#"+d['property_id']+"")).find("#general-second").append('<tr><th class="th-div" style="border-top: 1px;>Property Name :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['property_title']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#general-second").append('<tr><th class="th-div"style="border-top: 1px;">BHK :</th><td class="ng-binding td-div"style="border-top: 1px;"></td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#general-second").append('<tr><th class="th-div"style="border-top: 1px;">Posting Date :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['posting_date']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#general-second").append('<tr><th class="th-div"style="border-top: 1px;">Bathroom :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['no_of_bathroom']+'</td></tr>')


		$($(me.body).find("#"+d['property_id']+"")).find("#more-details-second").append('<tr><th class="th-div"style="border-top: 1px;">Age Of Property :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['property_age']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#more-details-second").append('<tr><th class="th-div"style="border-top: 1px;">Furnishing Type :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['furnishing_type']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#more-details-second").append('<tr><th class="th-div"style="border-top: 1px;">Society Name :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['society_name']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#more-details-second").append('<tr><th class="th-div"style="border-top: 1px;">Address :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['address']+'</td></tr>')

		$.each(d['amenities'], function(i, j){
			if(i<4){
				$($(me.body).find("#"+d['property_id']+"")).find("#amenities-first").append('<tr><th class="th-div"style="border-top: 1px;">'+j['name']+' :</th><td class="ng-binding td-div"style="border-top: 1px;">'+j['status']+'</td></tr>')
				
			}
			else
				$($(me.body).find("#"+d['property_id']+"")).find("#amenities-second").append('<tr><th class="th-div"style="border-top: 1px;">'+j['name']+' :</th><td class="ng-binding td-div"style="border-top: 1px;">'+j['status']+'</td></tr>')

		})
	
		if(d['amenities'].length<4){
			for(i=0;i<4-(amenities.length);i++){
				$($(me.body).find("#"+d['property_id']+"")).find("#amenities-first").append('<tr><td style="border-top: 1px;"><b></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>')
			}
		}

		$($(me.body).find("#"+d['property_id']+"")).find("#contact-first").append('<tr><th class="th-div"style="border-top: 1px;">Agent Name :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['agent_name']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#contact-first").append('<tr><th class="th-div"style="border-top: 1px;">Agent No. :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['agent_no']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#contact-first").append('<tr><td style="border-top: 1px;"><b></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#contact-first").append('<tr><td style="border-top: 1px;"><b></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>')

		$($(me.body).find("#"+d['property_id']+"")).find("#contact-second").append('<tr><th class="th-div"style="border-top: 1px;">Contact Person :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['contact_person']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#contact-second").append('<tr><th class="th-div"style="border-top: 1px;">Contact No. :</th><td class="ng-binding td-div"style="border-top: 1px;">'+d['contact_no']+'</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#contact-second").append('<tr><td style="border-top: 1px;"><b></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>')
		$($(me.body).find("#"+d['property_id']+"")).find("#contact-second").append('<tr><td style="border-top: 1px;"><b></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>')




		$(me.body).find("#property_list"+i+"").after('<hr class="line"></hr>');
		

	})
	me.init_for_checkbox();

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


	},

	init_for_checkbox: function(){
		var me = this;
		$('.cb').click(function(){
			if ($(this).prop('checked')==true){ 
				me.property_list.push($(this).parent().attr("id"))
				
			}
			else if($(this).prop('checked')==false){
				var removeItem = $(this).parent().attr("id");
				me.property_list = jQuery.grep(me.property_list, function(value) {
				  return value != removeItem;
				});

			}
	});

	
	},

	show_unique_properties:function(page,numPages,data,records_per_page,length,flag){
		var me=this
		console.log("show_unique_properties")
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


