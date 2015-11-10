import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
import datetime
import json

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
def get_property(args=None):
	return {"data": [
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": [
        "/files/images (2).jpg"
      ],
      "creation_date": "15-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-15 18:38:23",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Residential",
      "property_id": "PROP-1442322503-65503",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "check for amenity change",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "Yes",
          "image": "",
          "name": "Swimming Pool"
        },
        {
          "status": "Yes",
          "image": "",
          "name": "Gym"
        }
      ],
      "location": "Baner pashan",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Immediate',
      "possession_date":"15-09-2015",
      "listed_by":'Owner',
      "transaction_type":'Resale',
      "description": "oh my god ;lk",
      "modified_date": "15-09-2015",
      "price": 2500000,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "Yes",
          "image": "",
          "name": "fridge"
        },
        {
          "status": "Yes",
          "image": "",
          "name": "Washing machine"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon.png",
      "no_of_floors": 50,
      "thumbnails": [
        "http://192.168.5.26:9080/files/PROP-1442322503-65503/thumbnail/PSPI-1442322503.26UGxDD.png"
      ],
      "modified_datetime": "2015-09-15 18:38:23",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 6715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "03-08-2015",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/images (1).jpg"],
      "creation_date": "14-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-14 19:55:06",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Commercial",
      "property_id": "PROP-1442240706-30042",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "check for amenity",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "Yes",
          "image": "",
          "name": "Swimming Pool"
        },
        {
          "status": "Yes",
          "image": "",
          "name": "Gym"
        }
      ],
      "location": "Baner",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Not Ready',
      "possession_date":"25-10-2015",
      "transaction_type":'Sale',
      "listed_by":'Owner',
      "description": "oh my god ;lk",
      "modified_date": "14-09-2015",
      "price": 7589088,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "Yes",
          "image": "",
          "name": "fridge"
        },
        {
          "status": "Yes",
          "image": "",
          "name": "Washing machine"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon.png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-14 19:55:06",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 6715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "25-10-2017",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/images.jpg"],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 21:31:24",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Commercial",
      "property_id": "PROP-1441814484-20360",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "This is latest",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Baner road",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Immediate',
      "possession_date":"15-10-2016",
      "listed_by":'Owner',
      "transaction_type":'New',
      "description": "retutrbb  ;k;lk",
      "modified_date": "09-09-2015",
      "price": 5589088,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon.png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 21:31:24",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 6715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "01-01-2015",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/Home-icon (1).png"],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 20:18:31",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Residential",
      "property_id": "PROP-1441810111-59618",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "Nulla ac enim.",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Baner road",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Immediate',
      "possession_date":"15-08-2016",
      "transaction_type":'Resale',
      "listed_by":'Owner',
      "description": "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante.",
      "modified_date": "09-09-2015",
      "price": 2000000,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon.png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 20:18:31",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 6715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "10-05-2015",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/Home-icon (1).png"],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 20:04:55",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Residential",
      "property_id": "PROP-1441809295-77050",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "Nulla ac enim.",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Baner road",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Not Ready',
      "possession_date":"15-09-2017",
      "transaction_type":'Sale',
      "listed_by":'Broker',
      "description": "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante.",
      "modified_date": "09-09-2015",
      "price": 2589088,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon (1).png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 20:04:55",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 6715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "12-06-2016",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/Home-icon.png"],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 20:04:43",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Residential",
      "property_id": "PROP-1441809283-11767",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "Nulla ac enim.",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Baner road",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Immediate',
      "possession_date":"30-09-2016",
      "transaction_type":'Resale',
      "listed_by":'Broker',
      "description": "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante.",
      "modified_date": "09-09-2015",
      "price": 100000000,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon (1).png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 20:04:43",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 6715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "03-08-2014",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/Home-icon.png"],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 15:08:09",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Residential",
      "property_id": "PROP-1441791489-75833",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "Nulla ac enim.",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Baner road",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Not Ready',
      "possession_date":"15-09-2018",
      "listed_by":'Owner',
      "transaction_type":'New',
      "description": "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante.",
      "modified_date": "09-09-2015",
      "price": 100000,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon (1).png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 15:08:09",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 6715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "03-08-2016",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/Home-icon.png"],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 13:17:47",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Residential",
      "property_id": "PROP-1441784867-57851",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "Nulla ac enim.",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Baner Road pune 411028",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Immediate',
      "possession_date":"15-09-2018",
      "transaction_type":'Resale',
      "listed_by":'Owner',
      "description": "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante.",
      "modified_date": "09-09-2015",
      "price": 3589088,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon (1).png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 13:17:47",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 8715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "03-10-2015",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/Home-icon.png"],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 13:17:31",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Residential",
      "property_id": "PROP-1441784851-95847",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "Nulla ac enim.",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Baner Road pune",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Immediate',
      "possession_date":"12-07-2025",
      "listed_by":'Broker',
      "transaction_type":'Sale',
      "description": "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante.",
      "modified_date": "09-09-2015",
      "price": 4589088,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon (1).png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 13:17:31",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 8715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "03-10-2015",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": ["/files/Home-icon.png"],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 13:16:48",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Commercial",
      "property_id": "PROP-1441784808-20872",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "Nulla ac enim.",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Baner Road",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Immediate',
      "possession_date":"11-09-2016",
      "transaction_type":'Resale',
      "listed_by":'Owner',
      "description": "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante.",
      "modified_date": "09-09-2015",
      "price": 5689088,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon (1).png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 13:16:48",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 38715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "15-08-2015",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    },
    {
      "agent_name": "Kimberly",
      "property_subtype": "Family Home",
      "project_by": "Gabvine",
      "pincode": 55827,
      "full_size_images": [],
      "creation_date": "09-09-2015",
      "percent_completion": 73,
      "tag": [
        "Discounted"
      ],
      "posted_datetime": "2015-09-09 13:16:09",
      "project_type": "Commercial",
      "price_per_sq_ft": 66811,
      "operation": "Rent",
      "property_type": "Commercial",
      "property_id": "PROP-1441784769-25170",
      "listed_by": "owner",
      "city": "Trenton",
      "property_title": "Nulla ac enim.",
      "agent_no": 13763096457893,
      "modified_by": "1441019077-3791",
      "no_of_bathroom": 2,
      "maintainance_charges": 5837430188,
      "created_by": "1441019077-3791",
      "property_ownership": "Christopher Perry",
      "society_name": "Roxbury",
      "state": "New Jersey",
      "amenities": [
        {
          "status": "no",
          "image": "",
          "name": "swimming pool"
        },
        {
          "status": "yes",
          "image": "",
          "name": "garden"
        },
        {
          "status": "yes",
          "image": "",
          "name": "gym"
        }
      ],
      "location": "Katraj",
      "project_id": "12ybfcRYR4DsBN17BFV8sjVf2MhFyBoeMG",
      "security_deposit": 636717295514,
      "possession": 128,
      "possession_status":'Immediate',
      "possession_date":"10-09-2018",
      "transaction_type":'Sale',
      "listed_by":'Owner',
      "description": "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante.",
      "modified_date": "09-09-2015",
      "price": 5200000,
      "contact_no": 75433271183958793,
      "property_age": 87,
      "address": "8 Graceland Pass",
      "flat_facilities": [
        {
          "status": "no",
          "image": "",
          "name": "fridge"
        }
      ],
      "furnishing_type": "Yes",
      "project_title": "Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.",
      "status": "Active",
      "property_photo": "/files/Home-icon (1).png",
      "no_of_floors": 50,
      "thumbnails": [],
      "modified_datetime": "2015-09-09 13:16:09",
      "posted_by": "1441019077-3791",
      "elapsed_time": "-10 month ago",
      "floor_no": 3,
      "carpet_area": 28715,
      "distance_from_imp_locations": {
        "airport": 78,
        "railway_station": 70,
        "central_bus_stand": 28
      },
      "posting_date": "03-08-2015",
      "contact_person": "Christopher",
      "user_email": "geetanjali.s@indictranstech.com"
    }
  ]
  }


