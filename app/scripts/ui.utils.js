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

$('input.n0').change(function () {
    $('circle.n0').toggleClass('highlight').attr('r', 5);
});
$('input.n1').change(function () {
    $('circle.n1').toggleClass('highlight').attr('r', 5);
});
$('input.n2').change(function () {
    $('circle.n2').toggleClass('highlight').attr('r', 5);
});