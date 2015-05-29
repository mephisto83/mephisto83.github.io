describe("MEPH/util/String.spec.js", 'MEPH.util.String', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    it("Can identify a number pattern in a string.", function () {
        //Arrange
        var str = 'Double Bass Pizz-029-f0';

        //Act
        var number = str.getNumber('###');

        //Assert
        expect(number === 29).toBeTruthy();
    });

});