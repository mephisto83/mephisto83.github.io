describe("MEPH/field/FormField.spec.js", function () {

      beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a form field", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.field.FormField').then(function ($class) {
            //Assert
            var input = new $class();

            expect(input).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('form filed has a depend property call formFieldCls, which will be computed on property change', function (done) {
        //Arrange

        MEPH.create('MEPH.field.FormField').then(function ($class) {
            var input = new $class();
            
            input.componentCls = 'cssclass';

            //Assert
            expect(input.formFieldCls === 'form-control cssclass').theTruth('the class wasnt set correctly');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

});