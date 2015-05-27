describe("MEPH/math/FFT.spec.js", 'MEPH.math.FFT', function () {
    var FFT;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
        FFT = MEPH.math.FFT;
    });

    it('can create a FFT.', function () {
        var fft = new FFT();

        expect(fft).toBeTruthy();
    });

    it('can execute a fft on an array', function () {
        var fft = new FFT();
        var fftsize = 16;
        var output = new Float32Array(fftsize * 2);
        var outputOffset = 0;
        var outputStride = 1;;
        
        var input = new Float32Array(fftsize);
        input.foreach(function (x, index) {
            input[index] = Math.cos(Math.PI * index / 16);
        })
        var inputOffset = 0;
        var inputStride = 1;
        var type = 'real';

        fft.complex(fftsize, false);
        fft.process(output, outputOffset, outputStride, input, inputOffset, inputStride, type)

        var ifft = new FFT();
        ifft.complex(fftsize, true);
        var output2 = new Float32Array(fftsize * 2);
        ifft.process(output2, inputOffset, inputStride, output, outputOffset, outputStride, false);

        var res = []
        output2.foreach(function (x, index) {
            if (index % 2 === 0)
                res.push((output2[index] / fftsize));
        })

        expect(res.all(function (x, i) {

            return Math.abs(Math.abs(res[i]) - Math.abs(input[i])) < .001;
        })).toBeTruthy();


    });
});