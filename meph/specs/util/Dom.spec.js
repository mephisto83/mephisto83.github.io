describe("MEPH/util/Dom.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    it("Comment nodes can be found within html dom.", function () {
        //Arrange
        var dom = '<div><!-- comment --></div>';
        var element = document.createElement('div');
        element.innerHTML = dom;

        //Act
        var comments = MEPH.util.Dom.getComments(element);

        //Assert
        expect(comments).toBeTruthy();
        expect(comments.length === 1).toBeTruthy();
    });
});