$(document).on('click', 'div#distance-box input[type="submit"]', function () {
    var textval = $(this).prev('input')
                         .val();
    textval = parseInt(textval);

    if ((textval % 1 === 0) && (textval > 0)) {
        _Connection.setDistance(textval);
        _Connections.add(_Connection);

        $(this).parent()
               .remove();
    } else {
        alert('Write a number!');
    }
});
