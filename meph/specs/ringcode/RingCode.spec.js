describe("MEPH/ringcode/RingCode.spec.js", 'MEPH.ringcode.RingCode', function () {
    var RingCode = MEPH.ringcode.RingCode;

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a ringcode", function () {
        //Arrange

        //Assert
        var ringcode = new RingCode();

        expect(ringcode).toBeTruthy();

    });


    it('can render a ringcode', function (done) {
        MEPH.render('MEPH.ringcode.RingCode', 'ringcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollbar = results.first().classInstance;
            ///Assert
            dom = scrollbar.getDomTemplate()[0]
            expect(dom).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('can set the width and height', function (done) {
        MEPH.render('MEPH.ringcode.RingCode', 'ringcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                ringcode = results.first().classInstance;
            ///Assert
            dom = ringcode.getDomTemplate()[0]
            expect(dom).toBeTruthy();
            ringcode.width = 400;
            ringcode.height = 500;
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(dom.width == 400).toBeTruthy();
                    expect(dom.height == 500).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 100);
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('has a renderer', function (done) {
        MEPH.render('MEPH.ringcode.RingCode', 'ringcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                ringcode = results.first().classInstance;
            ///Assert
            dom = ringcode.getDomTemplate()[0]
            expect(dom).toBeTruthy();
            expect(ringcode.getRenderer()).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('can draw a set of characters into a ridngcode', function (done) {
        MEPH.render('MEPH.ringcode.RingCode', 'ringcode').then(function (r) {
            var results = r.res;
            var app = r.app;

            var called, dom,
                ringcode = results.first().classInstance;
            ringcode.centerPointRadius = 20;
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

    it("will have default colors", function () {
        //Arrange

        //Assert
        var ringcode = new RingCode();

        expect(ringcode).toBeTruthy();
        expect(ringcode.colors).toBeTruthy();
        expect(ringcode.colors.length).toBeTruthy();

    });


    it('can draw a set of characters into a ringcode', function (done) {
        MEPH.render('MEPH.ringcode.RingCode', 'ringcode').then(function (r) {
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
            ///Assert

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


});