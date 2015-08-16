﻿describe("MEPH/util/Features.spec.js", 'MEPH.util.Features', 'MEPH.util.Renderer', 'MEPH.ringcode.RingCode', function () {
    var Features = MEPH.util.Features;

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
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


    it('can detect corners ', function () {
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
        obj.canvas.parentNode.removeChild(obj.canvas);
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
});