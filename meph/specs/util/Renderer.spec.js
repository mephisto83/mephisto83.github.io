describe("MEPH/util/Renderer.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a renderer', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            var renderer = new $class();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    })
    it('assign a canvas', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            //Arrange
            var renderer = new MEPH.util.Renderer();
            var canvas = document.createElement('canvas');
            canvas.height = 300;
            canvas.width = 300;

            //Act
            renderer.setCanvas(canvas);

            //Assert
            expect(renderer.getCanvas()).toBeTruthy();
            expect(renderer.getCanvas(), canvas).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    })

    it('can set a canvas to be the render target ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            var renderer = new $class(), canvas;
            canvas = document.createElement('canvas');
            renderer.setCanvas(canvas);
            expect(renderer.getCanvas() === canvas).theTruth('the incorrect canvas was found');
            expect(renderer.getContext()).theTruth('No context was found');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('can draw ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            var renderer = new $class(), canvas, success, div;
            canvas = document.createElement('canvas');
            canvas.setAttribute('width', 400);
            canvas.setAttribute('height', 300);
            div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.top = '0px';
            div.style.zIndex = 1000;
            div.appendChild(canvas);
            document.body.appendChild(div);

            renderer.setCanvas(canvas);

            success = renderer.draw([{ x: 40, y: 40, radius: 100, shape: MEPH.util.Renderer.shapes.circle }]);
            div.parentNode.removeChild(div);
            expect(success).theTruth('Didnt draw successfully');
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('get context from canvas ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {

            //Arrange
            var renderer = new $class();
            var canvas = document.createElement('canvas');
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act
            var context = renderer.getContext();

            //Assert
            expect(context).toBeTruthy();
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('clear canvas ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            //Arrange
            var renderer = new $class();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act

            renderer.clear();

            //Assert

            canvas.parentNode.removeChild(canvas);

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('draw rectangle ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            //Arrange
            var renderer = new $class();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act
            var result = renderer.draw({ shape: 'rectangle' });
            //Assert
            expect(result).toBeTruthy();

            canvas.parentNode.removeChild(canvas);
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('draw rectangle yellow ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            //Assert  //Arrange
            var renderer = new $class();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act
            var result = renderer.draw({ shape: 'rectangle', fillStyle: 'yellow' });

            canvas.parentNode.removeChild(canvas);
            expect(result).toBeTruthy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });
    it('draw circle yellow ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            //Assert  //Arrange
            //Arrange
            var renderer = new $class();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act
            var result = renderer.draw({ shape: 'circle', fillStyle: 'yellow', radius: 30, x: 100, y: 100 });
            //Assert
            canvas.parentNode.removeChild(canvas);

            expect(result).toBeTruthy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('draw blue text ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            //Assert  //Arrange
            //Arrange
            var renderer = new $class();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act
            var result = renderer.draw({
                text: 'Text',
                shape: 'text',
                fillStyle: 'blue',
                radius: 30,
                x: 100,
                y: 100
            });
            //Assert
            canvas.parentNode.removeChild(canvas);

            expect(result).toBeTruthy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('draw multiple things ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {

            var renderer = new $class();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act
            var result = renderer.draw([{
                shape: 'rectangle',
                fillStyle: 'grey',
                x: 10,
                y: 10,
                width: 100,
                height: 200,
                radius: 4
            }, {
                text: 'Text',
                shape: 'text',
                fillStyle: 'blue',
                radius: 30,
                x: 14,
                y: 14
            }, { shape: 'circle', fillStyle: 'yellow', radius: 3, x: 90, y: 70 }, {
                text: 'Text',
                shape: 'text',
                fillStyle: 'blue',
                radius: 30,
                x: 14,
                y: 14
            }]);
            //Assert
            canvas.parentNode.removeChild(canvas);


            expect(result).toBeTruthy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;

    });

    it('Draw line ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {

            //Arrange
            var renderer = new $class();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act
            var result = renderer.draw({
                shape: 'line',
                fillStyle: 'yellow',
                start: {
                    x: 0,
                    y: 0
                },
                end: {
                    x: 300,
                    y: 300
                }
            });
            //Assert
            expect(result).toBeTruthy();
            canvas.parentNode.removeChild(canvas);
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    
    it('Draw line ', function (done) {
        MEPH.create('MEPH.util.Renderer').then(function ($class) {
            //Arrange
            var renderer = new $class();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            renderer.setCanvas(canvas);

            //Act
            var result = renderer.draw({
                shape: 'line',
                strokeStyle: 'yellow',
                start: {
                    x: 100,
                    y: 0
                },
                end: {
                    x: 300,
                    y: 300
                }
            });
            //Assert
            expect(result).toBeTruthy();
            canvas.parentNode.removeChild(canvas);
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });
});