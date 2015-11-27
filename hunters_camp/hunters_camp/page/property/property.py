import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
import datetime
import json
import propshikari.propshikari.property_update_api as update_api



@frappe.whitelist()
def get_property_details(property_id):

	test_details = frappe.db.sql("""select name,attached_to_doctype,attached_to_name,file_url 
								from `tabFile Data`""",as_dict=1)

	return {
		'test_details': test_details
		# 'test_name': test_name[:re.search("\d",test_name).start()]
	}


@frappe.whitelist()
def add_properties_in_lead_management(lead_management=None,property_resultset=None):
  properties = json.loads(property_resultset)
  if len(properties)>0:
    for property_id in properties:
      lead_record = frappe.get_doc("Lead Management", lead_management)
      pd = lead_record.append('property_details', {})
      pd.property_id = property_id.get('property_id')
      pd.property_name = property_id.get('property_title')
      pd.area = property_id.get('carpet_area')
      pd.location_name = property_id.get('location')
      pd.price = property_id.get('price')
      pd.address = property_id.get('address')
      pd.bhk = property_id.get('bhk')
      pd.bathroom = property_id.get('no_of_bathroom')
      pd.posting_date = datetime.datetime.strptime(cstr(property_id.get('posting_date')),'%d-%m-%Y')
      if lead_record.enquiry_from=='Lead':
        user= frappe.db.get_value('Lead',{'name':lead_record.lead,},'email_id')
      elif lead_record.enquiry_from=='Customer':
       user= frappe.db.get_value('Customer',{'name':lead_record.customer,},'email_id')
      lead_record.save(ignore_permissions=True)

    share_property =  json.loads(property_resultset)
    user_name = frappe.db.get_value("User", frappe.session.user, ["first_name", "last_name"],as_dict=True)
    args = { "title":"Property Shared by  {0}" .format(frappe.session.user) , "property_data":share_property ,"first_name":user_name.get("first_name"), "last_name":user_name.get("last_name")}
    if user:
      send_email(user, "Propshikari properties shared with you", "/templates/share_property_template.html", args)
  
  return True

def send_email(email, subject, template, args):
  frappe.sendmail(recipients=email, sender=None, subject=subject,
      message=frappe.get_template(template).render(args))


@frappe.whitelist()
def share_property_to_user(property_resultset=None,user=None,comments=None):
	share_property =  json.loads(property_resultset)
	user_name = frappe.db.get_value("User", frappe.session.user, ["first_name", "last_name"],as_dict=True)
	args = { "title":"Property Shared by  {0}" .format(frappe.session.user) , "property_data":share_property ,"first_name":user_name.get("first_name"), "last_name":user_name.get("last_name")}
	send_email(user, "Propshikari properties shared with you", "/templates/share_property_template.html", args)
	return True



def send_email(email, subject, template, args):
	frappe.sendmail(recipients=email, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))


@frappe.whitelist()
def get_sorted_list(resultset=None):
	final_list = json.loads(resultset)


@frappe.whitelist()
def get_agent_properties():
    pass

@frappe.whitelist()
def share_property_to_agents(email_id, comments, sid, user_id):
  comments_dict = {"email_id":email_id.split(','), "comments":eval(comments), "user_id":user_id, "sid":sid}
  return update_api.share_property_to_agents(comments_dict)

