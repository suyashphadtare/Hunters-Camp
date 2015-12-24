from __future__ import unicode_literals
import frappe
from frappe.core.doctype.user.user import STANDARD_USERS
from frappe.utils import cint, cstr, get_site_path
import datetime


@frappe.whitelist(allow_guest=True)
def get_sms_template(name,args):
	import re
	template = frappe.db.get_value("Message Templates",{"name":name},"message_body")
	tempStr = ""
	if template:
		for key in re.findall(r"(?<=\[)(.*?)(?=\])",template):
			old = "[%s]"%key
			new = cstr(args.get(key))
			template = template.replace(old, new)
		return template

"""
msg = get_sms_template("delink",{"phr_name":args['person_firstname']})
	if user.contact:
		rec_list = []
		rec_list.append(user.contact)
		send_sms(rec_list,msg=msg)

"""