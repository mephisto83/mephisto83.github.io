describe("MEPH/util/Features.spec.js", 'MEPH.util.Features', 'MEPH.util.Renderer', 'MEPH.code.RingCode', 'MEPH.math.Matrix3d', function () {
    var Features = MEPH.util.Features;
    var Matrix3d;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
        Matrix3d = MEPH.math.Matrix3d;
    });

    it("can create a util", function () {
        //Arrange

        //Assert
        var util = new Features();

        expect(util).toBeTruthy();

    });

    it('can create feature matrix', function () {
        var features = new Features();
        var img_u8 = features.createMatrix(640, 480, Features.jsfeat.U8_t | Features.jsfeat.C1_t);
        // var img_u8 = new jsfeat.matrix_t(640, 480, Features.jsfeat.U8_t | Features.jsfeat.C1_t);
        expect(img_u8).toBeTruthy();
    });

    it('can create corners', function () {
        var features = new Features();
        var corners = features.createCorners(640, 480);
        // var img_u8 = new jsfeat.matrix_t(640, 480, Features.jsfeat.U8_t | Features.jsfeat.C1_t);
        expect(corners).toBeTruthy();
        expect(corners.length === 640 * 480).toBeTruthy();
    });

    it('can set fast corners', function () {
        var features = new Features();

        var res = features.setFastCornerThreshold(30);

        expect(res === 30).toBeTruthy();
    });
    function createCanvasAndParst(options) {
        options = options || { height: 400, width: 400 };

        var canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        var renderer = new MEPH.util.Renderer();
        canvas.height = options.height;
        canvas.width = options.width;
        renderer.setCanvas(canvas);

        return {
            renderer: renderer,
            canvas: canvas
        }
    }
    it('can detect features', function () {
        var obj = createCanvasAndParst();
        obj.renderer.draw([].interpolate(0, 2, function () {
            return { shape: 'circle', x: 380 * Math.random() + 10, y: 380 * Math.random() + 10, radius: 20, fillStyle: '#ff0fff' }
        }));

        var features = new Features();
        var res = features.detectFeatures(obj.canvas, { threshold: 1, render: false });

        expect(res).toBeTruthy();
        expect(res.corners).toBeTruthy();
        expect(res.count !== undefined).toBeTruthy();
        expect(res.data_u32).toBeTruthy();
        obj.canvas.parentNode.removeChild(obj.canvas);
    });

    it('draw field to detect', function () {
        var obj = createCanvasAndParst();
        var spread = 20;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            var radius = 4, color = '#ffff00';
            var offset = { x: 10, y: 10 };
            if ((x == 0 && y == 0) || (x === 0 && y === 9) || (x === 9 && y === 9)) {
                color = '#ff00ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                radius: radius
            }
        }));

        var features = new Features();
        var res = features.detectFeatures(obj.canvas, { threshold: 1, render: true });
        expect(res).toBeTruthy();
        expect(res.corners).toBeTruthy();
        expect(res.count !== undefined).toBeTruthy();
        expect(res.data_u32).toBeTruthy();
        obj.canvas.parentNode.removeChild(obj.canvas);
    });

    it('can get points ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            var radius = 4,
                color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });

        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        expect(res.length > 100).toBeTruthy();
        //}).catch(function (e) {
        //    expect(e).caught();
        obj.canvas.parentNode.removeChild(obj.canvas);
        //}).then(done);
    });


    it('can detect left top corner ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });
        var corners = features.detectCorners(res);
        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        expect(corners).toBeTruthy();
        expect(corners.topRight).toBeTruthy();
        expect(corners.topLeft).toBeTruthy();
        expect(corners.bottomLeft).toBeTruthy();
        expect(corners.bottomRight).toBeTruthy();
        expect(res.length > 100).toBeTruthy();
        var mark = '#ffffff';
        radius = 10;
        obj.renderer.draw([{
            shape: 'circle',
            fillStyle: mark,
            x: corners.topLeft.x,
            y: corners.topLeft.y,
            radius: radius / 2
        }
        //, {
        //    shape: 'circle',
        //    fillStyle: mark,
        //    x: corners.topRight.x,
        //    y: corners.topRight.y,
        //    radius: radius / 2
        //}, {
        //    shape: 'circle',
        //    fillStyle: mark,
        //    x: corners.bottomLeft.x,
        //    y: corners.bottomLeft.y,
        //    radius: radius / 2
        //}, {
        //    shape: 'circle',
        //    fillStyle: mark,
        //    x: corners.bottomRight.x,
        //    y: corners.bottomRight.y,
        //    radius: radius / 2
        //}
        ]);
        //    obj.canvas.parentNode.removeChild(obj.canvas);
        //}).catch(function (e) {
        //    expect(e).caught();
        //}).then(done);
    });


    it('can detect right top corner', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20,
            radius,
            color;

        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                rotation: -.1,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, {
            threshold: 1,
            render: true,
            color: '#ffff00'
        });

        var corners = features.detectCorners(res);

        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        expect(corners).toBeTruthy();
        expect(corners.topRight).toBeTruthy();
        expect(res.length > 100).toBeTruthy();
        var mark = '#ffffff';
        radius = 10;
        obj.renderer.draw([{
            shape: 'circle',
            fillStyle: mark,
            x: corners.topRight.x,
            y: corners.topRight.y,
            radius: radius / 2
        }, {
            shape: 'circle',
            fillStyle: '#ff0000',
            x: corners.topLeft.x,
            y: corners.topLeft.y,
            radius: radius / 2
        }, {
            shape: 'circle',
            fillStyle: '#ff00ff',
            x: corners.bottomLeft.x,
            y: corners.bottomLeft.y,
            radius: radius / 2
        }, {
            shape: 'circle',
            fillStyle: '#0000ff',
            x: corners.bottomRight.x,
            y: corners.bottomRight.y,
            radius: radius / 2
        }]);
    });

    it('can detect corners even when rotated ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                rotation: -.1,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });
        var corners = features.detectCorners(res);
        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        if (corners.topLeft) {
            expect(corners).toBeTruthy();
            expect(corners.topRight).toBeTruthy();
            expect(corners.topLeft).toBeTruthy();
            expect(corners.bottomLeft).toBeTruthy();
            expect(corners.bottomRight).toBeTruthy();
            var mark = '#ffffff';
            radius = 10;

            obj.renderer.draw([{
                shape: 'circle',
                fillStyle: mark,
                x: corners.topLeft.x,
                y: corners.topLeft.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.topRight.x,
                y: corners.topRight.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.bottomLeft.x,
                y: corners.bottomLeft.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.bottomRight.x,
                y: corners.bottomRight.y,
                radius: radius / 2
            }]);
        }
        expect(res.length > 100).toBeTruthy();

        //}).catch(function (e) {
        //    expect(e).caught();
        //}).then(done);
    });
    it('can detect corners even when rotated ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                rotation: .1,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });
        var corners = features.detectCorners(res);
        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        if (corners.topLeft) {
            expect(corners).toBeTruthy();
            expect(corners.topRight).toBeTruthy();
            expect(corners.topLeft).toBeTruthy();
            expect(corners.bottomLeft).toBeTruthy();
            expect(corners.bottomRight).toBeTruthy();
            var mark = '#ffffff';
            radius = 10;

            obj.renderer.draw([{
                shape: 'circle',
                fillStyle: mark,
                x: corners.topLeft.x,
                y: corners.topLeft.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.topRight.x,
                y: corners.topRight.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.bottomLeft.x,
                y: corners.bottomLeft.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.bottomRight.x,
                y: corners.bottomRight.y,
                radius: radius / 2
            }]);
        }
        expect(res.length > 100).toBeTruthy();

        //}).catch(function (e) {
        //    expect(e).caught();
        //}).then(done);
    });
    it('can detect corners even when rotated ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                rotation: 0,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });
        var corners = features.detectCorners(res);
        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        if (corners.topLeft) {
            expect(corners).toBeTruthy();
            expect(corners.topRight).toBeTruthy();
            expect(corners.topLeft).toBeTruthy();
            expect(corners.bottomLeft).toBeTruthy();
            expect(corners.bottomRight).toBeTruthy();
            var mark = '#ffffff';
            radius = 10;

            obj.renderer.draw([{
                shape: 'circle',
                fillStyle: mark,
                x: corners.topLeft.x,
                y: corners.topLeft.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.topRight.x,
                y: corners.topRight.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.bottomLeft.x,
                y: corners.bottomLeft.y,
                radius: radius / 2
            }, {
                shape: 'circle',
                fillStyle: mark,
                x: corners.bottomRight.x,
                y: corners.bottomRight.y,
                radius: radius / 2
            }]);
        }
        expect(res.length > 100).toBeTruthy();

        //}).catch(function (e) {
        //    expect(e).caught();
        //}).then(done);
    });

    it('can get a transform matrix for the corners when normal. ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                rotation: 0,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });
        var corners = features.detectCorners(res);
        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        if (corners.topLeft) {
            expect(corners).toBeTruthy();
            expect(corners.topRight).toBeTruthy();
            expect(corners.topLeft).toBeTruthy();
            expect(corners.bottomLeft).toBeTruthy();
            expect(corners.bottomRight).toBeTruthy();
            var mark = '#ffffff';
            radius = 10;


            var b = [0, 0, 1, 0, 0, 1, 1, 1].select(function (x) { return 200 * x; });
            var a = [corners.topLeft.x,
                corners.topLeft.y,
                corners.topRight.x,
                corners.topRight.y,
                corners.bottomLeft.x,
                corners.bottomLeft.y,
                corners.bottomRight.x,
                corners.bottomRight.y];
            var t = Matrix3d.transform2d(a, b);

        }
        expect(res.length > 100).toBeTruthy();

        //}).catch(function (e) {
        //    expect(e).caught();
        //}).then(done);
    });


    it('can get a transform matrix for the corners when rotated ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                rotation: -.1,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });
        var corners = features.detectCorners(res);
        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        if (corners.topLeft) {
            expect(corners).toBeTruthy();
            expect(corners.topRight).toBeTruthy();
            expect(corners.topLeft).toBeTruthy();
            expect(corners.bottomLeft).toBeTruthy();
            expect(corners.bottomRight).toBeTruthy();
            var mark = '#ffffff';
            radius = 10;

            var b = [0, 0, 1, 0, 0, 1, 1, 1].select(function (x) { return 200 * x; });
            var a = [corners.topLeft.x,
                corners.topLeft.y,
                corners.topRight.x,
                corners.topRight.y,
                corners.bottomLeft.x,
                corners.bottomLeft.y,
                corners.bottomRight.x,
                corners.bottomRight.y];
            var t = Matrix3d.transform2d(a, b);

            var res = Matrix3d.multmv(t, [corners.topRight.x, corners.topRight.y, 1]);
            var finalx = res[0] / res[2];
            var finaly = res[1] / res[2];
            expect(Math.abs(finalx - 200) < 2).toBeTruthy();
            expect(Math.abs(finaly - 0) < 2).toBeTruthy();

        }
    });

    it('can get a transform matrix for the corners when rotated ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                rotation: -.1,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });
        var corners = features.detectCorners(res);
        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        if (corners.topLeft) {
            expect(corners).toBeTruthy();
            expect(corners.topRight).toBeTruthy();
            expect(corners.topLeft).toBeTruthy();
            expect(corners.bottomLeft).toBeTruthy();
            expect(corners.bottomRight).toBeTruthy();
            var mark = '#ffffff';
            radius = 10;

            var b = [0, 0, 1, 0, 0, 1, 1, 1].select(function (x) { return 200 * x; });
            var a = [corners.topLeft.x,
                corners.topLeft.y,
                corners.topRight.x,
                corners.topRight.y,
                corners.bottomLeft.x,
                corners.bottomLeft.y,
                corners.bottomRight.x,
                corners.bottomRight.y];
            var t = Matrix3d.transform2d(a, b);

            var res = Matrix3d.multmv(t, [corners.topRight.x, corners.topRight.y, 1]);
            var finalx = res[0] / res[2];
            var finaly = res[1] / res[2];
            expect(Math.abs(finalx - 200) < 2).toBeTruthy();
            expect(Math.abs(finaly - 0) < 2).toBeTruthy();
            var m = (corners.topLeft.x - corners.topRight.x) / (corners.topLeft.y - corners.topRight.y);
            var distance = Matrix3d.distance2d(corners.topRight, corners.topLeft);
            dist2 = distance / 2;
            var tlx = corners.topLeft.x;
            var tly = corners.topLeft.y;
            var b = tly - m * tlx;

            obj.renderer.draw([{
                shape: 'line',
                color: 'white',
                start: {
                    x: corners.topLeft.x,
                    y: corners.topLeft.y
                },
                end: {
                    x: corners.topRight.x,
                    y: corners.topRight.y
                }
            }, {
                shape: 'line',
                color: 'white',
                start: {
                    x: corners.bottomLeft.x,
                    y: corners.bottomLeft.y
                },
                end: {
                    x: corners.bottomRight.x,
                    y: corners.bottomRight.y
                }
            }, {
                shape: 'line',
                color: 'white',
                start: {
                    x: corners.topRight.x,
                    y: corners.topRight.y
                },
                end: {
                    x: corners.bottomRight.x,
                    y: corners.bottomRight.y
                }
            }, {
                shape: 'line',
                color: 'white',
                start: {
                    x: corners.topLeft.x,
                    y: corners.topLeft.y
                },
                end: {
                    x: corners.bottomLeft.x,
                    y: corners.bottomLeft.y
                }
            }]);

        }
    });
    it('can read features into a binary string', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            if ((x == 0 && y == 0)
                || (x == 4 && y == 3)
                || (x == 9 && y == 9)
                || (x == 9 && y == 0)
                || (x == 0 && y == 9))
                return {
                    shape: 'circle',
                    fillStyle: color,
                    x: spread * x + offset.x + 10,
                    y: spread * y + offset.y + 10,
                    rotation: -.1,
                    radius: radius
                }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var points = features.detectPoints(obj.canvas, { threshold: 1, render: true, color: '#ffff00' });
        var corners = features.detectCorners(points);
        var res = features.read(corners, 10, points);
        //        res.m
        expect(res).toBeTruthy();
        expect(res.length === 100).toBeTruthy();
    });


    it('can get a better targeted corner solution ', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            return {
                shape: 'circle',
                fillStyle: color,
                x: spread * x + offset.x + 10,
                y: spread * y + offset.y + 10,
                rotation: -.1,
                radius: radius
            }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var res = features.detectPoints(obj.canvas, { threshold: 1, render: false, color: '#ffff00' });
        var corners = features.detectCorners(res);
        var newcorners = features.massageCornerSolution(corners, obj.canvas, { color: ['#ffff00', '#f000ff'] });
        //        res.m

        //.then(function (res) {
        var time = (Date.now() - starttime) / 1000;
        console.log('total time ' + time);
        expect(res).toBeTruthy();
        if (corners.topLeft) {
            expect(corners).toBeTruthy();
            expect(corners.topRight).toBeTruthy();
            expect(corners.topLeft).toBeTruthy();
            expect(corners.bottomLeft).toBeTruthy();
            expect(corners.bottomRight).toBeTruthy();
            var mark = '#ffffff';
            radius = 10;

            var b = [0, 0, 1, 0, 0, 1, 1, 1].select(function (x) { return 200 * x; });
            var a = [corners.topLeft.x,
                corners.topLeft.y,
                corners.topRight.x,
                corners.topRight.y,
                corners.bottomLeft.x,
                corners.bottomLeft.y,
                corners.bottomRight.x,
                corners.bottomRight.y];
            var t = Matrix3d.transform2d(a, b);

            var res = Matrix3d.multmv(t, [corners.topRight.x, corners.topRight.y, 1]);
            var finalx = res[0] / res[2];
            var finaly = res[1] / res[2];
            expect(Math.abs(finalx - 200) < 2).toBeTruthy();
            expect(Math.abs(finaly - 0) < 2).toBeTruthy();

            [corners, newcorners].forEach(function (corners, i) {
                obj.renderer.draw([{
                    shape: 'line',
                    color: i ? 'white' : 'red',
                    start: {
                        x: corners.topLeft.x,
                        y: corners.topLeft.y
                    },
                    end: {
                        x: corners.topRight.x,
                        y: corners.topRight.y
                    }
                }, {
                    shape: 'line',
                    color: i ? 'white' : 'red',
                    start: {
                        x: corners.bottomLeft.x,
                        y: corners.bottomLeft.y
                    },
                    end: {
                        x: corners.bottomRight.x,
                        y: corners.bottomRight.y
                    }
                }, {
                    shape: 'line',
                    color: i ? 'white' : 'red',
                    start: {
                        x: corners.topRight.x,
                        y: corners.topRight.y
                    },
                    end: {
                        x: corners.bottomRight.x,
                        y: corners.bottomRight.y
                    }
                }, {
                    shape: 'line',
                    color: i ? 'white' : 'red',
                    start: {
                        x: corners.topLeft.x,
                        y: corners.topLeft.y
                    },
                    end: {
                        x: corners.bottomLeft.x,
                        y: corners.bottomLeft.y
                    }
                }]);
            });


        }
    });

    it('can read features  and massages a better solution into a binary string', function () {
        var obj = createCanvasAndParst({ height: 300, width: 300 });
        var spread = 20, radius, color;
        var rotation = 0;
        obj.renderer.draw([].interpSquare(10, 10, function (x, y) {
            radius = 4;
            color = '#ffff00';
            var offset = {
                x: 20,
                y: 20
            };
            if ((x === 9 && y === 9)) {
                color = '#f000ff';
            }
            if ((x == 0 && y == 0)
                || (x == 4 && y == 3)
                || (x == 9 && y == 9)
                || (x == 9 && y == 0)
                || (x == 0 && y == 9))
                return {
                    shape: 'circle',
                    fillStyle: color,
                    x: spread * x + offset.x + 10,
                    y: spread * y + offset.y + 10,
                    rotation: rotation,
                    radius: radius
                }

            return false;
        }).where());

        var features = new Features();
        var starttime = Date.now();
        var points = features.detectPoints(obj.canvas, { threshold: 1, render: false, color: '#ffff00' });
        var corners = features.detectCorners(points);
        var newcorners = features.massageCornerSolution(corners, obj.canvas, { color: ['#ffff00', '#f000ff'] });
        var res = features.read(newcorners, 10, points);
        //        res.m
        expect(res).toBeTruthy();
        expect(res.length === 100).toBeTruthy();
    });

});