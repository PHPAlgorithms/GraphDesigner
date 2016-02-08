$(document).ready(function () {
    $(document).on('click', 'button#add-new', function () {
        Popup.open('create-new');
        return false;
    })
    .on('click', 'div#graphs-list a.list-group-item:not(.active)', function () {
        $('div#graphs-list a.list-group-item.active').removeClass('active');
        $(this).addClass('active');

        _Stage.reload($(this).text());

        $('div#choose-graph').css('display', 'none');
        $('div#graph-designer').css('display', 'block');
    })
    .on('click', 'div#graphs-list a.list-group-item.active', function () {
        $(this).removeClass('active');

        $('div#choose-graph').css('display', 'block');
        $('div#graph-designer').css('display', 'none');
    })
    .on('contextmenu', 'div#graphs-list a.list-group-item:not(.active)', function (event) {
        _ContextMenu.load('menu-list-element', $(this).index(), { left: event.clientX, top: event.clientY });

        return false; 
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

//

    $(document).on('click', 'div#distance-box input#save-distance', function () {
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
    })
    .on('click', 'div#distance-box input#close-distance', function () {
        _Connection.clear();

        $(this).parent()
               .remove();
    });

//

    $(document).on('click', 'ul#context-menu li', function () {
        var elem = $(this);

        switch (elem.attr('id')) {
            case 'remove-menu-element':
                $.ajax({
                    data: 'graphName=' + $('div#graphs-list div.list-group a:eq(' + $(this).parent().attr('data-index') + ')').text(),
                    dataType: 'json',
                    url: '/remove-graph',
                    method: 'post',
                    success: function (data) {
                        if (data.success) {
                            refreshList();
                        } else {
                            
                        }

                        elem.parent()
                            .remove();
                    }
                });
                break;
            case 'rename-menu-element':
                Popup.open('change-name', function () {
                    $('div#popup-container').attr('data-graph-index', elem.parent().attr('data-index'));
                });
                break;
        }
    });

    $('html').on('click contextmenu', function (event) {
        if (($('ul#context-menu').length > 0) && !$(event.target).is('ul#context-menu')) {
            $('ul#context-menu').remove();
        }
    });

    $(document).on('submit', 'form#graph-rename-form', function () {
        $('button#graph-rename').click();
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
    .on('click', 'button#graph-rename', function () {
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
                    _Container.show('Try to rename...', 'info');

                    $.ajax({
                        url: '/rename-graph',
                        method: 'post',
                        dataType: 'json',
                        data: 'old-graph-name=' + $('div#graphs-list div.list-group a:eq(' + $('div#popup-container').attr('data-graph-index') + ')').text() + '&new-graph-name=' + graphName,
                        success: function (data) {
                            _Container.hide('info');

                            if (data.success == 1) {
                                _Container.show('Graph renamed to <em>' + graphName + '</em>!', 'success');
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
                                    _Container.show('Graph with this name not exists!', 'error');
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
    });
});
