frappe.ui.form.on("Property Confirmation", {
	refresh:function(frm){
		if(!frm.doc.__islocal){
			if(frappe.user.has_role("System Manager") && (frm.doc.status!="Properties Available Now")){
				cur_frm.add_custom_button(__('Confirm Requirement'), cur_frm.cscript.confirm_property).addClass("btn-primary");
			}
			
		}


	}

});
cur_frm.cscript.confirm_property = function(){
	cur_frm.set_value("status","Properties Available Now")
	refresh_field("status")
	cur_frm.save()
}