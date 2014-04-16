/**
* Heavily based on Mike Bostocks work: http://bost.ocks.org/mike/leaflet/
* @param  {[type]} window    [description]
* @param  {[type]} document  [description]
* @param  {[type]} L         [description]
* @param  {[type]} undefined [description]
* @return {[type]}           [description]
*/
(function (window, document, L, undefined) {
	'use strict';

	/* create leaflet map */
	var map = L.map('map', {
		center: [44.8997, -0.8157],
		zoom: 9
	});

	/* add default stamen tile layer */
	new L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png', {
		minZoom: 0,
		maxZoom: 18,
		attribution: 'Map data © <a href="http://www.openstreetmap.org">OpenStreetMap contributors</a>'
	}).addTo(map);

	var svg = d3.select(map.getPanes().overlayPane).append('svg'),
	g = svg.append('g').attr('class', 'leaflet-zoom-hide');

	d3.json('scripts/gironde-epci.topo.json', function (collection) {
		var bounds = d3.geo.bounds(topojson.feature(collection, collection.objects['gironde-epci.geo']));
		var path = d3.geo.path().projection(projectPoint);


		var feature = g.selectAll('.entity')
			.data(topojson.feature(collection, collection.objects['gironde-epci.geo']).features)
			.enter()
				.append('path')
				.attr('class', 'entity')
			;
		var label = g.selectAll('.entity-label')
			.data(topojson.feature(collection, collection.objects['gironde-epci.geo']).features)
			.enter()
				.append('text')
				.attr('class', 'entity-label')
			;

		map.on('viewreset', reset);
		reset();

		// Reposition the SVG to cover the features.
		function reset() {
			var bottomLeft = projectPoint(bounds[0]),
				topRight = projectPoint(bounds[1]);

			svg.attr('width', topRight[0] - bottomLeft[0])
				.attr('height', bottomLeft[1] - topRight[1])
				.style('margin-left', bottomLeft[0] + 'px')
				.style('margin-top', topRight[1] + 'px');

			g.attr('transform', 'translate(' + -bottomLeft[0] + ',' + -topRight[1] + ')');
			
			feature.attr('d', path)
				.attr('class', function (d) { return 'entity-label ' + idify(d.id); })
			;

			label.attr('id', function (d) { return idify(d.id); })
				.attr('class', function (d) { return 'entity-label ' + idify(d.id); })
				.attr('transform', function (d) { return 'translate(' + path.centroid(d) + ')'; })
				.attr('x', -20)
				.attr('dy', '.35em')
				.text(function (d) { return toProperCase(d.id); })
			;
		}


		// Use Leaflet to implement a D3 geographic projection.
		function projectPoint(x) {
			var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
			return [point.x, point.y];
		}
	});
}(window, document, L));