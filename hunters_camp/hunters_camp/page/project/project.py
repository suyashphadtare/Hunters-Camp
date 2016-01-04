import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months, validate_email_add
import datetime
import json
from collections import Counter





@frappe.whitelist()
def build_data_to_search_with_location_names(data):
  project_data = json.loads(data)
  if project_data.get("location"):
    location_names = project_data.get("location").split(',')
    condition = ",".join('"{0}"'.format(loc) for loc in location_names)
    area_list = frappe.db.sql(""" select * from 
      `tabArea` where area in ({0}) and city_name='{1}'""".format(condition,project_data.get("city")), as_dict=True)
    if area_list:
      project_data["location"] = ",".join([ area.get("name") for area in area_list ])
  from propshikari.versions.v1 import search_project
  return search_project(data=json.dumps(project_data))