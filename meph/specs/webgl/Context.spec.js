describe("MEPH/webgl/Context.spec.js", function () {
    var createContext = function (initialize) {
        var context = new MEPH.webgl.Context();
        if (initialize) {
            var canvas = document.createElement('canvas');
            context.init(canvas);
        }
        return context;
    }
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a context.', function (done) {
        MEPH.create('MEPH.webgl.Context').then(function ($class) {
            var context = new $class();
            expect(context).theTruth('The context can not be created');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });


    it('can initialize a canvas and set it to the context', function (done) {

        MEPH.create('MEPH.webgl.Context').then(function ($class) {
            var canvas;
            canvas = document.createElement('canvas');
            var context = new $class();
            context.init(canvas);
            expect(context.context).theTruth('The context is not set');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('can clear context', function (done) {

        MEPH.requires('MEPH.webgl.Context').then(function ($class) {
            var context = createContext(true), colorcleared;
            context.context = {
                clearColor: function () {
                    colorcleared = true;
                },
                clear: function () {
                }
            }
            context.clear();
            expect(colorcleared).theTruth('The color was not cleared.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('can set params when getting context', function (done) {
        var parms = {
            alpha: true,
            stencil: false,
            antialias: true,
        }
        MEPH.requires('MEPH.webgl.Context').then(function ($class) {
            var context = new MEPH.webgl.Context();
            var canvas = document.createElement('canvas');
            context.init(canvas, parms);
            expect(context.context).theTruth('The color was not cleared.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('allocate a texture of 400 x 400', function (done) {

        MEPH.requires('MEPH.webgl.Context').then(function ($class) {
            var context = new MEPH.webgl.Context();
            var canvas = document.createElement('canvas');
            context.init(canvas);
            var height = 256;
            var width = 256;

            var length = context.getSizeNeeded(height, width, 4);
            //Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 4;//
            var data = new Float32Array(length);
            var texture = context.createTexture({ height: height, width: width, type: 'float', textureData: data });
            expect(texture).toBeTruthy();
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('create float texture short cut ', function (done) {
        MEPH.requires('MEPH.webgl.Context').then(function ($class) {
            var context = new MEPH.webgl.Context();
            var canvas = document.createElement('canvas');
            context.init(canvas);
            var height = 256;
            var width = 256;
            var data = new Float32Array(context.getSizeNeeded(width, height, 4));
            var texture = context.createFloatTexture({ height: height, width: width, textureData: data });
            expect(texture).toBeTruthy();
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('can set view port size ', function (done) {
        MEPH.requires('MEPH.webgl.Context').then(function ($class) {
            var context = new MEPH.webgl.Context();
            var canvas = document.createElement('canvas');
            context.init(canvas);
            var viewport = context.viewport(0, 0, 256, 255);
            expect(viewport.x === 0).toBeTruthy()
            expect(viewport.y === 0).toBeTruthy();
            expect(viewport.width === 256).toBeTruthy();
            expect(viewport.height === 255).toBeTruthy();
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('create create a shaderProgram', function (done) {
        var shaderfs;
        
        var shadervs;
        MEPH.getSource('MEPHTests.data.shader.fs.shader-fs', '.html').then(function (result) {
            shaderfs = (result);
        }).then(function () {
            return MEPH.getSource('MEPHTests.data.shader.vs.shader-vs', '.html').then(function (result) {
                shadervs = result;
            });
        }).then(function () {
            return MEPH.create('MEPH.webgl.Context').then(function ($class) {
                var context = new $class();
                var canvas = document.createElement('canvas');
                context.init(canvas);
                var program = context.createShaderProgram(shaderfs, shadervs);
                expect(program).toBeTruthy();
            })
        }).catch(function (er) {
            expect(er).caught();
        }).then(function () {
            done();
        });
    })

    it('create render buffer context with float  ', function (done) {

        MEPH.create('MEPH.webgl.Context').then(function ($class) {
            var context = new $class();
            var canvas = document.createElement('canvas');
            context.init(canvas);
            var height = 256;
            var width = 256;
            var texture = context.createRenderBuffer({ height: height, width: width, type: 'float' });
            expect(texture).toBeTruthy();
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('create frame buffer', function (done) {

        MEPH.create('MEPH.webgl.Context').then(function ($class) {
            var context = new $class();
            var canvas = document.createElement('canvas');
            context.init(canvas);
            var height = 256;
            var width = 256;
            var texture = context.createFloatTexture({ height: height, width: width });
            var framebuffer = context.createFrameBuffer(texture);
            expect(texture).toBeTruthy();
            expect(framebuffer).toBeTruthy();
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('Can detect if I can render to floating point textures?', function (done) {
        MEPH.create('MEPH.webgl.Context').then(function ($class) {
            var context = new $class();
            var canvas = document.createElement('canvas');
            context.init(canvas);
            var canrender = context.can('renderfloatingpointtextures');
            expect(canrender).toBeTruthy();
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });
});