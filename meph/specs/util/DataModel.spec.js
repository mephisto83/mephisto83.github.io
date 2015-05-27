describe("MEPH/util/DataModel.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('will add validation rules to an object.', function (done) {
        MEPH.requires('MEPH.util.DataModel').then(function () {
            var called, obj = MEPH.util.DataModel.model({ prop: 'prop' }, [{
                path: 'prop',
                rule: function (obj, path, params) {
                    called = true;
                    return true;
                }
            }]);
            obj.prop = 'newvalue';
            expect(called).theTruth('the validatoin rule wasnt called');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('will not add the same rule more that once ', function (done) {
        MEPH.requires('MEPH.util.DataModel').then(function () {
            var therule = function (obj, path, params) {
                called = true;
                return true;
            },
            called,
            obj = MEPH.util.DataModel.model({ prop: 'prop' }, [{
                path: 'prop',
                rule: therule
            }]);
            MEPH.util.DataModel.model(obj, [{
                path: 'prop',
                rule: therule
            }])
            expect(MEPH.util.Validatable.getRules(obj).length === 1).theTruth('there were not the correct number of validations.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('when passed an array, the items will have the rules applied to each', function (done) {
        MEPH.requires('MEPH.util.DataModel').then(function () {
            var therule = function (obj, path, params) {
                called = true;
                return true;
            }, array,
            called;
            array = [].interpolate(0, 10, function (index) {
                return { prop: 'prop', index: index };
            });
            MEPH.util.DataModel.model(array, [{
                path: 'prop',
                rule: therule
            }]);
            expect(MEPH.util.Validatable.getRules(array.first()).length === 1).theTruth('there were not the correct number of validations.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
});