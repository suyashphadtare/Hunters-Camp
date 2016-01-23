// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt
frappe.require("assets/hunters_camp/multiselect.js");

cur_frm.add_fetch('lead', 'lead_name', 'lead_name');
cur_frm.add_fetch('lead', 'middle_name', 'middle_name');
cur_frm.add_fetch('lead', 'last_name', 'last_name');
cur_frm.add_fetch('lead', 'email_id', 'email_id');
cur_frm.add_fetch('lead', 'lead_from', 'lead_from');
cur_frm.add_fetch('lead', 'reference', 'reference');
cur_frm.add_fetch('lead', 'description', 'description');
cur_frm.add_fetch('lead', 'mobile_no', 'mobile_no');


frappe.ui.form.on("Lead Management", "refresh", function(frm) {
	if (!frm.doc.__islocal){
		property_details = frm.doc.property_details || [];
		frm.add_custom_button(__("Search & Share Property"), function() { 
			make_dashboard(frm.doc)
		})	
		if(property_details.length>0){
			frm.add_custom_button(__("Set Follow Ups"), function() { 
				pop_up = new frappe.SetFollowUps();
			})	
			frm.add_custom_button(__("schedule SE"), function() {
				pop_up = new frappe.SEFollowUps();
			})	
			frm.add_custom_button(__("schedule ACM"), function() { 
				pop_up = new frappe.ACMFollowUps();
			})	
		}
		if (frappe.get_prev_route() && (frappe.get_prev_route()[0]=='property')){
			frappe.ui.toolbar.clear_cache()
			//console.log("hiihih")	
		}
		//frappe.ui.toolbar.clear_cache()
	}
	if (frm.doc.city){
		var me = this;
		me.init_multiple_location(frm)
	}

	// cur_frm.set_df_property("property_details", "read_only", true)
	make_dashboard =  function(doc){
		if(doc.property_type && doc.property_subtype && doc.operation && doc.location_name){
			return frappe.call({
					method:'hunters_camp.hunters_camp.page.property.property.build_data_to_search_with_location_names',
					freeze: true,
					freeze_message:"Building Search.....This Might Take Some Time",
					args :{
						"data":{
						"operation": doc.operation,
						"property_type": doc.property_type,
						"property_subtype": doc.property_subtype,
						"property_subtype_option":doc.property_subtype_option,
						"location": doc.location_name,
						"min_budget": doc.budget_minimum,
						"max_budget": doc.budget_maximum,
						"min_area": doc.area_minimum,
						"max_area": doc.area_maximum,
						"city":doc.city,
						"records_per_page": 10,
						"page_number":1,
						"request_source":'Hunterscamp',
						"user_id": 'Guest',
						"sid": 'Guest'
					  },
					},
					callback: function(r,rt) {
						if(!r.exc) {
							result=r.message['data']
							total_records = r.message['total_records']
							if(r.message['total_records']>0){
								var cl=doc.property_details || [ ]
								if(cl.length>0){
									return frappe.call({
										method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_diffrent_property',
										args :{
											"data":r.message["data"],
											"lead_management":doc.name
										},
										callback: function(r,rt) {
											var final_property_result = {}
											if(r.message){
												$.each(r.message['property_id'],function(i, property){
		  											final_property_result[(property['property_id'].trim())]=''
		  											
												});
												final_result = jQuery.grep(result, function( d ) {
		 											return !(d['property_id'] in final_property_result)
												});
												if(final_result.length>0){
													final_result = final_result
													frappe.route_options = {
														"lead_management": doc.name,
														"property_type": doc.property_type,
														"property_subtype": doc.property_subtype,
														"subtype_option":doc.property_subtype_option,
														"location": doc.location_name,
														"operation":doc.operation,
														"budget_minimum": doc.budget_minimum,
														"budget_maximum": doc.budget_maximum,
														"area_minimum": doc.area_minimum,
														"area_maximum": doc.area_maximum,
														"total_records":total_records,
														"data": final_result,
														"city":doc.city
													};
													frappe.set_route("property","Hunters Camp");	
												}
												else {
												
													if (doc.email_sent == 'No'){
														return frappe.call({
															method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_administartor',
															args :{
																"property_type": doc.property_type,
																"property_subtype": doc.property_subtype,
																"operation":doc.operation,
																"location": doc.location_name,
																"budget_minimum": doc.budget_minimum,
																"budget_maximum": doc.budget_maximum,
																"area_minimum": doc.area_minimum,
																"area_maximum": doc.area_maximum,
																"city":doc.city,
																"lead_name":doc.lead		
															},
															callback: function(r,rt) {
																doc.email_sent = 'Yes'
																cur_frm.refresh_fields(["email_sent"])
																msgprint("There is no any properties found against the specified criteria so,email with property search criteria is sent to administartor.")
																
															},
														})	
													}
													else{	
														msgprint("There is no any properties found against the specified criteria.")
													}

												}
												
										  }
										},
									});		
								}
								frappe.route_options = {
									"lead_management": doc.name,
									"property_type": doc.property_type,
									"property_subtype": doc.property_subtype,
									"location": doc.location_name,
									"operation":doc.operation,
									"subtype_option":doc.property_subtype_option,
									"budget_minimum": doc.budget_minimum,
									"budget_maximum": doc.budget_maximum,
									"area_minimum": doc.area_minimum,
									"area_maximum": doc.area_maximum,
									"total_records": total_records,
									"data": r.message['data'],
									"city":doc.city
								};
								frappe.set_route("property", "Hunters Camp");
							}
							else{
								// email to admin
								return frappe.call({
									method:'hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_administartor',
									args :{
										"property_type": doc.property_type,
										"property_subtype": doc.property_subtype,
										"property_subtype_option":doc.property_subtype_option,
										"operation":doc.operation,
										"location": doc.location_name,
										"budget_minimum": doc.budget_minimum,
										"budget_maximum": doc.budget_maximum,
										"area_minimum": doc.area_minimum,
										"area_maximum": doc.area_maximum,
										"city":doc.city,
										"lead_name":doc.lead
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
			else{
				frappe.msgprint("OPERATION,PROPERTY TYPE,PROPERTY SUBTYPE,LOCATION are the mandatory fields to search criteria please specify it.")
			}
		}


	// var property_details_list = []

	frappe.SetFollowUps = Class.extend({
		init: function() {
			property_details_list = [];
			this.make();
		},
		make: function() {
			var me = this;
			doc=cur_frm.doc
			var pd = doc.property_details;
			me.share_followup_date
			me.flag=0
			me.falg1=0
			me.falg2=0
			me.pop_up = this.show_pop_up_dialog(cur_frm.doc,me);
			
			me.pop_up.show()
			$('[data-fieldname=followup_date]').css('display','none')
			
			$(me.pop_up.fields_dict.type_followup.input).change(function(){
				result_set= []

				// FOLLOW UP FOR SHARE _-------------------------------------------------------------------------------
				if(me.pop_up.fields_dict.type_followup.input.value=='Follow-Up For Share'){

					for(i=0;i<pd.length;i++){
						if(pd[i].share_followup_date){
							if(pd[i].share_followup_date.length!=0){
								var past_date=(pd[i].share_followup_date.split("-").reverse().join("-"));
								me.pop_up.fields_dict.followup_date.input.value = past_date
							}
							break
						}
					}
				
					$('[data-fieldname=followup_date]').css('display','block')
					$("#container").remove();
					var share_list=[]

					for(i=0;i<pd.length;i++){	
						if(pd[i].share_followup_status!='Intrested' || pd[i].share_followup_status.length==0){
							share_list.push(pd[i].name)
					    }
					}

					if(share_list.length>0){
							me.append_popup_fields(me.pop_up,cur_frm.doc);
							$(me.pop_up_body.find('.select')).css('display','none')
							me.append_share_property_details(cur_frm.doc, me.pop_up);
							me.set_another_follow_up_date(cur_frm.doc, me.pop_up)
					}

					else{
						$('[data-fieldname=followup_date]').css('display','none')
						msgprint("There is no any property available for Share follow up or all properties share follow up is completed...!!")
					}

					if(me.pop_up.fields_dict.followup_date.input.value.length==0){
						var e = document.getElementById('container');
				        e.style.display = 'none';
				        me.flag=1
				    }

				    else{
				    	var e = document.getElementById('container');
				        e.style.display = 'block';
				        me.flag=0
				    }

				}

				// SHARE FOLLOW UP FOR SE ---------------------------------------------
				if(me.pop_up.fields_dict.type_followup.input.value=='Follow-Up For SE'){
					pd = cur_frm.doc.property_details
					for(i=0;i<pd.length;i++){
						if(pd[i].se_followup_date){
							if(pd[i].site_visit){
								var past_date=(pd[i].se_followup_date.split("-").reverse().join("-"));
								me.pop_up.fields_dict.followup_date.input.value = past_date
								break
							}
							
						}
						else{
								me.pop_up.fields_dict.followup_date.input.value = ''
							}
					}

					$('[data-fieldname=followup_date]').css('display','block')
					$("#container").remove();
					var se_list=[]

					for(i=0;i<pd.length;i++){	
						if(pd[i].share_followup_status=='Intrested' && pd[i].site_visit && pd[i].acm_status!='Close' && !pd[i].acm_visit && !pd[i].schedule_se && pd[i].se_follow_up_status!='Intrested'){
							se_list.push(pd[i].name)
					    }
					}
			
					if(se_list.length>0){
							me.append_se_popup_fields(me.pop_up,cur_frm.doc);
							$(me.pop_up_body.find('.select')).css('display','none')
							me.append_se_property_details(cur_frm.doc, me.pop_up);
							me.set_another_follow_up_date(cur_frm.doc, me.pop_up)
					}
					else{
						$('[data-fieldname=followup_date]').css('display','none')
						msgprint("There is no any property available for SE follow up")
					}

					if(me.pop_up.fields_dict.followup_date.input.value.length==0){
						var e = document.getElementById('container');
				        e.style.display = 'none';
				        me.flag1=1
				    }

				    else{
				    	var e = document.getElementById('container');
				        e.style.display = 'block';
				        me.flag1=0
				    }

				}


				if(me.pop_up.fields_dict.type_followup.input.value=='Follow-Up For ACM'){
					for(i=0;i<pd.length;i++){
						if(pd[i].acm_followup_date){
							if(pd[i].acm_visit){
								var past_date=(pd[i].acm_followup_date.split("-").reverse().join("-"));
								me.pop_up.fields_dict.followup_date.input.value = past_date
								break
							}
						}
						else{
								me.pop_up.fields_dict.followup_date.input.value = ''
							}
					}

					$('[data-fieldname=followup_date]').css('display','block')
					$("#container").remove();
					var acm_list =[]

					for(i=0;i<pd.length;i++){	
						if(pd[i].se_follow_up_status=='Intrested' && pd[i].acm_visit && pd[i].acm_followup_status !='Close' && !pd[i].schedule_acm){
							acm_list.push(pd[i].name)
					    }
					}


					if(acm_list.length>0){
						me.append_acm_popup_fields(me.pop_up,cur_frm.doc);
						$(me.pop_up_body.find('.select')).css('display','none')
						me.append_acm_property_details(cur_frm.doc,me.pop_up);
					}

					else{
						$('[data-fieldname=followup_date]').css('display','none')
						msgprint("There is no any property available for ACM follow up")
					}

						if(me.pop_up.fields_dict.followup_date.input.value.length==0){
							var e = document.getElementById('container');
					        e.style.display = 'none';
					        me.flag2=1
					    }

					    else{
					    	var e = document.getElementById('container');
					        e.style.display = 'block';
					        me.flag2=0
					    }


				}

				$(me.pop_up_body.find('.select_dropdown')).change(function(){
					row = $(this).parent().parent();
					var cdn = row.find("input#cdn").val();
					cdoc = locals["Lead Property Details"][cdn]
					
					if(row.find('input#_select').is(':checked')){

						flag = false
						position = 0
						$.each(property_details_list, function( index,d ) {
		 					if (d['name'] == row.find("input#cdn").val()){
		 						flag = true
		 						position = index
		 					}
						});
					

						if (flag){
							property_details_list.splice(position, 1);
						}
						property_details_list.push({
							"name":row.find("input#cdn").val(),
							"status": row.find('#followup_status').val()
						})
					}

				})

				$("input#check_all").click(function(){
					me.check_all_jvs();
				});

				$(me.pop_up_body).find(".select").click(function(){
					$('input#check_all').prop('checked', false);
					row = $(this).parent().parent();
					// check if check box is checked or Not
					if(row.find('input#_select').is(':checked')){
						flag = false
						position = 0
						$.each(property_details_list, function( index,d ) {
		 					if (d['name'] == row.find("input#cdn").val()){
		 						flag = true
		 						position = index
		 					}
						});

						if (flag) {
							property_details_list.splice(position, 1);
						}
						property_details_list.push({
							"name":row.find("input#cdn").val(),
							"status": row.find('#followup_status').val()
						})
					}
				});

				

			});
			

			
			$(".modal-dialog").css("width","800px");
			$(".modal-content").css("max-height","600px");
			$(".modal-footer").css("text-align","center");
		},
		show_pop_up_dialog: function(doc, me){
			return new frappe.ui.Dialog({
				title: "Select Properties For Follow-Up",
				no_submit_on_enter: true,
				fields: [

					{label:__("Type Of Follow-Up"), fieldtype:"Select",reqd:1, options:"\nFollow-Up For Share\nFollow-Up For SE\nFollow-Up For ACM", fieldname:"type_followup"},

					{fieldtype: "Column Break","name":"cc_sec"},

					{label:__("Follow-Up Date"), fieldtype:"Date",fieldname:"followup_date"},

					{fieldtype: "Section Break","name":"cc_sec"},

					{label:__("Property Follow-Ups"), fieldtype:"HTML", fieldname:"followup"},
				],

				primary_action_label: "Done",
				primary_action: function(doc) {
					// _me = this;
					doc=cur_frm.doc
					var pd = doc.property_details;
					if(me.pop_up.fields_dict.type_followup.input.value && me.pop_up.fields_dict.followup_date.input.value){
						if(!property_details_list.length && (me.flag==1 || me.flag1==1 || me.flag2==1)){
							for(i=0;i<pd.length;i++){
								property_details_list.push(pd[i].name)
							}
							if(me.pop_up.fields_dict.followup_date.input.value){
								return frappe.call({
									method: 'hunters_camp.hunters_camp.doctype.lead_management.lead_management.update_followup_date',
									freeze: true,
									freeze_message:"Updating Follow Date",
									args: {
										"prop_list":property_details_list,
										"followup_type":me.pop_up.fields_dict.type_followup.input.value,
										"followup_date":me.pop_up.fields_dict.followup_date.input.value,
										"doc_name":doc.name
									},
									callback: function(r) {
										me.pop_up.hide();
										cur_frm.reload_doc()
										setTimeout(function(){},1000)
									}
								});
							}
						}
							//msgprint("Please first select the property to set followup");
						else if(me.check_for_status_property_id(property_details_list) && (me.flag==0 || me.flag1==0 || me.flag2==0)){
							if (property_details_list.length){

								return frappe.call({
									method: 'hunters_camp.hunters_camp.doctype.lead_management.lead_management.update_details',
									freeze: true,
									freeze_message:"Updating Follow Date",
									args: {
										"prop_list":property_details_list,
										"followup_type":me.pop_up.fields_dict.type_followup.input.value,
										"followup_date":me.pop_up.fields_dict.followup_date.input.value
									},
									callback: function(r) {
										me.pop_up.hide();
										cur_frm.reload_doc()
										setTimeout(function(){},1000)
									}
								});								
							}
							else{
								msgprint("Select Property Id to update it")
							}	

						}

					}
					else{

						msgprint("Type of followup and Schedule date is mandatory.")
					}
						
				}
			});

		},
		check_for_status_property_id:function(property_details_list){
			status_flag = true
			$.each($(cur_dialog.body).find("#property_details tbody tr"), function(index, value){
				if ( $(this).find('input#_select').is(':checked') && !$(this).find("#followup_status").val()){
					msgprint("Mandatory field status not set against property id {0}".replace("{0}",$(this).find("#property_id").text()))
					status_flag = false
					return false
				}
			})
			return status_flag
		
		},

		append_popup_fields: function(pop_up,doc){
			this.fd = pop_up.fields_dict;
			var pd = doc.property_details;

			this.pop_up_body = $("<div id='container' style='overflow: auto;max-height: 300px;'><table class='table table-bordered table-hover' id='property_details'><thead>\
			<th width='inherit'></th><th><b>Property ID</b></th><th><b>Property Name</b></th>\
			<th><b>Status</b></th></thead><tbody></tbody></table></div>").appendTo($(this.fd.followup.wrapper));

		},

		append_se_popup_fields: function(pop_up,doc){
			this.fd = pop_up.fields_dict;
			var pd = doc.property_details;

			this.pop_up_body = $("<div id='container' style='overflow: auto;max-height: 300px;'><table class='table table-bordered table-hover' id='property_details'><thead>\
			<th width='inherit'></th><th><b>Property ID</b></th><th><b>Property Name</b></th><th><b>Site Visit</b></th><th><b>SE Status</b></th>\
			<th><b>Follow Up Status</b><th><b>Status</b></th></thead><tbody></tbody></table></div>").appendTo($(this.fd.followup.wrapper));

		},

		append_acm_popup_fields: function(pop_up,doc){
			this.fd = pop_up.fields_dict;
			var pd = doc.property_details;

			this.pop_up_body = $("<div id='container' style='overflow: auto;max-height: 300px;'><table class='table table-bordered table-hover' id='property_details'><thead>\
			<th width='inherit'></th><th><b>Property ID</b></th><th><b>Property Name</b></th><th><b>ACM Visit</b></th><th><b>ACM Status</b></th>\
			<th><b>Follow Up Status</b></th><th><b>Status</b></th></thead><tbody></tbody></table></div>").appendTo($(this.fd.followup.wrapper));

		},

		append_share_property_details: function(doc, pop_up){
			
			var pd = doc.property_details;

			for (var i = 0; i < pd.length; i++) {
				if(pd[i].property_id){
					checked = "";
					if(pd[i].share_followup_status!='Intrested' || pd[i].share_followup_status.length==0){
						$("<tr><td class='d'><input type='checkbox' class='select' id='_select'><input type='hidden' id='cdn' value='"+ pd[i].name +"'></td>\
							<td align='center' id ='property_id'>"+ pd[i].property_id +"</td>\
							<td align='center' id='property_name'>"+ pd[i].property_name +"</td>\
							<td align='center' id='status'><select class='select_dropdown' id='followup_status'>\
							<option value=''></option>\
							<option value='Intrested'>Intrested</option>\
							<option value='Not Intrested' > Not Intrested</option>\
							<option value='Another Follow Up'>Another Follow Up</option>\
							</select></td>\
							</tr>").appendTo($("#property_details tbody"));
						$(pop_up.body).find("#property_details tbody tr").last().find("#followup_status").val(pd[i].share_followup_status)
					}
					
				}	
			};

		},
		set_another_follow_up_date:function(doc, pop_up){
			$(pop_up.body).find("#followup_status").change(function(){
				if ($(this).val() == 'Another Follow Up'){
					$(pop_up.body).find("input[data-fieldname=followup_date]").val("")	
				}	
				
			})
		},
		append_se_property_details: function(doc, pop_up){
			
			var pd = doc.property_details;

			for (var i = 0; i < pd.length; i++) {
				if(pd[i].property_id){
					checked = "";
					if(pd[i].share_followup_status=='Intrested' && pd[i].site_visit && pd[i].acm_status!='Close' && !pd[i].acm_visit && !pd[i].schedule_se && pd[i].se_follow_up_status!='Intrested'){
						se_follow_up_status = pd[i].se_follow_up_status ? pd[i].se_follow_up_status:"" ;
						$("<tr><td><input type='checkbox' class='select' id='_select'><input type='hidden' id='cdn' value='"+ pd[i].name +"'></td>\
							<td align='center'>"+ pd[i].property_id +"</td>\
							<td align='center' id='property_id_id'>"+ pd[i].property_name +"</td>\
							<td align='center' id='se_sattus'>"+pd[i].site_visit+"</td>\
							<td align='center' id='se_sattus'>"+pd[i].se_status+"</td>\
							<td align='center' id='se_sattus'>"+se_follow_up_status+"</td>\
							<td align='center' id='status'><select class='select_dropdown' id='followup_status'>\
							<option value=''></option>\
							<option value='Intrested'>Intrested</option>\
							<option value='Not Intrested'> Not Intrested</option>\
							<option value='Another Follow Up'>Another Follow Up</option>\
							</select></td>\
							</tr>").appendTo($("#property_details tbody"));
						if((pd[i].se_status == 'Cancelled By SE' || pd[i].se_status == 'Cancelled By Client') && pd[i].se_follow_up_status !='Another Follow Up'){
							$(pop_up.body).find("#property_details tbody tr").last().find("#followup_status").html("<option value=''></option><option value='Another Follow Up'>Another Follow Up</option>")
						}
						if(pd[i].se_follow_up_status == 'Not Intrested'){
							$(pop_up.body).find("#property_details tbody tr").last().find("#followup_status").html("<option value=''></option><option value='Another Follow Up'>Another Follow Up</option>")
						}
						if((pd[i].se_status =='Cancelled By SE' || pd[i].se_status == 'Cancelled By Client') && pd[i].se_follow_up_status=='Another Follow Up'){
							$(pop_up.body).find("#property_details tbody tr").last().find("#followup_status").html("<option value=''></option><option value='Reschedule'>Reschedule</option><option value='Not Intrested'> Not Intrested</option>")
						}	
					}
				}
			};

		},
		append_acm_property_details: function(doc,pop_up){
			var pd = doc.property_details;
			for (var i = 0; i < pd.length; i++) {
				if(pd[i].property_id){
					checked = "";
					if(pd[i].se_follow_up_status=='Intrested' && pd[i].acm_visit && pd[i].acm_followup_status !='Close' && !pd[i].schedule_acm){
						acm_followup_status = pd[i].acm_followup_status? pd[i].acm_followup_status:"";
						$("<tr><td><input type='checkbox' class='select' id='_select'><input type='hidden' id='cdn' value='"+ pd[i].name +"'></td>\
							<td align='center'>"+ pd[i].property_id +"</td>\
							<td align='center' id='property_id_id'>"+ pd[i].property_name +"</td>\
							<td align='center' id='acm_status'>"+pd[i].acm_visit+"</td>\
							<td align='center' id='acm_status'>"+pd[i].acm_status+"</td>\
							<td align='center' id='acm_status'>"+acm_followup_status+"</td>\
							<td align='center' id='status'><select class='select_dropdown' id='followup_status'>\
								<option value=''></option>\
								<option value='Hold'>Hold</option>\
								<option value='Close'>Close</option>\
								<option value='Cancelled By Lead'>Cancelled By Lead</option>\
								<option value='Cancelled By ACM'>Cancelled By ACM</option>\
								</select></td>\
							</tr>").appendTo($("#property_details tbody"));
						if(pd[i].acm_status == 'Close' && pd[i].acm_followup_status !='Close'){
							$(pop_up.body).find("#property_details tbody tr").last().find("#followup_status").html("<option value=''></option><option value='Close'>Close</option>")
						}
						if((pd[i].acm_status == 'Cancelled by ACM' || pd[i].acm_status == 'Cancelled by Lead') && pd[i].acm_followup_status!='Another Follow Up'){
							$(pop_up.body).find("#property_details tbody tr").last().find("#followup_status").html("<option value=''></option><option value='Another Follow Up'>Another Follow Up</option>")
						}
						if((pd[i].acm_status == 'Cancelled by ACM' || pd[i].acm_status == 'Cancelled by Lead') && pd[i].acm_followup_status=='Another Follow Up'){
							$(pop_up.body).find("#property_details tbody tr").last().find("#followup_status").html("<option value=''></option><option value='Reschedule'>Reschedule</option>")
						}
					}
				}
			};

		},
		check_all_jvs: function(){
			property_details_list = [];
			if($(this.pop_up_body).find("input#check_all").is(":checked")){
				$("input#_select").prop("checked",true)
				for (var i = 0; i < cur_frm.doc.property_details.length; i++){
					property_details_list.push(cur_frm.doc.property_details[i].name);
				}
			}
			else{
				$("input#_select").prop("checked",false)
				property_details_list = [];
			}
		}
	});

	var se_list = []
	frappe.SEFollowUps = Class.extend({
		init: function() {
			this.make();
		},
		make: function() {
			property_details_list = []
			var me = this;
			doc=cur_frm.doc
			var pd = doc.property_details;
			me.assign_to=''
			
			for(i=0;i<pd.length;i++){
				if((pd[i].share_followup_status =='Intrested' && !pd[i].site_visit) || (pd[i].share_followup_status =='Intrested' && (pd[i].se_status=="Cancelled By SE" || pd[i].se_status=="Cancelled By Client"))){
					se_list.push(pd[i].name)
				}	
			}
			if(se_list.length>0){
				me.pop_up = this.show_pop_up_dialog(cur_frm.doc,me);
				this.append_pop_up_dialog_body(me.pop_up);
				this.append_se_popup_fields(cur_frm.doc);
			}
			else
				msgprint("There is no any property to schedule SE")

			me.pop_up.show()
			$(".modal-dialog").css("width","800px");
			$(".modal-content").css("max-height","600px");
			$(".modal-footer").css("text-align","center");

			$(me.pop_up_body).find(".select").click(function(){
					$('input#check_all').prop('checked', false);
					row = $(this).parent().parent();
					var cdn = row.find("input#cdn").val();
					cdoc = locals["Lead Property Details"][cdn]
					// check if check box is checked or Not
					if(row.find('input#_select').is(':checked')){
						property_details_list.push(row.find("input#cdn").val())
						//}
					}
					else{
						// remove the voucher_id from list
						property_details_list.pop(row.find("input#cdn").val())
					}
					cur_frm.refresh_fields(["property_details"]);

					if(property_details_list.length>0){
						$('[data-fieldname=cc_sec]').css('display','block')
						$('[data-fieldname=assign_to]').css('display','block')
						$('[data-fieldname=date]').css('display','block')
						if (doc.location_name){
							me.pop_up.fields_dict.assign_to.get_query = function(){
								return {
										"query":"hunters_camp.hunters_camp.doctype.lead_management.lead_management.sales_executive_query",	
										"filters":{"location":cur_frm.doc.location_name}
									}	
								}
						}
						else{
							frappe.msgprint("Please add Location Name to Search Criteria")
						} 
					}
					else{
						$('[data-fieldname=cc_sec]').css('display','none')
						$('[data-fieldname=assign_to]').css('display','none')
						$('[data-fieldname=date]').css('display','none')
					}
				});

			

			$('[data-fieldname=cc_sec]').css('display','none')
			$('[data-fieldname=assign_to]').css('display','none')
			$('[data-fieldname=date]').css('display','none')

			$(me.pop_up.fields_dict.assign_to.input).change(function(){
				me.assign_to=me.pop_up.fields_dict.assign_to.$input.val()
				me.set_site_visit_details(cur_frm.doc,me)

			});	

		},
		show_pop_up_dialog: function(doc, me){
			return new frappe.ui.Dialog({
				title: "Schedule SE",
				no_submit_on_enter: true,
				fields: [

					{label:__("Property Follow-Ups"), fieldtype:"HTML", fieldname:"followup"},

					{fieldtype: "Section Break","name":"cc_sec"},

					{label:__("Assign SE"), fieldtype:"Link", fieldname:"assign_to",options:"User"},

					{fieldtype: "Column Break","name":"cc_sec"},

					{label:__("Schedule Date & Time"), fieldtype:"Datetime", fieldname:"date",reqd:1},

					{fieldtype: "Section Break","name":"cc_sec1"},

					{label:__("SE Details"), fieldtype:"HTML", fieldname:"se_details"}

				],

				primary_action_label: "Schedule SE",
				primary_action: function() {
					// Update Clearance Date of the checked vouchers
					if(!property_details_list.length)
						msgprint("Please first select the property to schedule SE");
					else{
						if(me.assign_to.length>0 && me.pop_up.fields_dict.date.$input.val()){
							new_prop_list = property_details_list
							property_details_list = []
							return frappe.call({
								method: "hunters_camp.hunters_camp.doctype.lead_management.lead_management.make_se_visit",
								freeze:true,
								freeze_message:"Scheduling Site Visit....Please Wait",
								args: {
									"property_list":new_prop_list,
									"assign_to": me.assign_to,
									"parent":cur_frm.doc.name,
									"schedule_date":me.pop_up.fields_dict.date.$input.val()
								},
								callback: function(r) {
									//cur_frm.refresh_fields();
									if(r.message['Status']=='Busy'){
										$('#container_second').remove()
										me.pop_up_body = $("<div id='container_second' style='overflow: auto;max-height: 300px;'> Selected Sales Execitive available to schedule the new visit.</div>").appendTo($(me.fd.se_details.wrapper));
									}
									else{
										cur_frm.reload_doc()
										setTimeout(function(){me.set_property_details(cur_frm.doc,me)},1000)
										
									}
								}
						});
						}
						else{
							msgprint("Please Specify Site Visiter Name and date time for the visit.")
						}
					}
				}
			});
			
		},

		set_site_visit_details: function(doc,me){
			var site_final_list =[]
			pd = cur_frm.doc.property_details

			return frappe.call({
				method: "hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_se_details",
				args: {
					"assign_to": me.assign_to
				},
				callback: function(r) {
					cur_frm.refresh_fields();
					if(r.message['status']=='Available'){
						$('#container_second').remove()
						me.pop_up_body = $("<div id='container_second' style='overflow: auto;max-height: 300px;'> Selected Sales Execitive available to schedule the new visit.</div>").appendTo($(me.fd.se_details.wrapper));
					}
					else{
						$('#container_second').remove()
						me.append_se_details(me,r.message)
						me.append_se_details_on_popup(cur_frm.doc,r.message)
					}
						
				}
			});


		},

		set_property_details:function(doc,me){
			//cur_frm.reload_doc()
			$('#container').remove()
			site_final_list =[]
			var pd = cur_frm.doc.property_details
			for(i=0;i<pd.length;i++){
				//cur_frm.reload_doc()
				if(!pd[i].site_visit){
					site_final_list.push(pd[i].name)
				}
			}
			$('#container').remove()
			if(site_final_list.length>0){
				$('#container').remove()
				me.append_pop_up_dialog_body(me.pop_up,doc)
				me.append_se_popup_fields(doc)
			}
			else{
				$('#container').remove()
				$("<div id='container' style='overflow: auto;max-height: 300px;'><b>For all properties Site Visit is created.</b></div>").appendTo($(me.fd.followup.wrapper));
			}

			$(me.pop_up_body).find(".select").click(function(){
					$('input#check_all').prop('checked', false);
					property_details_list =[]
					row = $(this).parent().parent();
					var cdn = row.find("input#cdn").val();
					cdoc = locals["Lead Property Details"][cdn]
					// check if check box is checked or Not
					if(row.find('input#_select').is(':checked')){
						property_details_list.push(row.find("input#cdn").val())
					}
					else{
						// remove the voucher_id from list
						property_details_list.pop(row.find("input#cdn").val())
					}
					cur_frm.refresh_fields(["property_details"]);

					if(property_details_list.length>0){
						$('[data-fieldname=cc_sec]').css('display','block')
						$('[data-fieldname=assign_to]').css('display','block')
						$('[data-fieldname=date]').css('display','block')
						if (doc.location_name){
							me.pop_up.fields_dict.assign_to.get_query = function(){
									query:"hunters_camp.hunters_camp.doctype.lead_management.lead_management.sales_executive_query";
									filetrs:doc.location_name
							}
						}
						else{
							frappe.msgprint("Please Add location in search Criteria")
						}	
					}
					else{
						$('[data-fieldname=cc_sec]').css('display','none')
						$('[data-fieldname=assign_to]').css('display','none')
						$('[data-fieldname=date]').css('display','none')
					}
				});

			
		},

		append_se_details: function(me){
			this.pop_up_body = $("<div id='container_second' style='overflow: auto;max-height: 300px;'><table class='table table-bordered table-hover' id='site_details'><thead>\
			<th><b>Site Visit</b></th><th><b>Schedule Date</b></th><th><b>Sales Executive</b></th></thead><tbody></tbody></table></div>").appendTo($(this.fd.se_details.wrapper));

		},

		append_se_details_on_popup: function(doc,message){
			for (var i = 0; i < message.length; i++) {
				if(message[i]['name']){
					$("<tr>\
						<td align='center' id='status'>"+message[i]['name']+"</td>\
						<td align='center' id='status'>"+message[i]['schedule_date']+"</td>\
						<td align='center' id='status'>"+message[i]['visiter']+"</td>\
						</tr>").appendTo($("#site_details tbody"));
					}	
			};

		},

		append_pop_up_dialog_body: function(pop_up,doc){
			this.fd = pop_up.fields_dict;
			this.pop_up_body = $("<div id='container' style='overflow: auto;max-height: 300px;'><table class='table table-bordered table-hover' id='property_details'><thead>\
			<th width='inherit'></th><th><b>Property ID</b></th><th><b>Property Name</b></th>\
			<th><b>Follow Up Status</b></th></thead><tbody></tbody></table></div>").appendTo($(this.fd.followup.wrapper));

		},

		append_se_popup_fields: function(doc){
			var pd = doc.property_details;
			for (var i = 0; i < pd.length; i++) {
				if(pd[i].property_id){
					checked = "";
					if(pd[i].share_followup_status =='Intrested' && pd[i].schedule_se){
						$("<tr><td class='d'><input type='checkbox' class='select' id='_select'><input type='hidden' id='cdn' value='"+ pd[i].name +"'></td>\
							<td align='center' id ='property_id'>"+ pd[i].property_id +"</td>\
							<td align='center' id='property_name'>"+ pd[i].property_name +"</td>\
							<td align='center' id='status'>"+ pd[i].share_followup_status +"</td>\
							</tr>").appendTo($("#property_details tbody"));
					}
				}
			};
		},

		});

	//ACM FOLLOW UP -----------------------------------------------------------
	var acm_list = []
	frappe.ACMFollowUps = Class.extend({

		init: function() {
			this.make();
		},
		make: function() {
			property_details_list = []
			var me = this;
			doc=cur_frm.doc
			var pd = doc.property_details;
			me.assign_to=''
			
			for(i=0;i<pd.length;i++){
				if(pd[i].acm_followup_status =='Reschedule' || (pd[i].se_follow_up_status =='Intrested' && !pd[i].acm_visit)){
					se_list.push(pd[i].name)
				}

			}
			if(se_list.length>0){
				me.pop_up = this.show_pop_up_dialog(cur_frm.doc,me);
				this.append_pop_up_dialog_body(me.pop_up);
				this.append_se_popup_fields(cur_frm.doc);
			}
			else
				msgprint("There is no any property to schedule ACM")

			me.pop_up.show()
			$(".modal-dialog").css("width","800px");
			$(".modal-content").css("max-height","600px");
			$(".modal-footer").css("text-align","center");

			$('[data-fieldname=cc_sec]').css('display','none')
			$('[data-fieldname=assign_to]').css('display','none')
			$('[data-fieldname=date]').css('display','none')

			$(me.pop_up_body).find(".select").click(function(){
					$('input#check_all').prop('checked', false);
					row = $(this).parent().parent();
					var cdn = row.find("input#cdn").val();
					cdoc = locals["Lead Property Details"][cdn]
					// check if check box is checked or Not
					if(row.find('input#_select').is(':checked')){
						property_details_list.push(row.find("input#cdn").val())
						//}
					}
					else{
						// remove the voucher_id from list
						property_details_list.pop(row.find("input#cdn").val())
					}
					cur_frm.refresh_fields(["property_details"]);

					if(property_details_list.length>0){
						$('[data-fieldname=cc_sec]').css('display','block')
						$('[data-fieldname=assign_to]').css('display','block')
						$('[data-fieldname=date]').css('display','block')
						me.pop_up.fields_dict.assign_to.get_query = "hunters_camp.hunters_camp.doctype.lead_management.lead_management.acm_query";
					}
					else{
						$('[data-fieldname=cc_sec]').css('display','none')
						$('[data-fieldname=assign_to]').css('display','none')
						$('[data-fieldname=date]').css('display','none')
					}
				});


			$('[data-fieldname=cc_sec]').css('display','none')
			$('[data-fieldname=assign_to]').css('display','none')
			$('[data-fieldname=date]').css('display','none')

			$(me.pop_up.fields_dict.assign_to.input).change(function(){
				me.assign_to=me.pop_up.fields_dict.assign_to.$input.val()
				me.get_acm_visit_details(cur_frm.doc,me)

			});		

		},

		get_acm_visit_details: function(doc,me){
			var acm_final_list =[]
			pd = cur_frm.doc.property_details

			return frappe.call({
				method: "hunters_camp.hunters_camp.doctype.lead_management.lead_management.get_acm_details",
				args: {
					"assign_to": me.assign_to
				},
				callback: function(r) {
					cur_frm.refresh_fields();
					if(r.message['status']=='Available'){
						$('#container_second').remove()
						me.pop_up_body = $("<div id='container_second' style='overflow: auto;max-height: 300px;'> Selected ACM available to schedule the new visit.</div>").appendTo($(me.fd.se_details.wrapper));
					}
					else{
						$('#container_second').remove()
						me.append_se_details(me,r.message)
						me.append_se_details_on_popup(cur_frm.doc,r.message)
					}
						
				}
			});


		},

		show_pop_up_dialog: function(doc, me){
			return new frappe.ui.Dialog({
				title: "Schedule ACM",
				no_submit_on_enter: true,
				fields: [

					{label:__("Property Follow-Ups"), fieldtype:"HTML", fieldname:"followup"},

					{fieldtype: "Section Break","name":"cc_sec"},

					{label:__("Assign ACM"), fieldtype:"Link", fieldname:"assign_to",options:"User"},

					{fieldtype: "Column Break","name":"cc_sec"},

					{label:__("Schedule Date & Time"), fieldtype:"Datetime", fieldname:"date",reqd:1},

					{fieldtype: "Section Break","name":"cc_sec1"},

					{label:__("SE Details"), fieldtype:"HTML", fieldname:"se_details"}

				],

				primary_action_label: "Schedule ACM",
				primary_action: function() {
					// Update Clearance Date of the checked vouchers
					if(!property_details_list.length)
						msgprint("Please first select the property to schedule SE");
					else{
						if(me.assign_to.length>0 && me.pop_up.fields_dict.date.$input.val()){
							return frappe.call({
								method: "hunters_camp.hunters_camp.doctype.lead_management.lead_management.make_acm_visit",
								freeze:true,
								freeze_message:"Scheduling ACM Visit....Please Wait",
								args: {
									"property_list":property_details_list,
									"assign_to": me.assign_to,
									"parent":cur_frm.doc.name,
									"schedule_date":me.pop_up.fields_dict.date.$input.val()
								},
								callback: function(r) {
									//cur_frm.refresh_fields();
									if(r.message['Status']=='Busy'){
										cur_frm.reload_doc()
										$('#container_second').remove()
										me.pop_up_body = $("<div id='container_second' style='overflow: auto;max-height: 300px;'> Selected ACM available to schedule the new visit.</div>").appendTo($(me.fd.se_details.wrapper));
									}
									else{
										cur_frm.reload_doc()
										setTimeout(function(){me.set_acm_visit_details(cur_frm.doc,me)},2000)
										
									}
								}
						});
						}
						else{
							msgprint("Please Specify Site Visiter Name and date time for the visit.")
						}
					}
				}
			});

			
		},

		set_acm_visit_details:function(doc,me){
			//cur_frm.reload_doc()
			$('#container').remove()
			acm_final_list =[]
			var pd = cur_frm.doc.property_details
			for(i=0;i<pd.length;i++){
				cur_frm.reload_doc()
				if(!pd[i].acm_visit){
					acm_final_list.push(pd[i].name)
				}
			}
			$('#container').remove()
			if(acm_final_list.length>0){
				$('#container').remove()
				me.append_pop_up_dialog_body(me.pop_up,doc)
				me.append_se_popup_fields(doc)
			}
			else{
				$('#container').remove()
				$("<div id='container' style='overflow: auto;max-height: 300px;'><b>For all properties ACM Visit is created.</b></div>").appendTo($(me.fd.followup.wrapper));
			}

			$(me.pop_up_body).find(".select").click(function(){
					$('input#check_all').prop('checked', false);
					property_details_list =[]
					row = $(this).parent().parent();
					var cdn = row.find("input#cdn").val();
					cdoc = locals["Lead Property Details"][cdn]
					// check if check box is checked or Not
					if(row.find('input#_select').is(':checked')){
						property_details_list.push(row.find("input#cdn").val())
					}
					else{
						// remove the voucher_id from list
						property_details_list.pop(row.find("input#cdn").val())
					}
					cur_frm.refresh_fields(["property_details"]);

					if(property_details_list.length>0){
						$('[data-fieldname=cc_sec]').css('display','block')
						$('[data-fieldname=assign_to]').css('display','block')
						$('[data-fieldname=date]').css('display','block')
						me.pop_up.fields_dict.assign_to.get_query = "hunters_camp.hunters_camp.doctype.lead_management.lead_management.acm_query";

					}
					else{
						$('[data-fieldname=cc_sec]').css('display','none')
						$('[data-fieldname=assign_to]').css('display','none')
						$('[data-fieldname=date]').css('display','none')
					}
				});
		},


		append_se_details: function(me){
			this.pop_up_body = $("<div id='container_second' style='overflow: auto;max-height: 300px;'><table class='table table-bordered table-hover' id='site_details'><thead>\
			<th><b>ACM Visit</b></th><th><b>Schedule Date</b></th>\
			<th><b>ACM Visiter</b></th></thead><tbody></tbody></table></div>").appendTo($(this.fd.se_details.wrapper));

		},


		append_se_details_on_popup: function(doc,message){
			
			var pd = cur_frm.doc.property_details;

			for (var i = 0; i < message.length; i++) {
				if(message[i]['name']){
					$("<tr>\
						<td align='center' id='status'>"+message[i]['name']+"</td>\
						<td align='center' id='status'>"+message[i]['schedule_date']+"</td>\
						<td align='center' id='status'>"+message[i]['visiter']+"</td>\
						</tr>").appendTo($("#site_details tbody"));
					}	
			}

		},

		append_pop_up_dialog_body: function(pop_up,doc){
			this.fd = pop_up.fields_dict;
			this.pop_up_body = $("<div id='container' style='overflow: auto;max-height: 300px;'><table class='table table-bordered table-hover' id='property_details'><thead>\
			<th width='inherit'></th><th><b>Property ID</b></th><th><b>Property Name</b></th>\
			<th><b>Follow Up Status</b></th></thead><tbody></tbody></table></div>").appendTo($(this.fd.followup.wrapper));

		},

		append_se_popup_fields: function(doc){
			var pd = doc.property_details;
			for (var i = 0; i < pd.length; i++) {
				if(pd[i].property_id){
					checked = "";
					if(pd[i].se_follow_up_status =='Intrested' && pd[i].schedule_acm){
						$("<tr><td class='d'><input type='checkbox' class='select' id='_select'><input type='hidden' id='cdn' value='"+ pd[i].name +"'></td>\
							<td align='center' id ='property_id'>"+ pd[i].property_id +"</td>\
							<td align='center' id ='property_name'>"+ pd[i].property_name +"</td>\
							<td align='center' id='status'>"+pd[i].se_follow_up_status+"</td>\
							</tr>").appendTo($("#property_details tbody"));
					}
					
				}
			};
		},

		});

	});

frappe.ui.form.on("Lead Management", "onload", function(frm) {
	frm.doc.email_sent = 'No'
	cur_frm.refresh_fields(["email_sent"])
})


cur_frm.fields_dict['property_subtype'].get_query = function(doc,cdt,cdn) {
	return{
		filters:{
			'property_type': doc.property_type,
		}
	}
}

frappe.ui.form.on("Lead Management", "city", function(frm) {
	var me = this;
	me.init_multiple_location(frm)
})

init_multiple_location =  function(frm){
	frappe.call({
		method:"hunters_camp.hunters_camp.page.property.property.get_location_list",
		args:{"city":frm.doc.city},
		callback:function(r){
			me.location_list = r.message
			LocationMultiSelect.prototype.init($(cur_frm.get_field("location_name").wrapper).find("input[data-fieldname=location_name]"), r.message)
		}
	})	
}