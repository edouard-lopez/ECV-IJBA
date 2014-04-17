var $;

$('input.route').change(function () {
    $('path.route').toggleClass('highlight');
});
$('input.co2').change(function () {
    $('text.co2').toggleClass('highlight');
});
$('input.dist').change(function () {
    $('text.dist').toggleClass('highlight');
});

$('input.centre').change(function () {
    $('circle.centre').toggleClass('highlight').attr('r', 5);
});