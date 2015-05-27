describe("MEPH/gpu/Context.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("Creates a gpu context.", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.gpu.Context').then(function ($class) {
            //Assert
            var context = new $class()

            expect(context !== null).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });

    });
    it('gpu will construct a command object on select', function (done) {
        MEPH.create('MEPH.gpu.Context').then(function ($class) {
            //Assert
            var context = new $class();
            var commandObject = context.select({ prop: 'float' });
            expect(commandObject).toBeTruthy();
            expect(commandObject.command === 'select').toBeTruthy();
            expect(commandObject.arguments[0].name === 'prop').toBeTruthy();
            expect(commandObject.arguments[0].type === 'float').toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('gpu context, create function', function (done) {
        MEPH.create('MEPH.gpu.Context').then(function ($class) {
            var context = new $class();
            context.function('testFunction', { type: 'texture2d', name: 'parameter1' });
            var textfunc = context.getFunction('testFunction');
            expect(textfunc).toBeTruthy();
            expect(textfunc.name === 'testFunction').toBeTruthy();
            expect(textfunc.parameters.first().name === 'parameter1').toBeTruthy();
            expect(textfunc.parameters.first().type === 'texture2d').toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can add functions to a gpu context function', function (done) {
        MEPH.create('MEPH.gpu.Context').then(function ($class) {
            var context = new $class();
            context.function('testFunction', { type: 'texture2d', name: 'parameter1' })
                    .select({ prop: 'float' });
            var textfunc = context.getFunction('testFunction');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('gpu context will accept commands', function (done) {
        MEPH.create('MEPH.gpu.Context').then(function ($class) {
            //Assert
            var context = new $class();
            var command = context.command(context.select({ prop: 'float' }), 'parameter');
            expect(command).toBeTruthy();
            expect(command.command).toBeTruthy();
            expect(command.jsInputs).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });



});