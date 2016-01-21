var _Action = new function () {
    var availableActions = new Array('none', 'addpoint', 'removepoint');
    this.current = 'none'
    this.change = function (action) {
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
    };
    this.toDefault = function () {
        this.change('none');
    };
    this.currentIs = function (action) {
        return (this.current == action.toLowerCase());
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

            this.stage
                .add(baseLayer);

            var pointsLayer = new Kinetic.Layer();

            _Points.eachOne(function (point) {
                pointsLayer.add(_Points[a]);
            });

            this.stage
                .add(pointsLayer)
                .draw();
        } else {
            throw 'Stage exists!';
        }
    };
    this.getPointsLayer = function () {
        return this.stage
                   .children[1];
    };
    this.refreshPointsLayer = function () {
        this.getPointsLayer()
            .draw();
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
    this.count = 0;
    this.getPoint = function(n) {
        if (this.count == 0) {
            throw 'Points array is clear!';
        } else {
            if ((n < this.count) && (n >= 0)) {
                return this.points[n];
            } else {
                throw 'Point not exists!';
            }
        }
    };
    this.eachOne = function (func) {
        if (this.count > 0) {
            for (var a = 0; a < this.count; a++) {
                func(this.points[a]);
            }
        }
    };
    this.check = function (x, y) {
        if (this.count > 0) {
            for (var a = 0; a < this.count; a++) {
                if ((this.points[a].getX() == x) && (this.points[a].getY() == y)) {
                    return false;
                }
            }

            return true;
        } else {
            return true;
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
                if (_Action.currentIs('removepoint')) {
                    _Points.remove(this.getX(), this.getY());

                    this.remove();

                    _Stage.refreshPointsLayer();
                }
            });

            this.points
                .push(point);
            this.count++;

            _Stage.getPointsLayer()
                  .add(point)
                  .draw();
        } else {
            alert('Point on position (' + x + ', ' + y + ') exists!');
        }
    };
    this.remove = function (x, y) {
        if (this.count > 0) {
            for (var a = 0; a < this.count; a++) {
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
        for (var a = 0; a < this.count; a++) {
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
};