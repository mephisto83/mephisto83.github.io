describe("/util/LSystem.spec.js", 'MEPH.util.LSystem', 'MEPH.util.Style', 'MEPH.util.CitySystem', function () {
    var vertical = 'vertical';
    var horizontal = 'horizontal';
    var road = 'road';
    var _road = road;
    var sidewalk = 'sidewalk';
    var building = 'building';
    var vertical = 'vertical';
    var lot = 'lot';
    var horizontal = 'horizontal';
    var building_row = 'building_row';
    var city_building = 'city_building';
    var printBoardOut = function (curr_state, factor) {

        var board = document.createElement('div');
        document.body.appendChild(board);
        board.style.position = 'absolute';
        board.style.top = '700px';
        board.style.left = '100px';
        board.style.width = '100px';
        board.style.backgroundColor = 'white';
        board.style.height = '100px';
        board.style.zIndex = 10000;
        var pwidth = 100;
        var pheight = 100;
        var printToBoard = function (state) {
            state.forEach(function (t) {
                if (Array.isArray(t)) {
                    printToBoard(t);
                }
                else {
                    var sub = document.createElement('div');
                    MEPH.util.Style.height(sub, (t.height) * factor);
                    board.appendChild(sub);
                    MEPH.util.Style.width(sub, (t.width) * factor);

                    MEPH.util.Style.position(sub, 'absolute');
                    MEPH.util.Style.top(sub, (t.position.y - t.height / 2) * factor);
                    MEPH.util.Style.left(sub, (t.position.x - t.width / 2) * factor);
                    if (t.type === horizontal) {
                        sub.style.backgroundColor = 'red';
                    }
                    else if (t.type === vertical) {
                        sub.style.backgroundColor = 'blue';
                    }
                    else if (t.type === building) {
                        sub.style.backgroundColor = 'yellow';
                    }
                    else if (t.type === sidewalk) {
                        sub.style.backgroundColor = 'orange';
                    }
                    else if (t.type === 'building') {
                        sub.style.backgroundColor = '#4F8DFF';

                    }
                    else if (t.type === city_building) {
                        sub.style.backgroundColor = 'purple';
                    }
                    else sub.style.backgroundColor = 'green';
                }
            })
        }
        printToBoard(curr_state);
    }
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    it("can get LSystem instance.", function () {
        var horizontal = 'horizontal';
        var vertical = 'vertical';
        var areamin = 25;
        var minheight = 5;
        var minwidth = 5;
        var roadwidth = 1;
        var chancesOfSplit = .95;
        var road = 'road';
        var _road = road;
        var area = function (val) {
            return val.height * val.width;
        }
        var height = function (val) {
            return val.height;
        }
        var width = function (val) {
            return val.width;
        }
        var newarea = function (type, w, h) {
            return {
                type: type,
                width: w || 0,
                height: h || 0,
                position: { x: 0, y: 0 }
            }
        }
        var addPosition = function (vert, val) {
            vert.position.x += val.position.x;
            vert.position.y += val.position.y;
        }

        var lsystem = MEPH.util.LSystem.get(newarea(horizontal, 600, 600));
        var mysystem = lsystem;
        mysystem.addRule(function (val) {
            if (val.type === horizontal) {
                return true;
            }
        }, function (val, res) {
            if (Math.random() > chancesOfSplit) {
                res.push(val);
                return;
            }
            if (!(area(val) > areamin && height(val) > minheight && width(val) > minwidth)) {
                res.push(val);
                return
            }
            var vert1 = newarea(vertical);
            var road = newarea(_road);
            var vert2 = newarea(vertical);

            var w = width(val);
            w -= (minwidth * 2 + roadwidth);
            var road_x = Math.random() * w;
            road_x += minwidth + roadwidth / 2;
            road.position = { x: road_x, y: 0 };
            addPosition(road, val);
            road.width = roadwidth;
            road.height = val.height;
            road.orientation = vertical;
            vert1.position = { x: 0, y: 0 };
            addPosition(vert1, val);
            vert1.width = road_x - (roadwidth / 2);
            vert1.height = val.height;

            vert2.position = { x: road_x + (roadwidth / 2), y: 0 };
            addPosition(vert2, val);
            vert2.width = val.width - (road_x + (roadwidth / 2));
            vert2.height = val.height;

            res.push([vert1, road, vert2]);
        });
        mysystem.addRule(function (val) {
            if (val.type === _road) return true;
        }, function (val, res) {
            res.push(val);
        })
        mysystem.addRule(function (val) {
            if (val.type === vertical) {
                return true

            }
        }, function (val, res) {
            if (Math.random() > chancesOfSplit) {
                res.push(val);
                return;
            }

            if (!(area(val) > areamin && height(val) > minheight && width(val) > minwidth)) {
                res.push(val);
                return
            }

            var vert1 = newarea(horizontal);
            var road = newarea(_road);
            var vert2 = newarea(horizontal);
            road.orientation = horizontal;
            var h = height(val);
            h -= (minheight * 2 + roadwidth);

            var road_y = Math.random() * h;
            road_y += minheight + roadwidth / 2;
            road.position = { y: road_y, x: 0 };
            addPosition(road, val);
            road.width = val.width;
            road.height = roadwidth;

            vert1.position = { x: 0, y: 0 };
            addPosition(vert1, val);
            vert1.width = val.width;//
            vert1.height = road_y - (roadwidth / 2);;

            vert2.position = { y: road_y + (roadwidth / 2), x: 0 };
            addPosition(vert2, val);
            vert2.width = val.width;
            vert2.height = val.height - (road_y + (roadwidth / 2));

            res.push([vert1, road, vert2]);
        });

        mysystem.init();

        for (var i = 0; i < 50; i++) {
            mysystem.step();
            mysystem.print();
        }
        var curr_state = mysystem.get();
    });

    it('can get a city instance', function () {
        var state = MEPH.util.CitySystem.get({ iterations: 30, size_w: 370, size_h: 2100 });
        printBoardOut(state, .5);
    })


    it('can get a city block instance', function () {
        var state = MEPH.util.CitySystem.block({
            iterations: 30, size_w: 274, size_h: 80, area: {
                type: vertical,
                width: 100,
                height: 100,
                position: {
                    x: 0,
                    y: 0
                }
            }
        });
        printBoardOut(state, 1);
    })
});