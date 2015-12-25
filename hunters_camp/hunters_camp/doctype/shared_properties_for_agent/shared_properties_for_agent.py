# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class SharedPropertiesForAgent(Document):
	pass

def get_permission_query_conditions(user):
	if not user: user = frappe.session.user
	"""
		Filter condition for user
	"""
	#pass
	if not user == 'Administrator':
		return """(`tabShared Properties For Agent`.user ='{0}')""".format(user)