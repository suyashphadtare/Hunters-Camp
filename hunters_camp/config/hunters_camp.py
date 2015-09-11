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
	]
