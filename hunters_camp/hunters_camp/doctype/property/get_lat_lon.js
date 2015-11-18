

GoogleMap = Class.extend({
	init:function(map_div, search_box_div) {
		this.map_div = map_div
		this.search_box_div = search_box_div
		this.make_google_map()
	},
	make_google_map:function(){
		this.map = new google.maps.Map(this.map_div, {
		    zoom: 1,
		    center: new google.maps.LatLng(35.137879, -82.836914),
		    mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		this.make_google_marker()
	},
	make_google_marker:function(){
		this.myMarker = new google.maps.Marker({
		    position: new google.maps.LatLng(47.651968, 9.478485),
		    draggable: true
		});
		this.map.setCenter(this.myMarker.position);
		this.myMarker.setMap(this.map);
		this.make_location_search_box()
	},
	make_location_search_box:function(){
		var me = this
		this.searchBox = new google.maps.places.SearchBox(this.search_box_div);
  		this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.search_box_div);
  		this.map.addListener('bounds_changed', function() {
    		me.searchBox.setBounds(me.map.getBounds());
  		});
  		this.listen_search_box_event()
	},
	listen_search_box_event:function(){
		var me = this
		this.markers = [];
		  
		  // Listen for the event fired when the user selects a prediction and retrieve
		  // more details for that place.
		this.searchBox.addListener('places_changed', function() {
		    var places = me.searchBox.getPlaces();

		    if (places.length == 0) {
		      return;
		    }

		    // Clear out the old markers.
		    me.markers.forEach(function(marker) {
		      marker.setMap(null);
		    });
		    me.markers = [];
		    // For each place, get the icon, name and location.
		    var bounds = new google.maps.LatLngBounds();
		    places.forEach(function(place) {
				var icon = {
					url: place.icon,
					size: new google.maps.Size(71, 71),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(17, 34),
					scaledSize: new google.maps.Size(25, 25)
				};

		      	// Create a marker for each place.
			    me.myMarker.map = me.map,
		        me.myMarker.icon =  icon,
		        me.myMarker.title =  place.name,
		        me.myMarker.position =  place.geometry.location
			    me.markers.push(me.myMarker);
			    if (place.geometry.viewport) {
			        // Only geocodes have viewport.
			        bounds.union(place.geometry.viewport);
			    } else {
			        bounds.extend(place.geometry.location);
			    }

		    });
		    me.map.setCenter(me.myMarker.position);
			me.myMarker.setMap(me.map);
			me.map.fitBounds(bounds);
		});
	}

})




GeoCodeManager = Class.extend({
	init:function(gmap, frm){
		this.gmap = gmap
		this.frm = frm
		this.listen_marker_dragstart()
		this.listen_marker_dragend()
	},
	listen_marker_dragstart:function(){
		google.maps.event.addListener(this.gmap.myMarker, 'dragstart', function (evt) {
			console.log("drag started")
		});
	},
	listen_marker_dragend:function(){
		var me = this
		google.maps.event.addListener(this.gmap.myMarker, 'dragend', function (evt) {
    		me.frm.doc.geo_location_lat = evt.latLng.lat().toFixed(5)
    		me.frm.doc.geo_location_lon = evt.latLng.lng().toFixed(5)
    		refresh_field(["geo_location_lat", "geo_location_lon"])
		});
	}

})