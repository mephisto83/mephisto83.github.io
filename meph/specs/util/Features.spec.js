describe("MEPH/util/Features.spec.js", 'MEPH.util.Features', 'MEPH.util.Renderer', 'MEPH.ringcode.RingCode', function () {
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
            return { shape: 'circle', x: 380 * Math.random() + 10, y: 380 * Math.random() + 10, radius: 20, fillStyle: '#f00fff' }
        }));

        var features = new Features();
        var res = features.detectFeatures(obj.canvas, { threshold: 1, render: false });

        expect(res).toBeTruthy();
        expect(res.corners).toBeTruthy();
        expect(res.count !== undefined).toBeTruthy();
        expect(res.data_u32).toBeTruthy();
        obj.canvas.parentNode.removeChild(obj.canvas);
    });

    it('can find the center of a spiral code', function (done) {
        MEPH.render('MEPH.ringcode.RingCode', 'ringcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var called, dom,
                ringcode = results.first().classInstance;
            ringcode.width = 400;
            var radius = 5;
            ringcode.height = 400;
            ringcode.value = MEPH.GUID().split('-').join('');

            setTimeout(function () {
                ringcode.draw();

                var features = new Features();
                var start = Date.now();
                features.detectRingCodeCenter(ringcode.body, {
                    color: ringcode.centerColor || '#000000',
                    x: 5,
                    y: 5,
                    threshold: 40,
                    render: true
                }).then(function (res) {;
                    var end = Date.now();
                    MEPH.Log((end - start) / 1000);
                    expect(res.length === 1).toBeTruthy();

                    if (res.length) {
                        var renderer = new MEPH.util.Renderer();

                        renderer.setCanvas(ringcode.body);

                        renderer.draw(res.select(function (res) {
                            return {
                                shape: 'circle',
                                x: res.x,
                                y: res.y,
                                radius: res.estimatedRadius || 4
                            }
                        }));
                    }
                    //if (app) {
                    //    app.removeSpace();
                    //}
                    done();
                });
            }, 200);
            ///Assert

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {

        });
    });
});