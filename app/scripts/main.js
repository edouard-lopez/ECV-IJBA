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

		/**
		 * List of centres
		 * @type {Array}
		 */
		var _centres = [], _links = [];
	flowApp(_centres, _links);
	mapApp(_centres, _links);
}(window, document, L));
