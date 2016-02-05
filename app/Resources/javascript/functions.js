function refreshList()
{
    var activeElement = $('div#graphs-list a.list-group-item.active').text();

    $.ajax({
        url: '/refresh-list',
        method: 'post',
        dataType: 'json',
        success: function (data) {
            if (data.success == 1) {
                $('div#graphs-list :not(:first-child)').remove();
                if (data.savedGraphs.length == 0) {
                    $('button#add-new').remove();
                    $('div#graphs-list').append('<div class="panel-body text-center"><p>There is no saved graphs</p><p><button id="add-new" type="button" class="btn btn-default" aria-label="Add New">Add New <span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button></p></div>');
                } else {
                    if ($('button#add-new').length == 0) {
                        $('div.panel-heading').append('<button id="add-new" type="button" class="btn btn-default btn-sm pull-right" aria-label="Add New"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>');
                    }

                    var html = '<div class="list-group">';
                    for (var graph in data.savedGraphs) {
                        html += '<a class="list-group-item">' + data.savedGraphs[graph].name + '</a>';
                    }
                    html += '</div>';

                    $('div#graphs-list').append(html);

                    $('div#graphs-list a.list-group-item:contains(' + activeElement + ')').each(function () {
                        if ($(this).text() == activeElement) {
                            $(this).addClass('active');
                        }
                    });
                }
            }
        }
    });
}

function addErrorClass(element)
{
    var parent = $(element).parent('.input-group');
    parent.addClass('has-error');
    parent.find('.btn-default').removeClass('btn-default').addClass('btn-danger');
}

function removeErrorClass(element)
{
    var parent = $(element).parent('.input-group');
    if (parent.hasClass('has-error')) {
        parent.removeClass('has-error');
        parent.find('.btn-danger').removeClass('btn-danger').addClass('btn-default');
    }
}

function loadContextMenu(menu, index, offset)
{
    if ($('ul#context-menu').length > 0) {
        $('ul#context-menu').remove();
    }

    $.ajax({
            url: '/context-' + menu,
            method: 'post',
            dataType: 'json',
            success: function (response) {
                var appendedHtml = '';

                for (var a = 0; a < response.length; a++) {
                    appendedHtml += '<li id="' + response[a][0] + '">' + response[a][1] + '</li>';
                }

                if ((typeof offset.left != 'undefined') && (typeof offset.top != 'undefined')) {
                    $('body').append('<ul data-index="' + index + '" id="context-menu" style="left: ' + offset.left + 'px; top: ' + offset.top + 'px;">' + appendedHtml + '</ul>');
                } else {
                    $('body').append('<ul data-index="' + index + '" id="context-menu">' + appendedHtml + '</ul>');
                }
            }
    });
}
