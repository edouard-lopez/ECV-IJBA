var $;

$('input.route').change(function () {
    $('path.route').toggleClass('highlight');
});

$('input.centre').change(function () {
    $('circle.centre').toggleClass('highlight').attr('r', 5);
});