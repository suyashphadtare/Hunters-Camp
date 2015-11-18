cur_frm.fields_dict['property_subtype'].get_query = function  (doc) {
		return{
			filters:{
				"property_type":doc.property_type
			}
		}
}