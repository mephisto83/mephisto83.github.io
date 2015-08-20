describe("MEPH/code/DotCode.spec.js", 'MEPH.code.DotCode', function () {
    var DotCode = MEPH.code.DotCode;

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a DotCode", function () {
        //Arrange

        //Assert
        var dotCode = new DotCode();

        expect(dotCode).toBeTruthy();

    });


    it('can convert 00 into binary', function () {

        var dotcode = new DotCode();

        var res = dotcode.convertCode('00');
        expect(res.length === 8).toBeTruthy();
        expect(res.split('').all(function (x) { return x === '0'; })).toBeTruthy();
    });


    it('can convert ff into binary', function () {

        var dotcode = new DotCode();

        var res = dotcode.convertCode('ff');
        expect(res.length === 8).toBeTruthy();
        expect(res.split('').all(function (x) { return x === '1'; })).toBeTruthy();
    });

    it('can convert a guid into binary and back', function () {

        var dotcode = new DotCode();

        var res = dotcode.convertCode(MEPH.GUID().split('-').join(''));
        expect(res.length === 32 * 4).toBeTruthy();

    });

    it('can draw a guid into a dotcode', function (done) {
        MEPH.render('MEPH.code.DotCode', 'dotcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var called, dom,
                ringcode = results.first().classInstance;
            ringcode.getRenderer().draw = function (commands) {
                expect(commands.length).toBeTruthy();
                called = true;
            }
            ringcode.value = MEPH.GUID().split('-').join('');
            ringcode.draw();
            ///Assert
            dom = ringcode.getDomTemplate()[0]
            expect(called).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('can draw a guid into a dotcode', function (done) {
        MEPH.render('MEPH.code.DotCode', 'dotcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var called, dom,
                ringcode = results.first().classInstance;
            ringcode.width = 400;
            ringcode.height = 400;

            ringcode.value = MEPH.GUID().split('-').join('');
            setTimeout(function () {
                ringcode.draw();
            }, 200);

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can draw a guid into a dotcode', function (done) {
        MEPH.render('MEPH.code.DotCode', 'dotcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var called, dom,
                ringcode = results.first().classInstance;
            ringcode.width = 400;
            ringcode.height = 400;

            ringcode.value = [].interpolate(0, 32, function () { return 0; }).join('');
            setTimeout(function () {
                ringcode.draw();
            }, 200);

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can draw a guid into a dotcode', function (done) {
        MEPH.render('MEPH.code.DotCode', 'dotcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var called, dom,
                ringcode = results.first().classInstance;
            ringcode.width = 400;
            ringcode.height = 400;

            ringcode.value = [].interpolate(0, 32, function () { return 'b'; }).join('');
            setTimeout(function () {
                ringcode.draw();
            }, 200);

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can draw a guid into a dotcode', function (done) {
        MEPH.render('MEPH.code.DotCode', 'dotcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var called, dom,
                ringcode = results.first().classInstance;
            ringcode.width = 400; 
            ringcode.height = 400;

            ringcode.value = MEPH.GUID().split('-').join('');
            setTimeout(function () {
                ringcode.draw();
            }, 200);

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });
});