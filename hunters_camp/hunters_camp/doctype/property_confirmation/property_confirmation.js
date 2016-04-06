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
	cur_frm.cscript.email_notification_to_consultant();
	
}
// code added by arpit to send email to particular consultant after confirm the property
cur_frm.cscript.email_notification_to_consultant = function(){
					return frappe.call({
						method:'hunters_camp.hunters_camp.doctype.property_confirmation.property_confirmation.mail_notifiction_to_consultant',
						freeze:true,
						freeze_message:"Property Confirmation Please Wait......",
						args:{"prop_data":cur_frm.doc},
						callback: function(r,rt) {
							if(r.message) {
									cur_frm.set_value("status","Properties Available Now")
									refresh_field("status")
									cur_frm.save()
								
							}
						},
					});	
				}

// end of code
 