import frappe

@frappe.whitelist()
def get_property_details(property_id):

	test_details = frappe.db.sql("""select name,attached_to_doctype,attached_to_name,file_url 
								from `tabFile Data`""",as_dict=1)

	return {
		'test_details': test_details
		# 'test_name': test_name[:re.search("\d",test_name).start()]
	}
