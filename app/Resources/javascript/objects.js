var _Action = new function () {
    var availableActions = new Array('none', 'addpoint', 'removepoint', 'addconnection', 'removeconnection');
    this.current = 'none'
    this.change = function (action) {
        if (typeof action != 'undefined') {
            action = action.toLowerCase();

            if (availableActions.indexOf(action) != -1) {
                var body = $('body');

                body.removeClass(this.current);
                if (action != 'none') {
                    body.addClass(action);                        
                }

                this.current = action;
                console.log('Changed to ' + action);
            } else {
                _Action.toDefault();
                throw 'Action not exists!';
            }
        }
    };
    this.toDefault = function () {
        this.change('none');
    };
    this.currentIs = function (action) {
        return (this.current == action.toLowerCase());
    };
    this.getCurrent = function () {
        return this.current;
    };
};

var _Stage = new function () {
    loading = false;
    this.stage = undefined;
    this.create = function () {
        if (typeof this.stage == 'undefined') {
            this.stage = new Kinetic.Stage({
                container: 'canvas-area',
                height: 500,
                width: 1000
            });

            var baseLayer = new Kinetic.Layer();

            var connectionsLayer = new Kinetic.Layer();

            var pointsLayer = new Kinetic.Layer();

            this.stage
                .add(baseLayer)
                .add(connectionsLayer)
                .add(pointsLayer)
                .draw();
        } else {
            throw 'Stage exists!';
        }
    };
    this.getConnectionsLayer = function () {
        return this.stage
                   .children[1];
    };
    this.refreshConnectionsLayer = function () {
        this.getConnectionsLayer()
            .draw();
    };
    this.getPointsLayer = function () {
        return this.stage
                   .children[2];
    };
    this.refreshPointsLayer = function () {
        this.getPointsLayer()
            .draw();
    };
    this.clear = function () {
        if (typeof this.stage != 'undefined') {
            this.getConnectionsLayer()
                .removeChildren()
                .draw();
            _Connections.clear();

            this.getPointsLayer()
                .removeChildren()
                .draw();
            _Points.clear();
        }
    };
    this.reload = function (graphName) {
        if (graphName == '') {
            throw 'Graph name is empty!';
        } else {
            if (!loading) {
                loading = true;

                var block = $('div#main-container div.col-md-9');
                var offset = block.offset();

                $('body').append('<img id="loader-image" src="/images/loader.gif" />');

                if ($('div#canvas-area').offset().top > 0) {
                    $('img#loader-image').css({
                        left: ((block.width() / 2) + offset.left),
                        top: ((block.height() / 2) + offset.top - 32)
                    });
                } else {
                    $('img#loader-image').css({
                        left: ((block.width() / 2) + offset.left),
                        top: ((block.height() / 2) + offset.top + 50)
                    });
                }

                this.clear();

                var pointsLayer = this.getPointsLayer();

                this.loadGraph(graphName);
                _Points.eachOne(function (point) {
                    pointsLayer.add(_Points[a]);
                });
                pointsLayer.draw();

                $('img#loader-image').animate({ opacity: 0 }, 400, function () {
                    $(this).remove();
                });

                loading = false;
            }
        }
    };
    this.loadGraph = function (name) {
        $.ajax({
            data: 'graphName=' + name,
            dataType: 'json',
            method: 'post',
            url: '/load-graph',
            success: function (data) {
                if (data.success) {
                    for (var a = 0; a < data.pointscount; a++) {
                        _Points.add(data.points[a].x, data.points[a].y);
                    }

                    for (var a = 0; a < data.connectionscount; a++) {
                        try {
                            _Points.getPoint(data.connections[a].from);
                            _Points.getPoint(data.connections[a].to);

                            _Connection.add(data.connections[a].from);
                            _Connection.add(data.connections[a].to, data.connections[a].distance);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
        });
    };
    this.add = function (element) {
        return this.stage
                   .add(element);
    };
    this.draw = function () {
        return this.stage
                   .draw();
    };
};

var _Points = new function (points) {
    this.points = new Array();
    this.getPoint = function(n) {
        if (this.points.length == 0) {
            throw 'Points array is clear!';
        } else {
            if ((n < this.points.length) && (n >= 0)) {
                return this.points[n];
            } else {
                throw 'Point not exists!';
            }
        }
    };
    this.eachOne = function (func) {
        if (this.points.length > 0) {
            for (var a = 0; a < this.points.length; a++) {
                func(this.points[a]);
            }
        }
    };
    this.check = function (x, y) {
        if (this.points.length > 0) {
            for (var a = 0; a < this.points.length; a++) {
                if ((this.points[a].getX() == x) && (this.points[a].getY() == y)) {
                    return false;
                }
            }

            return true;
        } else {
            return true;
        }
    };
    this.clear = function () {
        if (typeof this.points != 'undefined') {
            delete this.points;
            this.points = new Array();
        }
    };
    this.add = function (x, y) {
        //if (this.check(x, y)) {
            var point = new Kinetic.Circle({
                draggable: true,
                fill: '#fff',
                radius: 6,
                stroke: '#000',
                strokeWidth: 1,
                x: x,
                y: y
            });

            point.attrs.x = parseInt(point.attrs.x);
            point.attrs.y = parseInt(point.attrs.y);

            point.on('click', function () {
                switch (_Action.getCurrent()) {
                    case 'removepoint':
                        _Points.remove(this.getX(), this.getY());

                        _Stage.refreshPointsLayer();
                        _Stage.refreshConnectionsLayer();
                        break;
                    case 'addconnection':
                        console.log('Add ' + _Points.points
                                               .indexOf(this));
                        _Connection.add(_Points.points
                                               .indexOf(this));
                        break;
                }
            })
            .on('dragstart', function () {
                _Action.toDefault();
            })
            .on('dragmove', function () {
                var pointIndex = _Points.points
                                        .indexOf(this);
                var connections = _Connections.getConnections(pointIndex);
                for (var a = 0; a < connections.length; a++) {
                    if (connections[a].idxs[0] == pointIndex) {
                        connections[a].attrs.points[0] = this.getX();
                        connections[a].attrs.points[1] = this.getY();
                    } else {
                        connections[a].attrs.points[2] = this.getX();
                        connections[a].attrs.points[3] = this.getY();
                    }
                }

                _Stage.refreshConnectionsLayer();
            });

            this.points
                .push(point);

            _Stage.getPointsLayer()
                  .add(point)
                  .draw();
        // } else {
            // alert('Point on position (' + x + ', ' + y + ') exists!');
        // }
    };
    this.remove = function (x, y) {
        if (this.points.length > 0) {
            for (var a = 0; a < this.points.length; a++) {
                if ((this.points[a].getX() == x) && (this.points[a].getY() == y)) {
                    this.points[a]
                        .remove();
                    delete this.points[a];

                    this.points = this.points.slice(0, a)
                                      .concat(this.points
                                                  .slice(a + 1));

                    _Connections.removeFromPoint(a);
                    break;
                }
            }
        }
    };
    this.toSave = function () {
        var saveString = '';
        for (var a = 0; a < this.points.length; a++) {
            if (saveString != '') {
                saveString += ',';
            }

            saveString += this.points[a]
                              .getX() +
                          ':' +
                          this.points[a]
                              .getY();
        }
        return saveString;
    };
    this.getID = function (x, y) {
        if (this.points.length > 0) {
            for (var a = 0; a < this.points.length; a++) {
                if ((this.points[a].getX() == x) && (this.points[a].getY() == y)) {
                    return a;
                }
            }

            return -1;
        } else {
            return -1;
        }
    };
};

var _Connections = new function () {
    this.connections = new Array();
    this.add = function (connection) {
        _Action.toDefault();

        try {
            if ((connection.getEnd(0) != -1) && (connection.getEnd(1) != -1) && (connection.getEnd(0) != connection.getEnd(1))) {
                var first = _Points.getPoint(connection.getEnd(0)),
                    second = _Points.getPoint(connection.getEnd(1));

                var line = new Kinetic.Line({
                    points: [first.getX(), first.getY(), second.getX(), second.getY()],
                    stroke: '#000',
                    strokeWidth: 1.9
                });

                line.idxs = new Array(connection.getEnd(0), connection.getEnd(1));
                line.distance = connection.getDinstace();

                line.on('click', function () {
                    if (_Action.getCurrent() == 'removeconnection') {
                        _Connections.remove(this.idxs);

                        _Stage.refreshConnectionsLayer();
                    }
                });

                this.connections
                    .push(line);

                _Stage.getConnectionsLayer()
                      .add(line)
                      .draw();
            }

            _Connection.clear();
        } catch (e) {
            _Connection.clear();
            throw 'Wrong connection object!';
        }
    };
    this.clear = function () {
        if (typeof this.connections != 'undefined') {
            delete this.connections;
            this.connections = new Array();
        }
    };
    this.toSave = function () {
        var saveString = '';
        for (var a = 0; a < this.connections.length; a++) {
            if (saveString != '') {
                saveString += ',';
            }

            saveString += this.connections[a]
                              .idxs[0] +
                          ':' +
                          this.connections[a]
                              .idxs[1] +
                          ':' +
                          this.connections[a]
                              .distance;
        }
        return saveString;
    };
    this.removeFromPoint = function (pointN) {
        var newConnections = new Array();

        for (var a = 0; a < this.connections.length; a++) {
            if ((this.connections[a].idxs[0] == pointN) || (this.connections[a].idxs[1] == pointN)) {
                this.connections[a]
                    .remove();
                delete this.connections[a];
            } else {
                if (this.connections[a].idxs[0] > pointN) {
                    this.connections[a]
                        .idxs[0]--;
                }
                if (this.connections[a].idxs[1] > pointN) {
                    this.connections[a]
                        .idxs[1]--;
                }

                newConnections.push(this.connections[a]);
            }
        }

        this.connections = newConnections;
    };
    this.remove = function (idxs) {
        for (var a = 0; a < this.connections.length; a++) {
            if ((this.connections[a].idxs[0] == idxs[0]) && (this.connections[a].idxs[1] == idxs[1])) {
                this.connections[a]
                    .remove();
                delete this.connections[a];

                this.connections = this.connections.slice(0, a)
                                       .concat(this.connections
                                                   .slice(a + 1));
            }
        }
    };
    this.checkConnection = function (id1, id2) {
        for (var a = 0; a < this.connections.length; a++) {
            if (((this.connections[a].idxs[0] == id1) && (this.connections[a].idxs[1] == id2)) ||
                ((this.connections[a].idxs[0] == id2) && (this.connections[a].idxs[1] == id1))) {
                return false;
            }
        }

        return true;
    };
    this.getConnections = function (pointN) {
        var returnedConnetions = new Array();
        for (var a = 0; a < this.connections.length; a++) {
            if ((this.connections[a].idxs[0] == pointN) || (this.connections[a].idxs[1] == pointN)) {
                returnedConnetions.push(this.connections[a]);
            }
        }
        return returnedConnetions;
    };
};

var _Connection = new function () {
    var showBox = function (id) {
        if ($('div#distance-box').length > 0) {
            $('div#distance-box').remove();
        }

        $('body').append('<div class="text-center" id="distance-box"><div>How long is this connection?</div><input type="text" /><input id="save-distance" type="submit" value="Save" /><input id="close-distance" type="submit" value="Close" /></div>');

        var point = _Points.getPoint(id);
        var offset = $('div#canvas-area').offset();

        $('div#distance-box').css({
            left: point.getX() + offset.left + Math.PI,
            top: point.getY() + offset.top + Math.PI
        });
    };

    this.ends = new Array(-1, -1);
    this.distance = undefined;
    this.add = function (id, distance) {
        if (this.ends[0] == -1) {
            this.ends[0] = id;
        } else {
            _Action.toDefault();

            if (id == this.ends[0]) {
                this.clear();
            } else {
                this.ends[1] = id;

                if (_Connections.checkConnection(this.ends[0], this.ends[1])) {
                    distance = parseInt(distance);
                    if (distance > 0) {
                        this.distance = distance;
                        _Connections.add(this);
                    } else {
                        showBox(id);
                    }
                } else {
                    this.clear();
                }
            }
        }
    };
    this.clear = function () {
        this.ends[0] = this.ends[1]
                     = -1;
        _Action.toDefault();
    };
    this.getEnd = function (n) {
        return this.ends[n];
    };
    this.setDistance = function (distance) {
        this.distance = distance;
    };
    this.getDinstace = function () {
        return this.distance;
    };
};

var _Container = new function () {
    var availableTypes = new Array('error', 'info', 'success');
    function checkType(type) {
        if (availableTypes.indexOf(type.toLowerCase()) != -1) {
            return true;
        } else {
            throw 'Unknown type!';
        }
    }
    this.show = function (message, type) {
        type = type.toLowerCase();
        if (checkType(type)) {
            $('#form-' + type).css('display', 'block')
                          .html(message);
        }
    };
    this.hide = function (type) {
        type = type.toLowerCase();
        if (checkType(type)) {
            $('#form-' + type).css('display', 'none')
                              .html('');
        }
    };
};

var _ContextMenu = new function () {
    var menus = {
        'menu-list-element': new Array(['rename-menu-element', 'Change Name'], ['remove-menu-element', 'Remove']),
    };

    this.load = function (menu, index, offset) {
        if ($('ul#context-menu').length > 0) {
            $('ul#context-menu').remove();
        }

        if (menu in menus) {
            appendedHtml = '';

            $.each(menus[menu], function (key, value) {
                appendedHtml += '<li id="' + value[0] + '">' + value[1] + '</li>';
            });

            if ((typeof offset.left != 'undefined') && (typeof offset.top != 'undefined')) {
                $('body').append('<ul data-index="' + index + '" id="context-menu" style="left: ' + offset.left + 'px; top: ' + offset.top + 'px;">' + appendedHtml + '</ul>');
            } else {
                $('body').append('<ul data-index="' + index + '" id="context-menu">' + appendedHtml + '</ul>');
            }
        } else {
            throw 'Unknown context menu!';
        }
    };
};

var Popup = new function () {
    var popups = new Array('create-new', 'change-name');

    this.open = function (popup, callback) {
        if ($('div#popup-container').length == 0) {
            if (popups.indexOf(popup) != -1) {
                $.ajax({
                url: '/' + popup,
                method: 'post',
                success: function (data) {
                    if ($('div#popup-container').length == 0) {
                        $('body').append(data);

                        if (typeof callback == 'function') {
                            callback();
                        }
                    }
                }
            });
            }
        }
    };
};
