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

	/**
	 * Object to store svg:element property for future use
	 */
	var props = {
		circle: {
			default: 2,
			active: 5
		}
	}

	/**
	 * Map type of centre index to name
	 * @type {Array}
	 */
	var typeCentre = [ 'epci', 'transfert', 'traitement' ];

	/**
	 * 
	 */
	var links = [];

	/* add default stamen tile layer */
	new L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png', {
		minZoom: 0,
		maxZoom: 18,
		attribution: 'Map data © <a href="http://www.openstreetmap.org">OpenStreetMap contributors</a>'
	}).addTo(map);
    
	var svg				= d3.select(map.getPanes().overlayPane).append('svg'),
		g				= svg.append('g').attr('class', 'leaflet-zoom-hide'),
		marker 			= g.append('marker')
								.attr('id', 'arw')
								.attr('viewBox',"0 0 10 10")
								.attr('refX', 0)
						 	    .attr('refY', 5)
						 	    .attr('markerUnits','strokeWidth')
						 	    .attr('markerWidth',"4").attr('markerHeight',"3")
						 	    .attr('orient',"auto")
							.append('path')
								.attr('d', 'M 0 0 L 10 5 L 0 10 z'),
		entities		= g.append('g').attr('id', 'entities'),
		entitiesLabels	= g.append('g').attr('id', 'entities-labels'),
		centres			= g.append('g').attr('id', 'centres'),
		routes			= g.append('g').attr('id', 'routes')
	;

	var path, entity, label, centre;

	d3.json('scripts/gironde-epci.topo.json', function (dataset) {
		var bounds = d3.geo.bounds(topojson.feature(dataset, dataset.objects['gironde-epci.geo']));
		path = d3.geo.path().projection(projectPoint);


		entity = entities.selectAll('.entity')
			.data(topojson.feature(dataset, dataset.objects['gironde-epci.geo']).features)
			.enter()
				.append('path')
				.attr('class', 'entity')
			;
		label = entitiesLabels.selectAll('.entity-label')
			.data(topojson.feature(dataset, dataset.objects['gironde-epci.geo']).features)
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
			
			entity.attr('d', path)
				.attr('class', function (d) { 
					return 'entity ' + getCentres(idify(d.id)).join(' '); })
				.on('mouseover', function (d) {
					// reset style on others elements
					d3.selectAll('.entity').classed('active', false);
					d3.selectAll('circle') 
						.classed('highlight', false)
						.attr('r', props.circle.default)
					d3.selectAll('.entity-label').classed('show', false);
					d3.selectAll('.route')
						.classed('show', false)
						.attr('marker-end', '');
					// apply style to element(s)
					d3.select(this).classed('active', true);
					d3.selectAll('circle.' + idify(d.id))
						.classed('highlight', true)
						.attr('r', props.circle.active)
					;
					d3.selectAll('.entity-label.' + idify(d.id)).classed('show', true);
					d3.selectAll('.route.' + idify(d.id))
						.classed('show', true)
						.attr('marker-end', 'url(#arw)');
				})
			;

			label.attr('id', function (d) { return idify(d.id); })
				.attr('class', function (d) { return 'entity-label ' + idify(d.id); })
				.attr('transform', function (d) { 
					return 'translate(' + path.centroid(d) + ')'; })
				.attr('x', -20)
				.attr('dy', '.35em')
				.text(function (d) { return toProperCase(d.id); })
			;
		}
	});


	d3.csv('scripts/routes-dechets.csv', function (error, dataset) {
		centre = centres.selectAll('.centre')
			.data(dataset)
			.enter()
			.append('g')
		;
		centre
			.on('mouseover', function (d) {
				d3.select(this).attr('r', props.circle.active);
				// reset style on others elements
				d3.selectAll('.route').classed('show', false);
				// apply style to element(s)
				d3.selectAll('.route.' + idify(d.depart)).classed('show', true);
			})
			.on('mouseout', function () {
				d3.selectAll('.route').classed('show', false);
			})
		var centrePlace = centre.append('circle');
		var centreLabel = centre.append('text');
		;

		// Standard enter / update 
		var routePath = routes.selectAll('.route')
			.data(dataset)
			.enter()
			.append('path')
		;

		var co2Group = routes.append('g').attr('id', 'co2')
		var co2 = co2Group.selectAll('.co2')
			.data(dataset)
			.enter()
			.append('text')

		var distGroup = routes.append('g').attr('id', 'dist')
		var dist = distGroup.selectAll('.dist')
			.data(dataset)
			.enter()
			.append('text')
		;

		function attach(d) {
			var coordDepart = [ d.lon_depart, d.lat_depart ];
			var coordArrivee = [ d.lon_arrivee, d.lat_arrivee ];
			return 'translate(' + path.centroid({type: 'LineString', coordinates: [coordDepart, coordArrivee ] }) + ')'; 
		}

		map.on('viewreset', reset);
		reset();

		function reset() {
			centre
				.attr('class', function (d) { 
					return ' centre ' + idify(d.depart) 
						 + ' from-' + typeCentre[d.niv_depart] 
						 + ' to-' + typeCentre[d.niv_arrivee];
				})
			;
			centrePlace
					.attr('r', props.circle.default)
					.attr('cx', function (d) { return projectDepart(d)[0]; })
					.attr('cy', function (d) { return projectDepart(d)[1]; })
					.attr('title', function (d) { return idify(d.depart); })
			;
			centreLabel
				.attr('class', 'label')
				.attr('transform', function (d) { 
					return 'translate('
						+ projectDepart(d)[0]
						+ ', '
						+ projectDepart(d)[1]
					 	+ ')'; 
				})
				.text(function (d) { return idify(d.depart); })
			;

			routePath.attr('d', function (d) {
					var coordDepart = [ d.lon_depart, d.lat_depart ];
					var coordArrivee = [ d.lon_arrivee, d.lat_arrivee ];
					return path({
						type: 'LineString',
						coordinates: [
							coordDepart,
							coordArrivee
						]
					});
				})
				.attr('class', function (d) { 
					return ' route ' + idify(d.depart) + ' ' + idify(d.arrivee) 
						 + ' from-' + typeCentre[d.niv_depart] 
						 + ' to-' + typeCentre[d.niv_arrivee]; 
				})
			;

			co2.attr('class', 'co2')
				.attr('y', -5)
				.attr('dy', '.35em')
				.attr('transform', function (d) {return attach(d) })
				.text(function (d) { return d.co2+'kg'; })

			dist.attr('class', 'dist')
				.attr('y', 5)
				.attr('dy', '.35em')
				.attr('transform', function (d) {return attach(d) })
				.text(function (d) { return d.dist+'km'; })

		}
	});





	/**
	 * Utility to project a depart point
	 */
	function projectDepart(d) { return projectPoint([Number(d.lon_depart), Number(d.lat_depart)]); }

	// Use Leaflet to implement a D3 geographic projection.
	function projectPoint(x) {
		var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
		return [point.x, point.y];
	}

	// Use Leaflet to implement a D3 geographic projection.
	function pointToProjection(p) {
		var projection = map.layerPointToLatLng(new L.point(p[0], p[1]));
		return [projection.lat, projection.lng];
	}


}(window, document, L));