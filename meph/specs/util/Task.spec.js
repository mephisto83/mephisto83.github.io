describe("MEPH/util/Task.spec.js", 'MEPH.util.Task', function () {
    var Task = MEPH.util.Task;

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a util", function () {
        //Arrange

        //Assert
        var util = new Task();

        expect(util).toBeTruthy();

    });

    it('can make an array taskable', function () {
        var array = [];
        Task.taskable(array);
        expect(array.task).toBeTruthy();
    });

    it('can select from an array ', function (done) {
        var array = [].interpolate(0, 1000, function (x) { return x; });
        Task.taskable(array);
        array.task.select(function (x) { return x + 1; }).then(function (res) {
            expect(res.length === 1000).toBeTruthy();
            expect(res[0] === 1).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('subset', function (done) {
        var array = [].interpolate(0, 1000, function (x) { return x; });
        Task.taskable(array);
        array.task.subset(1, 10).then(function (res) {
            expect(res.length === 9).toBeTruthy();
            expect(res[0] === 1).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('where', function (done) {
        var array = [].interpolate(0, 1000, function (x) { return x; });
        Task.taskable(array);
        array.task.where(function (x) { return x == 3; }).then(function (res) {
            expect(res.length === 1).toBeTruthy();
            expect(res[0] === 3).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });
});