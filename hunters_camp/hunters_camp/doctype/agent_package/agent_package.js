




frappe.ui.form.on("Agent Package", {
	
	onload: function(frm) {
		
	},
	refresh:function(frm){
		if(!frm.doc.__islocal){
			cur_frm.set_df_property("package_name", "read_only", 1);
			cur_frm.set_df_property("start_date", "read_only", 1);
			if(!frappe.user.has_role("Agent")){
				cur_frm.add_custom_button(__('Renew Package'), cur_frm.cscript.renew_package).addClass("btn-primary");
				cur_frm.add_custom_button(__('Upgrade Package'), cur_frm.cscript.upgrade_package).addClass("btn-primary");		
			}
			
		}

	}


});


cur_frm.add_fetch("package_name", "posting_allowed", "package_posting_allowed")
cur_frm.add_fetch("package_name", "validity_of_package", "package_validity")

cur_frm.cscript.package_name = function(){
		cur_frm.cscript.start_date()
}

cur_frm.cscript.start_date = function(){
	console.log("start_date")
	if (cur_frm.doc.package_name){
		add_days = cur_frm.doc.package_validity - 1 
	    cur_frm.doc.end_date = frappe.datetime.add_days(cur_frm.doc.start_date, add_days)
	    cur_frm.doc.status = "Active"
	    cur_frm.doc.package_status = "New"
	    cur_frm.doc.posting_allowed = cur_frm.doc.package_posting_allowed
	    refresh_field(["end_date", "status", "package_status", "posting_allowed"])
	}
	else{
		msgprint("Select Package Name firstly")
	}
}


cur_frm.cscript.renew_package = function(){
	if (! (cur_frm.doc.start_date == frappe.datetime.nowdate()) ){
		up = new UpdatePackage(cur_frm.doc, "Renew")
	}else{
		msgprint("Package renewal not allowed on same start date")
	}
	
}


cur_frm.cscript.upgrade_package = function(){
	up = new UpdatePackage(cur_frm.doc, "Upgrade")
}

cur_frm.cscript.status = function(){
	if (cur_frm.doc.status == "Inactive"){
		cur_frm.doc.posting_allowed =  0
		cur_frm.doc.property_posted = 0
		refresh_field(["posting_allowed", "property_posted"])
	}
}





cur_frm.cscript.get_package_details = function(){
	frappe.call({
		method: "hunters_camp.hunters_camp.doctype.agent_package.agent_package.get_package_details",
		args: {
			"package_name": cur_frm.doc.package_name
		},
		callback: function(r) {

			newdate = frappe.datetime.user_to_obj(cur_frm.doc.start_date)
			add_days = $(me.dialog.body).find('input[data-fieldname=validity]').val() - 1
		    newdate.setDate(newdate.getDate() + add_days);
		    var end_date =  frappe.datetime.obj_to_user(newdate)

		}
	});

}












UpdatePackage = Class.extend({
	init:function(doc, transaction_type){
		this.doc = doc
		this.transaction_type = transaction_type
		this.make_dialog()
	},
	make_dialog:function(){
		this.dialog = new frappe.ui.Dialog({
			title: __("{} Package").replace("{}", this.transaction_type),
			fields: [
				{"fieldtype": "Link", "label": __("Package Name"), "fieldname": "package_nm",
					"reqd": 1, "options":"Package" },
				{"fieldtype": "Int", "label": __("Validity Of Package"), "fieldname": "validity",
				},
				{"fieldtype": "Currency", "label": __("Package Price"), "fieldname": "price",
				 },
				{"fieldtype": "Int", "label": __("Posting Allowed"), "fieldname": "pst_allowed",
				 },
				{"fieldtype": "Button", "label": __("Update"), "fieldname": "update"},
			]
		});

		this.dialog.show()
		this.check_for_renew_package()
		$(this.dialog.body).find('[data-fieldname=validity]').css('display','none')
		$(this.dialog.body).find('[data-fieldname=price]').css('display','none')
		$(this.dialog.body).find('[data-fieldname=pst_allowed]').css('display','none')
		this.update_package_details()
		this.init_for_package_update()
		

	},
	check_for_renew_package:function(){
		var me = this

		if (this.transaction_type == "Renew"){
			$(this.dialog.body).find("input[data-fieldname=package_nm]").val(this.doc.package_name)
			$(this.dialog.body).find("input[data-fieldname=package_nm]").prop('disabled', true);
			this.get_package_details()
		}


	},
	get_package_details:function(){
		var me = this
		frappe.call({
			method: "hunters_camp.hunters_camp.doctype.agent_package.agent_package.get_package_details",
			args: {
				"package_name": $(me.dialog.body).find("input[data-fieldname=package_nm]").val()
			},
			callback: function(r) {
				$(me.dialog.body).find('[data-fieldname=validity]').css('display','block').prop('disabled', true);
				$(me.dialog.body).find('[data-fieldname=price]').css('display','block').prop('disabled', true);
				$(me.dialog.body).find('[data-fieldname=pst_allowed]').css('display','block').prop('disabled', true);
				$(me.dialog.body).find('input[data-fieldname=validity]').val(r.message.validity_of_package)
				$(me.dialog.body).find('input[data-fieldname=price]').val(r.message.price)
				$(me.dialog.body).find('input[data-fieldname=pst_allowed]').val(r.message.posting_allowed)

			}
		});

	},
	update_package_details:function(){
		var me = this
		$(this.dialog.fields_dict.package_nm.input).change(function(){
			me.get_package_details()
		})

	},
	update_end_date: function(start_date){
		var me = this
		if (me.dialog.fields_dict.package_nm.input.value){
			newdate = frappe.datetime.user_to_obj(start_date)
			add_days = $(me.dialog.body).find('input[data-fieldname=validity]').val() - 1
		    newdate.setDate(newdate.getDate() + add_days);
		    var end_date =  frappe.datetime.obj_to_user(newdate)
			return end_date		
		}
			
	},
	init_for_package_update:function(){
		var me = this
		$(this.dialog.fields_dict.update.input).click(function(){
			if (!me.dialog.fields_dict.package_nm.input.value){
				msgprint("Please Select Mandatory fields Package Name")
			}
			else{

				
					frappe.confirm(__("Are you sure you want to update package"),
						function() {
							if (frappe.datetime.get_today() > me.doc.end_date){
								me.start_date = frappe.datetime.obj_to_user(frappe.datetime.nowdate())				
							}
							else{
								me.start_date = frappe.datetime.obj_to_user(frappe.datetime.add_days(cur_frm.doc.end_date, 1))
								
							}
							 end_date = me.update_end_date(me.start_date)
							 me.doc.start_date = frappe.datetime.nowdate()
							 me.doc.end_date = frappe.datetime.obj_to_str(frappe.datetime.user_to_obj(end_date))
							 me.doc.posting_allowed += parseInt(me.dialog.fields_dict.pst_allowed.input.value) - me.doc.property_posted
							 me.doc.property_posted = 0
							 me.doc.status = "Active"
							 me.doc.package_name = me.dialog.fields_dict.package_nm.input.value
							 me.doc.package_posting_allowed = me.dialog.fields_dict.pst_allowed.input.value
							 me.doc.package_validity = me.dialog.fields_dict.validity.input.value
							 me.doc.package_status = me.transaction_type == "Renew" ? "Renew" : "Upgraded"
							 refresh_field(["start_date", "end_date", "posting_allowed", "status", 
							 				"package_status", "package_name", "package_posting_allowed", "package_validity"])

							
							me.dialog.hide()
							cur_frm.save()
						}
					);
						 
			}

		})
	}

})