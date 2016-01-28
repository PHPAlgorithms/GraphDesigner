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

    //

    $(document).on('submit', 'form#graph-create-form', function () {
        $('button#graph-create').click();
        return false;
    })
    .on('focus', 'input#graph-name', function () {
        removeErrorClass($(this));
        _Container.hide('error');
    })
    .on('change', 'input#graph-name', function () {
        removeErrorClass($(this));
        _Container.hide('error');
    })
    .on('click', 'button#graph-create', function () {
        _Container.hide('success');

        var graphNameElement = $('#graph-name');
        var graphName = graphNameElement.val();
        if (graphName == '') {
            addErrorClass(graphNameElement);
            _Container.show('Empty graph name!', 'error');
        } else {
            if (/^[\w][\w\-\. ]*$/.test(graphName)) {
                removeErrorClass(graphNameElement);
                _Container.hide('error');

                if ($('.form-alert.alert-info').css('display') == 'none') {
                    _Container.show('Try to create...', 'info');

                    $.ajax({
                        url: '/add-new',
                        method: 'post',
                        dataType: 'json',
                        data: 'graph-name=' + graphName,
                        success: function (data) {
                            _Container.hide('info');

                            if (data.success == 1) {
                                _Container.show('Added <em>' + graphName + '</em> graph!', 'success');
                                refreshList();

                                setTimeout(function () {
                                    $('#popup-container').animate({ 'opacity': 0 }, 500, function () {
                                        $(this).remove();
                                    });
                                }, 1500);
                            } else {
                                addErrorClass(graphNameElement);

                                if (data.wrongName == 1) {
                                    _Container.show('Wrong graph name!', 'error');
                                } else if (data.emptyName == 1) {
                                    _Container.show('Empty graph name!', 'error');
                                } else if (data.graphExists == 1) {
                                    _Container.show('Graph with this name current exists!', 'error');
                                } else {
                                    _Container.show('Unknown error.', 'error');
                                }
                            }
                        },
                        error: function () {
                            _Container.hide('info');
                            addErrorClass(graphNameElement);
                            _Container.show('Unknown error.', 'error');
                        }
                    });
                }
            } else {
                addErrorClass(graphNameElement);
                _Container.show('Wrong graph name!', 'error');
            }
        }
        return false;
    })
    .on('click', '#popup-container #popup-close', function () {
        $('#popup-container').remove();

        return false;
    });

    //
    $(document).on('contextmenu', 'div#canvas-area', function () {
        _Action.toDefault();
        return false;
    })
    .on('click', 'div#canvas-area', function (event) {
        if (_Action.currentIs('addpoint')) {
            _Points.add(event.offsetX, event.offsetY);
        }
    });

    $('div#control-buttons div.btn-group div').on('click', function () {
        _Action.change($(this).attr('id'));
    });

    $('div#control-buttons div.btn#save-graph').on('click', function () {
        _Action.toDefault();

        $.ajax({
            data: 'graphName=' + $('#graphs-list .list-group .active').text() + '&points=' + _Points.toSave() + '&connections=' + _Connections.toSave(),
            dataType: 'json',
            url: '/save-graph',
            method: 'post',
            success: function (data) {
                if (data.success) {
                    
                } else {
                    
                }
            }
        });
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
