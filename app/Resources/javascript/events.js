$(document).ready(function () {
    $(document).on('click', '#add-new', function () {
        if ($('#popup-container').length == 0) {
            $.ajax({
                url: '/create-new',
                method: 'post',
                success: function (data) {
                    if ($('#popup-container').length == 0) {
                        $('body').append(data);
                    }
                }
            });
        }
        return false;
    });

    $(document).on('click', '#graphs-list .list-group-item:not(.active)', function () {
        $('#graphs-list .list-group-item.active').removeClass('active');
        $(this).addClass('active');

        _Stage.reload($('#graphs-list .list-group .active').text());

        $('#choose-graph').css('display', 'none');
        $('#graph-designer').css('display', 'block');
    })
    .on('click', '#graphs-list .list-group-item.active', function () {
        $(this).removeClass('active');

        $('#choose-graph').css('display', 'block');
        $('#graph-designer').css('display', 'none');
    });
});

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
