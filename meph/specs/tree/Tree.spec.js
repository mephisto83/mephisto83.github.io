describe("MEPH/tree/Tree.spec.js", function () {
    var createTreeObject = function createTreeObject() {
        var object = {
            data: 1,
            children: [{
                data: 2,
                children: [{
                    data: 3,
                    children: []
                }]
            }]
        };
        return object;
    }
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a tree.', function (done) {
        MEPH.create('MEPH.tree.Tree').then(function ($class) {
            var tree = new $class();
            expect(tree).theTruth('The tree can not be created');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it(' a tree be rendered.', function (done) {
        //Arrange
        var app, div,
            source = [].interpolate(0, 10, function (index) {
                var obj = { prop: 1 };
                MEPH.util.Observable.observable(obj);
                return obj;
            }),
            dom;

        MEPH.requires('MEPH.tree.Tree', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<tree><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></tree>';
            return app.create('MEPH.tree.Tree', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var tree = results.first().classInstance,
                promise;
            ///Assert
            tree.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                    if (app) {
                        app.removeSpace();
                    }
                });
            });
            tree.source = source;
            return promise;
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('a tree can decipher a tree source into an array', function (done) {
        MEPH.create('MEPH.tree.Tree').then(function ($class) {
            var tree = new $class(),
                treeObject = createTreeObject(),
                result;

            result = tree.convertObject(treeObject, function (root) {
                return root.children || [];
            });
            expect(result).theTruth('No result was returned');
            expect(result.length === 3).theTruth('the length wasnt 3');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('a tree can decipher a tree source into an array, and the results will have ferences to it parent and children nodes.', function (done) {
        MEPH.create('MEPH.tree.Tree').then(function ($class) {
            var tree = new $class(),
                treeObject = createTreeObject(),
                result;

            result = tree.convertObject(treeObject, function (root) {
                return root.children || [];
            });
            expect(result).theTruth('No result was returned');
            expect(result.length === 3).theTruth('the length wasnt 3');
            expect(result[1].parent === result[0]).theTruth('The parent was not set');
            expect(result[2].depth === 2).theTruth('The depth was not correctly set');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('a tree can get the depth of the instance by data.', function (done) {
        MEPH.create('MEPH.tree.Tree').then(function ($class) {
            var tree = new $class(),
                sourceInfo,
                treeObject = createTreeObject(),
                result;

            result = tree.convertObject(treeObject, function (root) {
                return root.children || [];
            });
            tree.treeSource = treeObject;

            sourceInfo = tree.getSourceInfo(treeObject);
            expect(sourceInfo.depth === 0).theTruth('the wrong source info was found');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' when a treesource is set , the source will be the result of the converted object', function (done) {
        MEPH.create('MEPH.tree.Tree').then(function ($class) {
            var tree = new $class(),
                treeObject = createTreeObject(),
                results;
            tree.treeSource = treeObject;
            expect(tree.source.length === 3).theTruth('The treesource was not converted correctly.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it(' a tree be rendered.', function (done) {
        //Arrange
        var app, div,
            source = createTreeObject(),
            dom;

        MEPH.requires('MEPH.tree.Tree', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<tree><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></tree>';
            return app.create('MEPH.tree.Tree', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var tree = results.first().classInstance,
                promise;
            ///Assert
            tree.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                    var temp = tree;
                    if (app) {
                        app.removeSpace();
                    }
                });
            });
            tree.treeSource = source;
            return promise;
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });


    it(' a tree be rendered, and depth classes will be applied', function (done) {
        //Arrange
        var app, div,
            source = createTreeObject(),
            dom;

        MEPH.requires('MEPH.tree.Tree', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<tree><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></tree>';
            return app.create('MEPH.tree.Tree', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var tree = results.first().classInstance,
                promise;
            ///Assert
            tree.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                    var temp = tree,
                        items;

                    items = tree.querySelectorAll('.' + tree.$depthPathPrefixCls + 1);
                    
                    expect(items.length === 1).theTruth('The wrong number of items were found in the tree ' + items.length);
                    if (app) {
                        app.removeSpace();
                    }
                });
            });
            //Act
            tree.treeSource = source;
            return promise;
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });
});