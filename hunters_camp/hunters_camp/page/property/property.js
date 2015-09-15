frappe.pages['property'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Property',
		single_column: true
	});
	console.log(frappe.route_options)

	$(wrapper).find(".layout-main").html("<div class='user-settings'></div>\
	<table class='table table-condensed'>\
	<tr><td colspan='2'><div id= 'test_cerficate'></div></td></tr>\
	<tr><td style='width:30%;'><div id= 'test'></div></td>\
	<td style='width:70%;'><div id= 'test_results'></div><div id= 'test_results_details'></div></td></tr>\
	</table>");
	wrapper.property = new Property(wrapper);
}

Property = Class.extend({

	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".user-settings");
		this.filters = {};
		this.make();
	},
	make:function(){
		var me = this;
		me.filters.user = me.wrapper.page.add_field({
					fieldname: "property_type",
					label: __("Property Type"),
					fieldtype: "Link",
					options: "Property Type"
		});

		me.filters.user = me.wrapper.page.add_field({
					fieldname: "property_subtype",
					label: __("Property Subtype"),
					fieldtype: "Link",
					options: "Property Subtype"
		});

		me.filters.user = me.wrapper.page.add_field({
					fieldname: "budget_min",
					label: __("Budget Minimum"),
					fieldtype: "Data"
		});

		me.filters.user = me.wrapper.page.add_field({
					fieldname: "budget_max",
					label: __("Budget Maximum"),
					fieldtype: "Data"
		});

		me.filters.user = me.wrapper.page.add_field({
					fieldname: "area_min",
					label: __("Area Minimum"),
					fieldtype: "Data"
		});

		me.filters.user = me.wrapper.page.add_field({
					fieldname: "area_max",
					label: __("Area Maximum"),
					fieldtype: "Data"
		});

		me.render_property()
	},
	render_property: function(){
		var me = this;
		this.test_names = $(this.wrapper).find('#test');
		test_list = get_property_list();

		this.table = $("<table id='test_name_list' class='table table-bordered'>\
			<thead><tr></tr></thead>\
			<tbody></tbody>\
		</table>").appendTo(this.test_names);

		$.each(test_list, 
			function(i, test) {
			var row = $("<tr id="+i+">").appendTo(me.table.find("tbody"));
			$("<td>").html(test+'<span id='+test.replace(/[ ]/g,'_')+' \
			style ="display:inline-block;margin-left:10px;color:white;text-align:center;width:20px;background-color:#FF5252;border-radius: 50%;"></span>'+'<span class="pull-right">\
				<i class="icon-chevron-right"></i></span>').appendTo(row);
		});

		this.table.find("tr").click(function(event){
			$("#test_name_list .active").removeClass('active')
			$(this).addClass("active");
			me.render_property_details($(this)[0].innerText)
		})
	},

	render_property_details:function(property_id){
		var me = this;
		frappe.call({
			method:"hunters_camp.hunters_camp.page.property.property.get_property_details",
			args:{"property_id":property_id},
			callback: function(r){
				me.render_resultset(r.message.test_details, property_id)
			}
		})
	},

	render_resultset:function(test_details,property_id){
		this.test_results = $(this.wrapper).find('#test_results');
		this.test_results.empty();
		this.test_results.show();
		
		$(this.wrapper).find('#test_results_details').hide();
		var me = this;

		columns = [[frappe._("Property Name"), 20], [frappe._("Area"),20],[frappe._("Location"),20],[frappe._("Image"),40],[frappe._("Select"),10]];

		this.table = $("<table id='sample' class='table table-bordered'>\
			<thead><tr></tr></thead>\
			<tbody></tbody>\
		</table>").appendTo(this.test_results);

		$.each(columns, 
			function(i, col) {
			$("<th>").html(col[0]).css("width", col[1]+"px")
				.appendTo(me.table.find("thead tr"));
		});

		console.log(test_details)
		$.each(test_details, function(i){
			console.log(test_details[i]['file_url'])
			$(me.table).find("tbody").append('<tr width ="100%"><td>'+test_details[i]['name']+'</td><td>'+test_details[i]['attached_to_doctype']+'</td><td>'+test_details[i]['attached_to_name']+'</td><td>'+'<img src='+test_details[i]['file_url']+' width ="80" height ="80">'+'</td><td width="10%"><input type="Checkbox" class="check_box"></td></tr>')
		})
		
	},

})

var get_property_list = function(){

	return ['Property ID','PROO001', 'PROO0002','PROO0003' ,'PROO0004','PROO005']
}