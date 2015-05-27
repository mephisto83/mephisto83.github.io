describe("MEPH/qrcode/Qrcode.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a qrcode.', function (done) {
        MEPH.create('MEPH.qrcode.Qrcode').then(function ($class) {
            var qrcode = new $class();
            expect(qrcode).theTruth(' no qrcode was created');
        }).catch(function (error) {
            if (error && !error.stack) {
                expect(new Error(error)).caught();
            }
            else if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });;
    });
    it('can decode image ', function (done) {

        var imagepath = MEPH.getPath('dataviews');
        MEPH.create('MEPH.qrcode.Qrcode').then(function ($class) {
            var qrcode = new $class(), toresolve, tofail,
                promise = new Promise(function (resolve, fail) {
                    toresolve = resolve;
                    tofail = fail;
                });
            qrcode.callback = function (str) {
                toresolve(str);
            }
            
            qrcode.decode(imagepath + '/qrcode.png');
            return promise;
        }).then(function (result) {
            expect(result === "http://wiki.developerforce.com/page/Mobile_SDK").theTruth('the incorrect value was found');
        }).catch(function (error) {
            if (error && !error.stack) {
                expect(new Error(error)).caught();
            }
            else if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });;
    });
});