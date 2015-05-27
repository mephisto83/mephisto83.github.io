/**
 * @class MEPH.audio.sbsms.Util
 **/
MEPH.define('MEPH.audio.sbsms.Util', {
    statics: {
        ONOVERTWOPI: 0.15915494309189533576888376337251,
        PI: 3.1415926535897932384626433832795,
        TWOPI: 6.28318530717958647692528676655900576,
        //audio *eo, audio *even, int N
        c2even: function (eo, even, N) {
            var Nover2 = N / 2;
            even[0][0] = eo[0][0];
            even[0][1] = 0.0;
            for (var k = 1; k <= Nover2; k++) {
                var Nk = N - k;
                even[k][0] = 0.5 * (eo[k][0] + eo[Nk][0]);
                even[k][1] = 0.5 * (eo[k][1] - eo[Nk][1]);
            }
        },

        //audio *eo, audio *odd, int N
        c2odd: function (eo, odd, N) {
            var Nover2 = N / 2;
            odd[0][0] = eo[0][1];
            odd[0][1] = 0.0;
            for (var k = 1; k <= Nover2; k++) {
                var Nk = N - k;
                odd[k][0] = 0.5 * (eo[k][1] + eo[Nk][1]);
                odd[k][1] = 0.5 * (eo[Nk][0] - eo[k][0]);
            }
        },
        ///float ph
        canonPI: function (ph) {
            var U = MEPH.audio.sbsms.Util;
            ph -= U.TWOPI * (ph * U.ONEOVERTWOPI);//lrintf(ph * U.ONEOVERTWOPI);
            if (ph < -U.PI) ph += U.TWOPI;
            else if (ph >= U.PI) ph -= U.TWOPI;
            return ph;
        },

        //float ph
        canon2PI: function (ph) {
            var U = MEPH.audio.sbsms.Util;
            ph -= U.TWOPI * (ph * U.ONEOVERTWOPI);//lrintf(ph * ONEOVERTWOPI);
            if (ph < 0.0) ph += U.TWOPI;
            if (ph >= U.TWOPI) ph -= U.TWOPI;
            return ph;
        },


        //float x
        square: function (x) {
            return x * x;
        },
        //t_fft x
        norm2: function (x) {
            var U = MEPH.audio.sbsms.Util;
            return U.square(x[0]) + U.square(x[1]);
        }

    }
}).then(function () {
    window.lrintf = Math.round;
    window.lrint = Math.round;
    window.float2int = Math.floor;
    window.double2int = Math.floor;
})