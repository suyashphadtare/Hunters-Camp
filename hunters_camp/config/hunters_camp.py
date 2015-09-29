from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Masters"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "State",
					"description": _("State Master"),
				},
				{
					"type": "doctype",
					"name": "City",
					"description": _("Cities in State"),
				},
				{
					"type": "doctype",
					"name": "Location",
					"description": _("Location Master"),
				},
				{
					"type": "doctype",
					"name": "Property Type",
					"description": _("Types of Properties"),
				},
				{
					"type": "doctype",
					"name": "Property Subtype",
					"description": _("Sub Types of Properties"),
				},
				{
					"type": "doctype",
					"name": "Amenities",
					"description": _("Amenities for property"),
				},
				{
					"type": "doctype",
					"name": "Flat Facilities",
					"description": _("Facilities of Flats"),
				},
				{
					"type": "doctype",
					"name": "Area",
					"description": _("Location / Area"),
				}
				
			]
		},
		{
			"label": _("Document"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Enquiry",
					"description": _("Lead/Customer enquiry form"),
				},
				{
					"type": "doctype",
					"name": "Lead Management",
					"description": _("Allocation of lead/customer to consultant"),
				},
				{
					"type": "doctype",
					"name": "Site Visit",
					"description": _("Sales Executive Visit Details"),
				},
				{
					"type": "doctype",
					"name": "ACM Visit",
					"description": _("ACM Visit Details"),
				},
			]
		},

		{
			"label": _("Tools"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "property",
					"label": _("Property Serach"),
					"icon": "icon-bar-chart",
				},
			]
		},
	]
