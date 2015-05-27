describe("MEPH/table/SpreadSheet.spec.js", 'MEPH.table.SpreadSheet', function () {
    var ScrollingTable = MEPH.table.ScrollingTable;

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a SpreadSheet", function () {
        //Arrange

        //Assert
        var input = new MEPH.table.SpreadSheet();

        expect(input).toBeTruthy();

    });

    it('can render a SpreadSheet', function (done) {
        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            ///Assert
            dom = scrollingtable.getDomTemplate()[0]
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

    it('can detect a click on a specific cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            var cells;
            scrollingtable.body.addEventListener('cellclicked', function (e) {
                cells = e.cells;
            })
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('click', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can detect a click on a specific top header cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "3";
            scrollingtable.columnheaders = "3";
            scrollingtable.columns = "3";
            scrollingtable.rows = "3";
            var cells;
            scrollingtable.body.addEventListener('topheadercellclicked', function (e) {
                cells = e.cells;
            })
            scrollingtable.topheader.dispatchEvent(MEPH.createEvent('click', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can detect a click on a specific left header cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "3";
            scrollingtable.columnheaders = "3";
            scrollingtable.columns = "3";
            scrollingtable.rows = "3";
            var cells;
            scrollingtable.body.addEventListener('leftheadercellclicked', function (e) {
                cells = e.cells;
            })
            scrollingtable.leftheader.dispatchEvent(MEPH.createEvent('click', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can detect a mouse move on a specific cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            var cells;
            scrollingtable.body.addEventListener('mousemovecell', function (e) {
                cells = e.cells;
            })
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.hovercells).toBeTruthy();
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('can detect a mouse over on a specific cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            var cells;
            scrollingtable.body.addEventListener('mouseovercell', function (e) {
                cells = e.cells;
            })
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can detect a mouse move on a specific top header cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "3";
            scrollingtable.columnheaders = "3";
            scrollingtable.columns = "3";
            scrollingtable.rows = "3";
            var cells;

            scrollingtable.body.addEventListener('mousemovetopheader', function (e) {
                cells = e.cells;
            })
            scrollingtable.topheader.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });
    it('can detect a mouse over on a specific top header cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'spreadsheet').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "3";
            scrollingtable.columnheaders = "3";
            scrollingtable.columns = "3";
            scrollingtable.rows = "3";
            var cells;

            scrollingtable.body.addEventListener('mouseoverheadertop', function (e) {
                cells = e.cells;
            })
            scrollingtable.topheader.dispatchEvent(MEPH.createEvent('mouseover', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });
    it('can detect a mouse over on a specific left header cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'spreadsheet').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "3";
            scrollingtable.columnheaders = "3";
            scrollingtable.columns = "3";
            scrollingtable.rows = "3";
            var cells;

            scrollingtable.body.addEventListener('mouseoverheaderleft', function (e) {
                cells = e.cells;
            })
            scrollingtable.leftheader.dispatchEvent(MEPH.createEvent('mouseover', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can detect a mouse move on a specific left header cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "3";
            scrollingtable.columnheaders = "3";
            scrollingtable.columns = "3";
            scrollingtable.rows = "3";
            var cells;

            scrollingtable.body.addEventListener('mousemoveleftheader', function (e) {
                cells = e.cells;
            })
            scrollingtable.leftheader.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });
    it('can detect a mouse move on a specific top header cell', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "3";
            scrollingtable.columnheaders = "3";
            scrollingtable.columns = "3";
            scrollingtable.rows = "3";
            var cells;

            scrollingtable.body.addEventListener('mousemovetopheader', function (e) {
                cells = e.cells;
            })
            scrollingtable.topheader.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(cells).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('when move is detected a select div is moved and sized appropriateley', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            var cells;
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.activearea).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('when move is detected a select div is moved and sized appropriateley', function (done) {

        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            var cells;
            scrollingtable.topheader.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.activeareatop).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });
    it('can set up a keypress to a command, for executing a command', function (done) {
        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            scrollingtable.commands = [{ key: 'S', command: 'select' }]
            var selectingstarted;
            scrollingtable.canvas.addEventListener('selectstart', function () {
                selectingstarted = true;
            });
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('keypress', { which: 'S'.charCodeAt(0) }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.selecting).toBeTruthy();
                    expect(scrollingtable.state === MEPH.table.SpreadSheet.states.Selecting).toBeTruthy();
                    expect(selectingstarted).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('when the mouse is pressed down will start to select, by setting the select state to selecting', function (done) {
        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            var selectingstarted;
            scrollingtable.canvas.addEventListener('selectstart', function () {
                selectingstarted = true;
            });
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.selecting).toBeTruthy();
                    expect(scrollingtable.state === MEPH.table.SpreadSheet.states.Selecting).toBeTruthy();
                    expect(selectingstarted).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('if the select command is defined by keypress, the mousedown and mouseup will not do anything select related.', function (done) {
        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            scrollingtable.commands = [{ key: 'S', command: 'select' }];
            var selectingstarted;
            scrollingtable.canvas.addEventListener('selectstart', function () {
                selectingstarted = true;
            });
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.selecting).toBeFalsy();
                    expect(scrollingtable.state === null).toBeTruthy();
                    expect(!selectingstarted).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });
    it('when the mouse is pressed down will start to select, by setting the select state to selecting, headers', function (done) {
        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "3";
            scrollingtable.columnheaders = "3";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            var selectingstarted;
            scrollingtable.leftheader.addEventListener('leftselectstart', function () {
                selectingstarted = true;
            });

            scrollingtable.leftheader.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.selecting).toBeTruthy();
                    expect(scrollingtable.state === MEPH.table.SpreadSheet.states.Selectingleft).toBeTruthy();
                    expect(selectingstarted).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('when a mouse is selecting and moves to another cell it will add the second cell to the selcting items.', function (done) {
        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 100, pageY: 100 }));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.selecting).toBeTruthy();
                    expect(scrollingtable.selecting.start).toBeTruthy();
                    expect(scrollingtable.selecting.end).toBeTruthy();
                    expect(scrollingtable.state === MEPH.table.SpreadSheet.states.Selecting).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('when a mouse is selecting and mouseup happens, the selecting is over, and the selected cells are add to a selected array.', function (done) {
        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            scrollingtable.selected = [];
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 100, pageY: 100 }));
            scrollingtable.canvas.dispatchEvent(MEPH.createEvent('mouseup', {}));

            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(scrollingtable.selecting).toBeFalsy();
                    expect(scrollingtable.selectedrange).toBeTruthy();
                    expect(scrollingtable.selected.length > 1).toBeTruthy();
                    expect(scrollingtable.state).toBeFalsy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 150);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can get the most visible column', function () {
        var spreadsheet = new MEPH.table.SpreadSheet();

        var t = spreadsheet.qvisible(300, 0, [].interpolate(0, 10000, function (x) {
            return x * 100;
        }), null, 100);
        expect(t === 3).toBeTruthy();
    });

    it('can use an svg to draw content instead of a canvas ', function () {
        var spreadsheet = new MEPH.table.SpreadSheet();
        spreadsheet.enablesvg = true;
        expect(spreadsheet.svgrenderer).toBeTruthy();
    });

    it('calls the svg renderer when in svg mode for content.', function (done) {
        MEPH.render('MEPH.table.SpreadSheet', 'scrollingtable').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                scrollingtable = results.first().classInstance;
            scrollingtable.rowheaders = "1";
            scrollingtable.enablesvg = true;
            scrollingtable.columnheaders = "1";
            scrollingtable.columns = "26";
            scrollingtable.rows = "1000";
            var called;
            scrollingtable.getMainContentInstructions = function () { return []; };
            scrollingtable.svgrenderer = {
                clear: function () {
                },
                draw: function () {
                    called = true;
                }
            }
            
            scrollingtable.updateCells();
            ///Assert
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(called).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 550);
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

});