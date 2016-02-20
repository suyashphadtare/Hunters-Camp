from __future__ import unicode_literals
import frappe
import frappe.utils
import json
from frappe import _
from propshikari.propshikari.elastic_controller import ElasticSearchController
from propshikari.propshikari.propshikari_api import get_total_owner_count

@frappe.whitelist()
def get_data():
	data = {}
	data["leads"] = get_leads()
	data["properties"] = get_properties()
	data["brokers"] = get_brokers()
	data["builders"] = get_builders()
	data["residential"] = get_residentail_properties_count()
	data["contacted"] = get_contacted_count()
	data["commercial"] = get_commercial_properties_count()
	data["rented"] = get_rented_properties_count()
	data["land"] = get_land_properties_count()
	data["owner_count"] = get_total_owner_count()
	return data

def get_leads():
	return frappe.db.sql("""select count(*) from `tabLead`""",as_list=1)[0][0]  

def get_properties():
	es = ElasticSearchController()
	search_query = { "query": { "match_all":{} } }
	response_data, total_records = es.search_document(["property"], search_query, 1)
	return total_records

def get_brokers():
	return frappe.db.sql("""select count(*) from tabUserRole user_role, tabUser user
			where user_role.role='Agent'
				and user.docstatus<2
				and user.enabled=1
				and user_role.parent = user.name
			and user_role.parent not in ('Administrator') limit 1""",as_list=1)[0][0]

def get_builders():
	return frappe.db.sql("""select count(*) from tabUserRole user_role, tabUser user
			where user_role.role='Builder'
				and user.docstatus<2
				and user.enabled=1
				and user_role.parent = user.name
			and user_role.parent not in ('Administrator') limit 1""",as_list=1)[0][0]
# added by arpit
def owners():
	return frappe.db.sql("""select count(*) from tabUserRole user_role, tabUser user
			where user_role.role=''
				and user.docstatus<2
				and user.enabled=1
				and user_role.parent = user.name
			and user_role.parent not in ('Administrator') limit 1""",as_list=1)[0][0]

def get_residentail_properties_count():
	es = ElasticSearchController()
	search_query = { "query": { "match":{"property_type":"Residential"} } }
	response_data, total_records = es.search_document(["property"], search_query, 1)
	return total_records

def get_contacted_count():
	return frappe.db.sql("""select count(*) from `tabShow Contact Property`""",as_list=1)[0][0]

def get_commercial_properties_count():
	es = ElasticSearchController()
	search_query = { "query": { "match":{"property_type":"Commercial"} } }
	response_data, total_records = es.search_document(["property"], search_query, 1)
	return total_records

def get_rented_properties_count():
	es = ElasticSearchController()
	search_query = { "query": { "match":{"operation":"Rent"} } }
	response_data, total_records = es.search_document(["property"], search_query, 1)
	return total_records

def get_land_properties_count():
	es = ElasticSearchController()
	search_query = { "query": { "match":{"property_type":"Zameen"} } }
	response_data, total_records = es.search_document(["property"], search_query, 1)
	return total_records


