describe("MEPH/file/Dropbox.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a drop box", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.file.Dropbox').then(function ($class) {
            //Assert
            var input = new $class();

            expect(input).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('drop box has a depend property call dropboxCls, which will be computed on property change', function (done) {
        //Arrange

        MEPH.create('MEPH.file.Dropbox').then(function ($class) {
            var dropbox = new $class();

            dropbox.componentCls = 'cssclass';

            //Assert
            expect(dropbox.dropboxCls.indexOf('cssclass') !== -1).theTruth('the class wasnt set correctly');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can render a drop box ', function (done) {
        MEPH.render('MEPH.file.Dropbox', 'dropbox').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                iconbutton = results.first().classInstance;
            ///Assert
            dom = iconbutton.getDomTemplate()[0]
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

    it('on dragover the hover class is added.', function (done) {
        MEPH.render('MEPH.file.Dropbox', 'dropbox').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                dropbox = results.first().classInstance;
            dropbox.dragovercssclass = 'hover';

            ///Assert
            dom = dropbox.getDomTemplate()[0];
            dom.dispatchEvent(MEPH.createEvent('dragover'));

            var p = new Promise(function (r, s) {
                setTimeout(function () {
                    expect(dropbox.dropboxCls.indexOf('hover') !== -1).toBeTruthy();

                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 10);
            });

            return p;
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    })

    it('on dragout removes the hover class is added.', function (done) {
        MEPH.render('MEPH.file.Dropbox', 'dropbox').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                dropbox = results.first().classInstance;
            dropbox.hoverCls = 'hover';

            ///Assert
            dom = dropbox.getDomTemplate()[0];
            
            dom.dispatchEvent(MEPH.createEvent('dragout'));

            var p = new Promise(function (r, s) {
                setTimeout(function () {
                    expect(dropbox.dropboxCls.indexOf('hover') === -1).toBeTruthy();

                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 10);
            });

            return p;
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    })

    it('on drop a file is exposed through the file property.', function (done) {
        MEPH.render('MEPH.file.Dropbox', 'dropbox').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom, dropped,
                dropbox = results.first().classInstance;

            ///Assert
            dom = dropbox.getDomTemplate()[0];
            dom.addEventListener('filesdropped', function (x) {
                dropped = true;
            })
            dom.dispatchEvent(MEPH.createEvent('drop', {
                dataTransfer: {
                    files: [{ file: 'file' }]
                }
            }));

            var p = new Promise(function (r, s) {
                setTimeout(function () {
                    expect(dropped).toBeTruthy();

                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 10);
            });

            return p;
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    })

});