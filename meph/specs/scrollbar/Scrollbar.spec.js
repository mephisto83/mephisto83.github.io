describe("MEPH/scrollbar/Scrollbar.spec.js", 'MEPH.scrollbar.Scrollbar', function () {
    var Scrollbar = MEPH.scrollbar.Scrollbar;

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a scrollbar", function () {
        //Arrange

        //Assert
        var scrollbar = new MEPH.scrollbar.Scrollbar();

        expect(scrollbar).toBeTruthy();

    });

    it('can render a scrollbar', function (done) {
        MEPH.render('MEPH.scrollbar.Scrollbar', 'scrollbar').then(function (r) {
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

    it('on mouse down the state goes to dragging.', function (done) {
        MEPH.render('MEPH.scrollbar.Scrollbar', 'scrollbar').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollbar = results.first().classInstance;
            ///Assert
            dom = scrollbar.getDomTemplate()[0];

            scrollbar.handle.dispatchEvent(MEPH.createEvent('mousedown', { offsetX: 4, offsetY: 4 }));
            expect(scrollbar.state).toBe('dragging')
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on dragging 4px the bar is move , and the location is changed', function (done) {
        MEPH.render('MEPH.scrollbar.Scrollbar', 'scrollbar').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollbar = results.first().classInstance;

            ///Assert
            scrollbar.horizontal = true;
            scrollbar.handle.dispatchEvent(MEPH.createEvent('mousedown', { screenX: 4, screenY: 4 }));

            expect(scrollbar.start_position).toBe(4);
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on mouse up the state goes to nothing.', function (done) {
        MEPH.render('MEPH.scrollbar.Scrollbar', 'scrollbar').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollbar = results.first().classInstance;
            ///Assert
            dom = scrollbar.getDomTemplate()[0];

            scrollbar.handle.dispatchEvent(MEPH.createEvent('mousedown', { offsetX: 4, offsetY: 4 }));
            expect(scrollbar.state).toBe('dragging')
            document.body.dispatchEvent(MEPH.createEvent('mouseup', { offsetX: 4, offsetY: 4 }));
            expect(scrollbar.state).toBe(null)
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on mouse click on the bar , the position will shift in that direction half', function (done) {
        MEPH.render('MEPH.scrollbar.Scrollbar', 'scrollbar').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom, called,
                scrollbar = results.first().classInstance;
            ///Assert
            dom = scrollbar.getDomTemplate()[0];
            scrollbar.setBarPosition = function () {
                called = true;
            }
            scrollbar.bar.dispatchEvent(MEPH.createEvent('click', { offsetX: 4, offsetY: 4 }));
            expect(called).toBe(true)
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('bar doesnt react to clicks on the handle', function (done) {
        MEPH.render('MEPH.scrollbar.Scrollbar', 'scrollbar').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom, called,
                scrollbar = results.first().classInstance;
            ///Assert
            dom = scrollbar.getDomTemplate()[0];
            scrollbar.setBarPosition = function () {
                called = true;
            }
            scrollbar.handle.dispatchEvent(MEPH.createEvent('click', { offsetX: 4, offsetY: 4 }));
            expect(called).toBe(undefined)
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('horizontal scrollbar will have a height, .', function (done) {
        MEPH.render('MEPH.scrollbar.Scrollbar', 'scrollbar').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollbar = results.first().classInstance;
            scrollbar.horizontal = true;

            ///Assert

            expect(scrollbar.bar.clientHeight).toBeTruthy();
            expect(scrollbar.bar.clientWidth).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('setting the virtual width will control the scrollbar handle, .', function (done) {
        MEPH.render('MEPH.scrollbar.Scrollbar', 'scrollbar').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom, minimum = 30,
                scrollbar = results.first().classInstance;
            Style.width(scrollbar.bar, 1000);
            scrollbar.minhandlesize = minimum;
            scrollbar.virtualsize = 2000;
            scrollbar.horizontal = true;

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {

                    expect(scrollbar.handle.clientWidth).toBe(500);

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
});