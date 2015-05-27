describe("MEPH/signalprocessing/Spectrogram.spec.js", 'MEPH.signalprocessing.Spectrogram', function () {
    var SignalProcessor = MEPH.signalprocessing.SignalProcessor;

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    var createSin = function (length) {
        var input = new Float32Array(length);
        input.foreach(function (x, index) {
            input[index] = Math.cos(Math.PI * index / 16);
        });
        return input;
    }

    it("can create a Spectrogram", function () {
        //Arrange

        //Assert
        var spectrogram = new MEPH.signalprocessing.Spectrogram();

        expect(spectrogram).toBeTruthy();
    });

    it('a signal can be processed', function () {
        var spectrogram = new MEPH.signalprocessing.Spectrogram();
        spectrogram.source = createSin(10000);
        var res = spectrogram.process(spectrogram.source);
        expect(res).toBeTruthy();
    });

    it('can render a spectrogram', function (done) {
        MEPH.render('MEPH.signalprocessing.Spectrogram', 'spectrogram').then(function (r) {
            var called,
                results = r.res;
            var app = r.app;

            var dom,
                spectrogram = results.first().classInstance;
            ///Assert
            dom = spectrogram.getDomTemplate().first()
            var data = spectrogram.process(createSin(10000));
            spectrogram.render = function () {
                called = true;
            }
            spectrogram.data = data;
            expect(called).toBeTruthy();
            expect(dom).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });
});