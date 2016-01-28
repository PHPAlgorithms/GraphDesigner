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
