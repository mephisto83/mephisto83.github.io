(function () {
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
    var road = 'road';
    var _road = road;
    var sidewalk = 'sidewalk';
    var building = 'building';
    var vertical = 'vertical';
    var lot = 'lot';
    var horizontal = 'horizontal';
    var building_row = 'building_row';
    var city_building = 'city_building';
    var city_alley = 'city_alley';

    MEPH.define('MEPH.util.CitySystem', {
        requires: ['MEPH.util.LSystem', 'MEPH.util.Vector'], 
        statics: {
            get: function (options) {
                options = options || {};
                var iterations = options.iterations || 50;
                var minheight = options.minheight || 274;

                var minwidth = options.minwidth || 80;

                var areamin = options.areamin || (minwidth * minheight);
                var roadwidth = options.roadwidth || 30;
                var chancesOfSplit = options.chancesOfSplit || .95;


                var size_w = options.size_w || 600;
                var size_h = options.size_h || 600;
                var lsystem = MEPH.util.LSystem.get(newarea(horizontal, size_w, size_h));
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
                    if (!(area(val) > areamin && width(val) > (minwidth * 2 + roadwidth))) {
                        res.push(val);
                        return
                    }
                    var vert1 = newarea(vertical);
                    var road = newarea(_road);
                    var vert2 = newarea(vertical);
                    road.orientation = vertical;

                    var w = width(val);
                    w -= ((minwidth * 2) + roadwidth);

                    var road_x = Math.random() * w - w / 2;
                    road.width = roadwidth;
                    road.height = val.height;
                    // road_x += minwidth;
                    var part_width = (val.width / 2) + road_x - (roadwidth / 2);
                    road.position = { x: road_x, y: 0 };
                    addPosition(road, val);

                    vert1.width = part_width;
                    vert1.height = val.height;
                    vert1.position = { x: -val.width / 2 + vert1.width / 2, y: 0 };
                    addPosition(vert1, val);

                    vert2.width = val.width - (part_width + (roadwidth));
                    vert2.height = val.height;
                    vert2.position = { x: val.width / 2 - vert2.width / 2, y: 0 };
                    addPosition(vert2, val);


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

                    if (!(area(val) > areamin && height(val) > ((minheight * 2) + roadwidth))) {
                        res.push(val);
                        return
                    }

                    var vert1 = newarea(horizontal);
                    var road = newarea(_road);
                    var vert2 = newarea(horizontal);
                    road.orientation = horizontal;

                    var h = height(val);
                    h -= ((minheight * 2) + roadwidth);

                    var road_y = Math.random() * h - h / 2;
                    road.width = val.width;
                    road.height = roadwidth;
                    // road_y += minheight;
                    var part_height = (val.height / 2) + road_y - (roadwidth / 2);
                    road.position = { y: road_y, x: 0 };
                    addPosition(road, val);

                    vert1.width = val.width;//
                    vert1.height = part_height;
                    vert1.position = { x: 0, y: -val.height / 2 + vert1.height / 2 };
                    addPosition(vert1, val);

                    vert2.width = val.width;
                    vert2.height = val.height - (part_height + (roadwidth));
                    vert2.position = { x: 0, y: val.height / 2 - vert2.height / 2 };
                    addPosition(vert2, val);


                    res.push([vert1, road, vert2]);
                });

                mysystem.init();

                for (var i = 0; i < iterations; i++) {
                    mysystem.step();
                    mysystem.print();
                }
                var curr_state = mysystem.get();
                return curr_state
            },
            block: function (options) {

                options = options || {};
                var iterations = options.iterations || 50;
                var minheight = options.minheight || 7;

                var minwidth = options.minwidth || 7;
                var max_width = options.maxwidth || 40;
                var areamin = options.areamin || (minwidth * minheight);
                var roadwidth = options.roadwidth || 30;
                var chancesOfSplit = options.chancesOfSplit || .95;

                var sidewalk_width = options.sidewalk_width || 4;
                var size_w = options.size_w || 600;
                var size_h = options.size_h || 600;
                var alley_width = options.alley_width || 1;
                options.area = options.area || newarea(horizontal, size_w, size_h);

                var lsystem = MEPH.util.LSystem.get(options.area);
                var mysystem = lsystem;
                mysystem.addRule(function (val) {
                    switch (val.type) {
                        case sidewalk:
                        case road:
                        case city_alley:
                        case city_building:
                        case lot:
                            return true;
                            break;
                    }
                }, function (val, res) {
                    res.push(val);
                });

                mysystem.addRule(function (val) {
                    switch (val.type) {
                        case building_row:
                            return true;
                    }
                }, function (val, res) {
                    var length;
                    var b_w, b_h;
                    var b_x, b_y;
                    var depth;
                    if (val.direction === 'north' || val.direction === 'south') {
                        b_w = 'width';
                        b_h = 'height';
                        b_y = 'y';
                        b_x = 'x';
                        length = val.width;
                        depth = val.height;
                    }
                    else {
                        b_w = 'height';
                        b_y = 'x';
                        b_x = 'y';
                        b_h = 'width';

                        length = val.height;
                        depth = val.width;
                    }
                    var moreroom = length;
                    var move = 0;
                    while (moreroom > 0) {
                        var building = newarea(city_building);
                        var possible_width = MEPH.util.Vector.Lerp(minwidth, max_width, Math.random());
                        if (possible_width + minwidth > moreroom) {
                            possible_width = moreroom;
                        }
                        moreroom -= possible_width;
                        building[b_w] = possible_width;
                        building[b_h] = val[b_h];
                        building.position[b_x] = move + (possible_width / 2) - (length / 2);
                        building.position[b_y] = 0;//val[b_h] / 2;
                        addPosition(building, val);
                        move += possible_width;
                        fourSplit(building, res, city_alley, city_building, alley_width);
                        // res.push(building);
                    }

                });

                mysystem.addRule(function (val) {
                    switch (val.type) {
                        case horizontal:
                        case vertical:
                            return true;
                            break;
                    }
                }, function (val, res) {

                    var n_sidewalk = newarea(sidewalk);
                    n_sidewalk.height = sidewalk_width;
                    n_sidewalk.width = val.width;
                    n_sidewalk.position.y = -val.height / 2 + sidewalk_width / 2;
                    n_sidewalk.position.x = 0;
                    addPosition(n_sidewalk, val);

                    var s_sidewalk = newarea(sidewalk);
                    s_sidewalk.height = sidewalk_width;
                    s_sidewalk.position.y = val.height / 2 - sidewalk_width / 2;
                    s_sidewalk.width = val.width;
                    addPosition(s_sidewalk, val);

                    var w_sidewalk = newarea(sidewalk);
                    w_sidewalk.width = sidewalk_width;
                    w_sidewalk.height = val.height - sidewalk_width * 2;
                    w_sidewalk.position.y = 0;
                    w_sidewalk.position.x = -val.width / 2 + sidewalk_width / 2;
                    addPosition(w_sidewalk, val);

                    var e_sidewalk = newarea(sidewalk);
                    e_sidewalk.width = sidewalk_width;
                    e_sidewalk.height = val.height - sidewalk_width * 2;
                    e_sidewalk.position.y = 0;
                    e_sidewalk.position.x = val.width / 2 - sidewalk_width / 2;
                    addPosition(e_sidewalk, val);

                    var building_space = newarea(building);
                    building_space.width = val.width - sidewalk_width * 2;
                    building_space.height = val.height - sidewalk_width * 2;
                    building_space.position.y = 0;
                    building_space.position.x = 0;
                    addPosition(building_space, val);

                    res.push([n_sidewalk, s_sidewalk, w_sidewalk, e_sidewalk, building_space]);
                });
                mysystem.addRule(function (val) {
                    if (val.type === building) return true;
                }, function (val, res) {
                    var t = Math.random() * (val.width - (minwidth * 2));
                    var building_row_width = minwidth + t / 2;

                    var n_building_row = newarea(building_row);
                    n_building_row.height = building_row_width;
                    n_building_row.width = val.width;
                    n_building_row.position.y = -val.height / 2 + building_row_width / 2;
                    n_building_row.position.x = 0;
                    n_building_row.direction = 'north';
                    addPosition(n_building_row, val);

                    var s_building_row = newarea(building_row);
                    s_building_row.height = building_row_width;
                    s_building_row.width = val.width;
                    s_building_row.position.y = val.height / 2 - building_row_width / 2;
                    s_building_row.position.x = 0;
                    s_building_row.direction = 'south';
                    addPosition(s_building_row, val);

                    var w_building_row = newarea(building_row);
                    w_building_row.width = building_row_width;
                    w_building_row.height = val.height - building_row_width * 2;
                    w_building_row.position.x = -val.width / 2 + building_row_width / 2;
                    w_building_row.position.y = 0;
                    w_building_row.direction = 'west';
                    addPosition(w_building_row, val);

                    var e_building_row = newarea(building_row);
                    e_building_row.width = building_row_width;
                    e_building_row.height = val.height - building_row_width * 2;
                    e_building_row.position.y = 0;
                    e_building_row.position.x = val.width / 2 - building_row_width / 2;
                    e_building_row.direction = 'east';
                    addPosition(e_building_row, val);

                    var lot_space = newarea(lot);
                    lot_space.width = val.width - building_row_width * 2;
                    lot_space.height = val.height - building_row_width * 2;
                    lot_space.position.y = 0;
                    lot_space.position.x = 0;
                    addPosition(lot_space, val);

                    res.push([n_building_row, s_building_row, w_building_row, e_building_row, lot_space]);
                });


                mysystem.init();

                for (var i = 0; i < iterations; i++) {
                    mysystem.step();
                    mysystem.print();
                }
                var curr_state = mysystem.get();
                return curr_state
            }
        }
    });
    var fourSplit = function (val, res, surroundingTypes, center, sidewalk_width) {
        if (typeof (surroundingTypes) === 'string') {
            surroundingTypes = [].interpolate(0, 4, function () {
                return surroundingTypes;
            });
        }
        var n_sidewalk = newarea(surroundingTypes[0]);
        n_sidewalk.height = sidewalk_width;
        n_sidewalk.width = val.width;
        n_sidewalk.position.y = -val.height / 2 + sidewalk_width / 2;
        n_sidewalk.position.x = 0;
        addPosition(n_sidewalk, val);

        var s_sidewalk = newarea(surroundingTypes[1]);
        s_sidewalk.height = sidewalk_width;
        s_sidewalk.position.y = val.height / 2 - sidewalk_width / 2;
        s_sidewalk.width = val.width;
        addPosition(s_sidewalk, val);

        var w_sidewalk = newarea(surroundingTypes[2]);
        w_sidewalk.width = sidewalk_width;
        w_sidewalk.height = val.height - sidewalk_width * 2;
        w_sidewalk.position.y = 0;
        w_sidewalk.position.x = -val.width / 2 + sidewalk_width / 2;
        addPosition(w_sidewalk, val);

        var e_sidewalk = newarea(surroundingTypes[3]);
        e_sidewalk.width = sidewalk_width;
        e_sidewalk.height = val.height - sidewalk_width * 2;
        e_sidewalk.position.y = 0;
        e_sidewalk.position.x = val.width / 2 - sidewalk_width / 2;
        addPosition(e_sidewalk, val);

        var building_space = newarea(center);
        building_space.width = val.width - sidewalk_width * 2;
        building_space.height = val.height - sidewalk_width * 2;
        building_space.position.y = 0;
        building_space.position.x = 0;
        addPosition(building_space, val);

        res.push([n_sidewalk, s_sidewalk, w_sidewalk, e_sidewalk, building_space]);
    };
})();