'use strict';
var $;
var _default = {
	'emission': '-',
	'qte': '-',
	'dist': '-'
};

function toggleCentre(type) {
	var selector = ['.from-', ', .to-', ''].join(type + ' circle');
	$(selector).attr('r', function (idx, old) {return !old; })
	.toggleClass('highlight')
	;
}

/**
 * Toggle visibility of given route type. If 'type' is 'route' then display all types
 * @param  {[type]} type  of routes to display.
 * @param  {[type]} state of input (checked or not)
 */
function toggleRoute(type, state) {
	var routeSet;
	routeSet = (type === 'route' ? $('.route')
					: $('.route.from-' + type + ', .route.to-' + type)
				);

	routeSet
		.attr('marker-mid', function (i, val) {return state ? 'url(#arw-mid)' : ''; })
		.attr('marker-end', function (i, val) {return state ? 'url(#arw-end)' : ''; })
		.toggleClass('show')
	;
}

/**
 * Sum values from 'selector' items list
 * @param  {string} selector selector
 * @return {int}             sum
*/
function sumData(selector) {
	var sum = 0;
	var formatNumber = d3.format(',.0f');

	$(selector).each(function () {
		sum += +$(this).text().replace(/(k[gm]| t)/i, '');
	});
	return formatNumber(Math.round(sum)).replace(/,/, ' ');
}


function updateTotal() {

}

$('input.route').change(function () {
	var type = $(this).attr('id').replace('centre-', '');
	$('path.route').toggleClass('show');
	toggleRoute(type, $(this).prop('checked'));
	$('#centre-epci, #centre-transfert, #centre-traitement')
		.attr('disabled', function (idx, old) {
			return !old;
		});
});
$('input.emission').change(function () {
	$('text.emission').toggleClass('show');
	$('.emission .value').text(function (idx, old) {
		return (old === _default.emission ? sumData('svg text.emission'): _default.emission);
	});
});
$('input.qte').change(function () {
	$('text.qte').toggleClass('show');
	$('.qte .value').text(function (idx, old) {
		return (old === _default.qte ? sumData('svg text.qte'): _default.qte);
	});
});
$('input.dist').change(function () {
	$('text.dist').toggleClass('show');
	$('.dist .value').text(function (idx, old) {
		return (old === _default.dist ? sumData('svg text.dist'): _default.dist);
	});
});

$('input').change(function () {
	var type = $(this).attr('id').replace('centre-', '');
	toggleCentre(type);
	toggleRoute(type, $(this).prop('checked'));
});

