var _Action = new function () {
    var availableActions = new Array('none', 'addpoint', 'removepoint', 'addconnection');
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
            this.clear();

            var pointsLayer = this.getPointsLayer();

            this.loadGraph(graphName);
            _Points.eachOne(function (point) {
                pointsLayer.add(_Points[a]);
            });
            pointsLayer.draw();
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
                            _Connection.add(data.connections[a].to);
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
        if (this.check(x, y)) {
            var point = new Kinetic.Circle({
                fill: '#fff',
                radius: 6,
                stroke: '#000',
                strokeWidth: 1,
                x: x,
                y: y
            });

            point.on('click', function () {
                switch (_Action.getCurrent()) {
                    case 'removepoint':
                        _Points.remove(this.getX(), this.getY());

                        this.remove();

                        _Stage.refreshPointsLayer();
                        break;
                    case 'addconnection':
                        _Connection.add(_Points.points
                                               .indexOf(this));
                        break;
                }
            });

            this.points
                .push(point);

            _Stage.getPointsLayer()
                  .add(point)
                  .draw();
        } else {
            alert('Point on position (' + x + ', ' + y + ') exists!');
        }
    };
    this.remove = function (x, y) {
        if (this.points.length > 0) {
            for (var a = 0; a < this.points.length; a++) {
                if ((this.points[a].getX() == x) && (this.points[a].getY() == y)) {
                    delete this.points[a];

                    _Points.points = _Points.points.slice(0, a)
                                            .concat(_Points.points
                                                           .slice(a + 1));

                    _Points.count--;
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
                    strokeWidth: 1.2
                });

                line.idxs = new Array(connection.getEnd(0), connection.getEnd(1));
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
                              .idxs[1];
        }
        return saveString;
    };
};

var _Connection = new function () {
    this.ends = new Array(-1, -1);
    this.add = function (id) {
        if (this.ends[0] == -1) {
            this.ends[0] = id;
        } else {
            _Action.toDefault();

            if (id == this.ends[0]) {
                this.clear();
            } else {
                this.ends[1] = id;
                _Connections.add(this);
            }
        }
    };
    this.clear = function () {
        this.ends[0] = this.ends[1]
                     = -1;
    };
    this.getEnd = function (n) {
        return this.ends[n];
    };
};
