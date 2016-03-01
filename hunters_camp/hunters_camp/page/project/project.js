frappe.require("assets/hunters_camp/multiselect.js");

frappe.pages['project'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Project',
		single_column: true
	});

	$("<div class='user-settings' \
		style='padding: 15px;'></div>").appendTo(page.main);

	wrapper.project = new Project(wrapper);
}


Project = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".user-settings");
		this.filters = {};
		this.page=1
		this.project_list = []
		this.make();
		this.refresh();
	},
	make: function() {
		var me = this;
		me.filters.project_type = me.wrapper.page.add_field({
					fieldname: "project_type",
					label: __("Project Type"),
					fieldtype: "Link",
					options: "Property Type"
		});
		me.filters.project_subtype = me.wrapper.page.add_field({
					fieldname: "project_subtype",
					label: __("Project Subtype"),
					fieldtype: "Link",
					options: "Property Subtype",
					"get_query": function() {
						return {
							"doctype": "Property Subtype",
							"filters": {
								"property_type": me.filters.project_type.$input.val(),
							}
						}
					}
		});
		me.filters.operation = me.wrapper.page.add_field({
					fieldname: "operation",
					label: __("Operation"),
					fieldtype: "Select",
					options: "\nBuy"
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
		me.filters.location = me.wrapper.page.add_field({
					fieldname: "location",
					label: __("Location"),
					fieldtype: "Data"
		});

		me.search = me.wrapper.page.add_field({
						fieldname: "search",
						label: __("Search Project"),
						fieldtype: "Button",
						icon: "icon-search"
		});
		me.clear_form = me.wrapper.page.add_field({
						fieldname: "clear_form",
						label: __("Clear Form"),
						fieldtype: "Button",
						icon: "icon-filter"
		});
		// me.advance_filters = me.wrapper.page.add_field({
		// 				fieldname: "advance_filters",
		// 				label: __("Advance Filters"),
		// 				fieldtype: "Button",
		// 				icon: "icon-filter"
		// });
		this.init_for_multiple_location()
		

		me.search.$input.on("click", function() {
			if(me.filters.project_type.$input.val() && me.filters.project_subtype.$input.val()){
				return frappe.call({
					method:'hunters_camp.hunters_camp.page.project.project.build_data_to_search_with_location_names',
					args :{
						"data":{
						"project_type": me.filters.project_type.$input.val(),
						"project_subtype": me.filters.project_subtype.$input.val(),
						"location": me.filters.location.$input.val(),
						"operation": me.filters.operation.$input.val(),
						"min_budget": parseInt(me.filters.budget_min.$input.val()),
						"max_budget": parseInt(me.filters.budget_max.$input.val()),
						"min_area": parseInt(me.filters.area_min.$input.val()),
						"max_area": parseInt(me.filters.area_max.$input.val()),
						"city":$(me.filters.location.$input).attr("data-field-city"),
						"records_per_page": 5,
						"page_number":1,
						"request_source":'Hunterscamp',
						"user_id": 'Guest',
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
								msgprint("Projects is not available related to search criteria which you have specified.")
							}		
					}

				},
				
			});
	}
	else
		msgprint("PROJECT TYPE,PROJECT SUBTYPE are the mandatory fields to search criteria please specify it.")

	});

	},

	refresh: function() {
		var me = this;
	},

	render: function(project_list,total_records) {
		var me = this;
		var current_page = 1;
		var records_per_page = 5;
		var project_data
		var check_project_list =[]
		var flag 
		var numPages=Math.ceil(total_records/records_per_page)
		this.project_list = []
		this.final_data = []
		this.body.empty();
		this.project_list=project_list

		this.changePage(1,numPages,this.project_list,records_per_page,this.project_list.length,flag='Normal');
	},
	changePage: function(page,numPages,values,records_per_page,length,flag){
		console.log(flag)
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
				</div>").appendTo(me.body)
			}
			else{
				$("#property").remove();
				$("#buttons").remove();
			}

			var arr= []
		    if (page < 1) page = 1;
		    if (page > numPages) page = numPages;

		    me.show_user_project_table(page,numPages,values,records_per_page,length,flag);
		    
		    //Added by Arpit
			me.shows_only_zameen_related_fields()
			// End

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

	show_user_project_table: function(page,numPages,values,records_per_page,length,flag) {

		var me = this
		me.property_data=values
		$("<div id='property' class='col-md-12'>\
			<div class='row'><ul id='mytable'style='list-style-type:none'></ul>\
			</div></div>\
			<div id='buttons' >\
		<p align='right'><input type='button' value='Prev' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_prev'>\
		<input type='button' value='Next' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_next'></p>\
		<p align='left'><b>Total Project(s):</b> <span id='page'></span></p></div>").appendTo(me.body);


		$.each(values, function(i, d) {

			$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
				<div id='image' class='col-md-2 property-image' style='border: 1px solid #d1d8dd;'>  \
				<div id='img' class='col-md-12 image-div'>\
				<div id="+i+" class='row property_img'></div>\
				</div>\
				</div>\
			 <div id='details' class='col-md-10 property-main-div'>\
			 <div id="+d['project_id']+" class='col-md-12 property-id' style='border: 1px solid #d1d8dd;'>\
			 </div></div>\
			 </div></li>").appendTo($(me.body).find("#mytable"))

			if(d['project_photo']){
				$("<a href='#' class='thumbnail img-class'><img id='theImg' src="+d['project_photo']+" style='height:110px; align:center'></a>").appendTo($(me.body).find("#"+i+""))
			}
			else{
				$("<img id='theImg' src='/assets/hunters_camp/No_image_available.jpg' class='img-rounded' align='center'>").appendTo($(me.body).find("#"+i+""))
			}

			$("<ul id='mytab' class='nav nav-tabs' role='tablist' >\
			      <li role='presentation' class='active'><a href='#general"+""+i+"' id='home-tab' style='height:35px;margin-top:-3px;'role='tab' data-toggle='tab' aria-controls='home' aria-expanded='false'><i class='icon-li icon-file'></i>&nbsp;&nbsp;Project Details</a></li>\
			      <li role='presentation' class=''><a href='#more"+""+i+"' role='tab' id='profile-tab' style='height:35px;margin-top:-3px;' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;Property Details</a></li>\
			      <li role='presentation' class=''><a href='#contact"+""+i+"' role='tab' id='profile-tab' data-toggle='tab' style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-user'></i>&nbsp;&nbsp;Contacts</a></li>\
			      <div id="+d['project_id']+" style='float:right;'>\
				<input type='checkbox' class='cb' />\
				</div></ul></div>\
			    </ul>\
			    <div id='mytable' class='tab-content'>\
			      <div role='tabpanel' class='tab-pane fade active in' id='general"+""+i+"' style='overflow:auto;height: 110px;' aria-labelledby='home-tab'>\
			       <div class='col-md-6 main-row' style='background-color=#fafbfc;'>\
			        <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Project Id :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='project-id'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Project Name :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='project_name'></div>\
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
			       <div class='row property-row'><b>Price/Sqft :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='price'></div>\
			        </div>\
			       </div>\
			       </div>\
			       <div class='col-md-6 main-row' style='background-color=#fafbfc;'>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Possession:</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='possession_status'></div>\
			        </div>\
			       </div>\
			       <div class='row row-id'>\
			        <div class='col-md-6 row'>\
			       <div class='row property-row'><b>Age Of Project :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='age'></div>\
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
			       <div class='row property-row'><b>Number Of Floors :</b></div>\
			       </div>\
			       <div class='col-md-6 row'>\
			        <div class='row property-row' id='floor'></div>\
			        </div>\
			       </div>\
			       </div>\
			       </div>\
			      <div role='tabpanel' class='tab-pane fade' style='overflow:auto;height: 110px;' id='more"+""+i+"' aria-labelledby='profile-tab'>\
			      <div class='col-md-12'>\
			      <div class='col-md-2' id='subtype' style='background-color=#fafbfc;'><b>Subtype</b>\
			      </div>\
			      <div class='col-md-2' id='min_area' style='background-color=#fafbfc;'><b>Min Area</b>\
			      </div>\
			      <div class='col-md-2' id='max_area' style='background-color=#fafbfc;'><b>Max Area</b>\
			      </div>\
			      <div class='col-md-2' id='min_rate' style='background-color=#fafbfc;'><b>Min Rate</b>\
			      </div>\
			      <div class='col-md-2' id='max_rate' style='background-color=#fafbfc;'><b>Max Rate</b>\
			      </div>\
			      <div class='col-md-2' id='count' style='background-color=#fafbfc;'><b>Property</b>\
			      </div>\
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
			    </div>").appendTo($(me.body).find("#"+d['project_id']+""))
		

		$($(me.body).find("#"+d['project_id']+"")).find("#project-id").append('<div class="row property-row"><a class="pv" id="'+d['project_id']+'">'+d['project_id']+'<a></div>')
		$($(me.body).find("#"+d['project_id']+"")).find("#project_name").append('<div class="row property-row">'+d['project_name'] ? d['project_name'] : ""+'</div>')
		$($(me.body).find("#"+d['project_id']+"")).find("#location").append('<div class="row property-row">'+d['location'] ? d['location'] : ""+'</div>')
		$($(me.body).find("#"+d['project_id']+"")).find("#price").append('<div class="row property-row">'+d['price_per_sq_ft'] ? d['price_per_sq_ft'] : ""+'</div>')
		
		$($(me.body).find("#"+d['project_id']+"")).find("#possession_status").append('<div class="row property-row">'+d['possession_status'] ? d['possession_status'] : ""+'</div>')
		$($(me.body).find("#"+d['project_id']+"")).find("#age").append('<div class="row property-row">'+d['property_age'] ? d['property_age'] :" "+'</div>')
		$($(me.body).find("#"+d['project_id']+"")).find("#posting_date").append('<div class="row property-row">'+d['posting_date'] ? d['posting_date'] : ""+'</div>')
		$($(me.body).find("#"+d['project_id']+"")).find("#floor").append('<div class="row property-row">'+d['no_of_floors'] ? d['no_of_floors'] : ""+'</div>')

		if(d['property_details']!=null){
			$.each(d['property_details'], function(k, j){
				$($(me.body).find("#"+d['project_id']+"")).find("#more"+i+"").append('<div class="col-md-12 prop-row">\
					<div class="col-md-2" style="background-color=#fafbfc;">'+j['property_subtype_option']+'</div>\
					<div class="col-md-2" style="background-color=#fafbfc;">'+j['min_area']+'</div>\
					<div class="col-md-2" style="background-color=#fafbfc;">'+j['max_area']+'</div>\
					<div class="col-md-2" style="background-color=#fafbfc;">'+j['min_price']+'</div>\
					<div class="col-md-2" style="background-color=#fafbfc;">'+j['max_price']+'</div>\
					<div class="col-md-2" style="background-color=#fafbfc;">'+j['count']+'</div>\
					</div>')
			})

		}
					
	})
	me.clear_form.$input.on("click", function() {
		frappe.ui.toolbar.clear_cache()
	});
	

	$('.pv').click(function(){
		return frappe.call({
			type: "GET",
			method:"hunters_camp.hunters_camp.doctype.projects.projects.view_project",
			args: {
				"project_id":$(this).attr('id'),
				"sid":frappe.get_cookie("sid")
			},
			freeze: true,
			callback: function(r) {
				console.log("in callback")
				if(!r.exc) {
					console.log(r.message)
					var doc = frappe.model.sync(r.message);
					console.log(doc)
					frappe.route_options = {"doc":doc};
					frappe.set_route("Form",'Projects','Projects');
				}
			}
		})
	})



	$('#btn_prev').click(function(){
		if (page > 1) {
        	page--;
       		return frappe.call({
					method:'propshikari.versions.v1.search_project',
					args :{
						"data":{
						"project_type": me.filters.project_type.$input.val(),
						"project_subtype": me.filters.project_subtype.$input.val(),
						"location": me.filters.location.$input.val(),
						"operation": me.filters.operation.$input.val(),
						"min_budget": parseInt(me.filters.budget_min.$input.val()),
						"max_budget": parseInt(me.filters.budget_max.$input.val()),
						"min_area": parseInt(me.filters.area_min.$input.val()),
						"max_area": parseInt(me.filters.area_max.$input.val()),
						"city":$(me.filters.location.$input).attr("data-field-city"),
						"records_per_page": 10,
						"page_number":page,
						"request_source":'Hunterscamp',
						"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						if(!r.exc) {
							if(r.message['data'].length>0){
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
					method:'propshikari.versions.v1.search_project',
					args :{
						"data":{
						"project_type": me.filters.project_type.$input.val(),
						"project_subtype": me.filters.project_subtype.$input.val(),
						"location": me.filters.location.$input.val(),
						"operation": me.filters.operation.$input.val(),
						"min_budget": parseInt(me.filters.budget_min.$input.val()),
						"max_budget": parseInt(me.filters.budget_max.$input.val()),
						"min_area": parseInt(me.filters.area_min.$input.val()),
						"max_area": parseInt(me.filters.area_max.$input.val()),
						"city":$(me.filters.location.$input).attr("data-field-city"),
						"records_per_page": 10,
						"page_number":page,
						"request_source":'Hunterscamp',
						"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						if(!r.exc) {
							if(r.message['data'].length>0){
								me.project_list=r.message['data']
								me.property_list=[]
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
		console.log("sorting")
		
		if($("#select_alert").val()=='posting_date'){
			console.log($("#select_alert").val())
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
	  if(!object1['price_per_sq_ft'])
	  	object1['price_per_sq_ft']=0
	  if(!object2['price_per_sq_ft'])
	  	object2['price_per_sq_ft']=0

	  if (object1['price_per_sq_ft'] > object2['price_per_sq_ft']) return 1;
	  if (object1['price_per_sq_ft'] < object2['price_per_sq_ft']) return -1;
	  return 0;
	};


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

//code Added by Arpit to hide field for land related field 
	shows_only_zameen_related_fields:function(){
		var me = this;
		var project_type = 	$(me.wrapper).find("input[data-fieldname=project_type]").val()
		if (project_type == "Zameen"){
				$("#possession_status").parent('div').parent('div').css('display','none')
				$("#floor").parent('div').parent('div').css('display','none')
		}else{
				$("#possession_status").parent('div').parent('div').css('display','block')
				$("#floor").parent('div').parent('div').css('display','block')
			}
	},
// end of code

})