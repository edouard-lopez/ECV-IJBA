'use strict';
var $;

function toggleCentre(type) {
    $('.centre.'+type+', .centre.to-'+type).toggleClass('highlight').attr('r', 5);
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
$('input.co2').change(function () {
	$('text.co2').toggleClass('show');
});
$('input.dist').change(function () {
	$('text.dist').toggleClass('show');
});

$('input').change(function () {
	var type = $(this).attr('id').replace('centre-', '');
	toggleCentre(type);
	toggleRoute(type, $(this).prop('checked'));
});

