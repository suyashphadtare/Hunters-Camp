import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months, validate_email_add
import datetime
import json
from collections import Counter
import propshikari.propshikari.property_update_api as update_api
import propshikari.propshikari.propshikari_api as api



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
  user = check_for_duplicate_email_id(user)
  user_name = frappe.db.get_value("User", frappe.session.user, ["first_name", "last_name"],as_dict=True)
  args = { "title":"Property Shared by  {0}" .format(frappe.session.user) , "property_data":share_property ,"first_name":user_name.get("first_name"), "last_name":user_name.get("last_name")}
  send_email(user, "Propshikari properties shared with you", "/templates/share_property_template.html", args)
  return True

def check_for_duplicate_email_id(user):
  email_ids = user.split(',')
  email_ids = [email for email in email_ids if email]
  if email_ids:
    email_count = Counter(email_ids)
    for email_id, count in email_count.items():
      validate_email_add(email_id, True)
      if count > 1:
        frappe.throw("Email Id {0} has been added {1} times".format(email_id, count))
    return email_ids
  else:
    frappe.throw("Email Id is mandatory field")      




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



@frappe.whitelist()
def get_amenities(property_type):
  amenities = frappe.db.sql(" select amenity_name from `tabAmenities` where property_type='{0}' ".format(property_type), as_list=1)
  subtype_options = frappe.db.sql(" select property_subtype_option from `tabProperty Subtype Option` where property_type='{0}' ".format(property_type), as_list=1)
  response_dict = {}
  response_dict["amenities"] = [amenity[0] for amenity in amenities if amenity]
  response_dict["subtype_options"] = [option[0] for option in subtype_options if option]
  return response_dict


@frappe.whitelist()
def get_location_list(city=None):
  if city:
    location = frappe.db.sql("""select name as location_id,area as location_name, city_name from 
      `tabArea` where city_name='{0}'""".format(city),as_dict=1)
  else:
    location = frappe.db.sql("""select name as location_id,area as location_name, city_name from 
      `tabArea`""".format(city),as_dict=1)
  
  return location

@frappe.whitelist()
def search_property_with_advanced_criteria(property_dict):
  property_dict = json.loads(property_dict)
  budget_mapper =  {"0":0, "25Lac":2500000, "50Lac":5000000, "75Lac":7500000, "1Cr":10000000, 
                    "2Cr":20000000, "3Cr":30000000, "4Cr":40000000, "5Cr":50000000, "10Cr":100000000}
  amenities_list = [amenity for amenity in property_dict.get("amenities","").split(',') if amenity]        
  property_dict["amenities"] = amenities_list
  property_dict["min_budget"] = budget_mapper.get(property_dict.get("min_budget", ""),0)
  property_dict["max_budget"] = budget_mapper.get(property_dict.get("max_budget", ""),0)
  property_dict["records_per_page"] = 10
  property_dict["page_number"] = 1
  property_dict["request_source"] = "Hunterscamp"
  property_dict["min_area"] = int(property_dict.get("min_area",0))
  property_dict["max_area"] = int(property_dict.get("max_area",0))
  print property_dict
  get_location_subtype_options(property_dict)
  try:
    return api.search_property(json.dumps(property_dict))
  except Exception,e:
    frappe.throw(e)


def get_location_subtype_options(property_dict):
  if property_dict["location"]:
    property_dict["location"] = get_location_for_adv_search(property_dict)
  property_dict["property_subtype_option"] = ','.join([option for option in property_dict.get("property_subtype_option","").split(',') if option])  

def get_location_for_adv_search(property_dict):
  location_names = property_dict.get("location").split(',')
  condition = ",".join('"{0}"'.format(loc) for loc in location_names)
  area_list = frappe.db.sql(""" select * from 
    `tabArea` where area in ({0}) and city_name='{1}'""".format(condition,property_dict.get("city")), as_dict=True)
  if area_list:
    return ",".join([ area.get("name") for area in area_list ])
  else:
    return ""
       



@frappe.whitelist()
def build_data_to_search_with_location_names(data):
  property_data = json.loads(data)
  if property_data.get("location"):
    location_names = property_data.get("location").split(',')
    condition = ",".join('"{0}"'.format(loc) for loc in location_names)
    area_list = frappe.db.sql(""" select * from 
      `tabArea` where area in ({0}) and city_name='{1}'""".format(condition,property_data.get("city")), as_dict=True)
    if area_list:
      property_data["location"] = ",".join([ area.get("name") for area in area_list ])
  from propshikari.versions.v1 import search_property
  return search_property(data=json.dumps(property_data))
    