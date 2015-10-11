/**
 * @class MEPH.math.Util
 * Describes mathematical expressions.
 *
 **/
MEPH.define('MEPH.math.Util', {
    statics: {
        clamp: function (max, min, val) {
            return Math.min(max, Math.max(min, val));
        },
        random: function (min, max) {
            return min + (Math.random() * (max - min));
        },
        dimensionClamp: function (h, w, max) {
            var size = Math.max(h, w, max);
            if (size > max) {
                var ratio = Math.max(w / max, h / max);
                h = h / ratio;
                w = w / ratio;
            }
            return {
                height: h,
                width: w
            }
        },
        distance: function (a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        },
        cachedPrimes: null,
        polar: function (x, y) {
            return {
                radius: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                theta: Math.atan2(y, x)
            }
        },
        rectangular: function (theta, radius) {
            return {
                x: radius * Math.cos(theta),
                y: radius * Math.sin(theta)
            }
        },
        /**
         * Generate the main lobe of a sinc function (Dirichlet kernel)
         * @param {Array} x 
         * Array of indices to compute.
         * @param {Number} N
         * Size of FFT to simulate.
         * @return {Array} 
         * Samples of the main lobe of a sinc function
         ***/
        sinc: function (x, N) {
            return [].interpolate(0, N, function (t) {
                var res = Math.sin(N * x[t] / 2) / Math.sin(x[t] / 2);
                if (isNaN(res)) {
                    return N;
                }
                return res;
            });
        },
        sec: function (num) {
            return 1 / Math.cos(num);
        },
        csc: function (num) {
            return 1 / Math.sin(num);
        },
        cot: function (num) {
            return 1 / Math.tan(num);
        },
        sinh: function (num) {
            return (Math.exp(num) - Math.exp(-num)) / 2;
        },
        cosh: function (num) {
            return (Math.exp(num) + Math.exp(-num)) / 2;
        },
        tanh: function (x) {
            return (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
        },
        sech: function (num) {
            return 1 / MEPH.math.Util.cosh(num);
        },
        coth: function (num) {
            return 1 / MEPH.math.Util.tanh(num);
        },
        csch: function (num) {
            return 1 / MEPH.math.Util.sinh(num);
        },
        /**
         * n mathematics, the factorial of a non-negative integer n, denoted by n!, is the product of all positive integers less than or equal to n.
         * http://en.wikipedia.org/wiki/Factorial
         * Calculates the factorial of num.
         **/
        factorial: function (num) {
            var result = 1;
            [].interpolate(1, num + 1, function (x) {
                result = result * x;
            });
            return result;
        },
        /**
         * Returns the primes up to the passed value.
         * @param {Number} val
         **/
        primes: function (val) {
            MEPH.math.Util.cachedPrimes = MEPH.math.Util.cachedPrimes || [2, 3];
            var cachedPrimes = MEPH.math.Util.cachedPrimes;
            var last = MEPH.math.Util.cachedPrimes.last();
            if (last >= val) {
                return MEPH.math.Util.cachedPrimes.where(function (x) { return val >= x; });
            }
            for (var i = last + 2; i <= (val) ; i = i + 2) {
                if (cachedPrimes.all(function (x) { return i % x !== 0; })) {
                    cachedPrimes.push(i);
                }
            }
            return cachedPrimes;
        },
        /**
         * Factors an integer into its basic parts.
         * @param {Number} val
         * @returns {Array}
         **/
        factor: function (val) {
            var Util = MEPH.math.Util,
                result = [1];
            var primes = Util.primes(val);
            var v = val;
            while (!primes.contains(function (x) { return x === v; }) && v % 1 == 0) {
                var prime = primes.first(function (x) { return v % x === 0; });
                result.push(prime);
                v /= prime;
            }
            result.push(v);
            return result;
        },
        /**
         * Generates the main lobe of a Blackman-Harris window
         * @param {Array} x
         * Bin positions to compute.
         * @param {Number} fftsize
         * @return {Array}
         * Main lob as spectrum of a Blackman-Harris window
         ***/
        getBhLobe: function (x, fftsize) {
            var N = fftsize || 512;
            var f = x.select(function (t) {
                return t * Math.PI * 2 / N;
            });
            var df = Math.PI * 2 / N;
            var y = [].interpolate(0, x.length, function () {
                return 0;
            });

            var consts = [0.35875, 0.48829, 0.14128, 0.01168];
            [].interpolate(0, consts.length, function (m) {
                var sincs1 = MEPH.math.Util.sinc(f.select(function (ft) { return ft - df * m }), N);
                var sincs2 = MEPH.math.Util.sinc(f.select(function (ft) { return ft + df * m; }), N);
                y = y.select(function (y, y0) {
                    return y + (consts[m] / 2) * (sincs1[y0] + sincs2[y0]);
                });
            });
            y = y.select(function (t) { return t / N / consts[0]; });
            return y;
        },
        window: {
            /**
             * http://en.wikipedia.org/wiki/Window_function#Spectral_analysis
             * Triangular windows are given by: w(n)=1 - \left|\frac{n-\frac{N-1}{2}}{\frac{L}{2}}\right|,
             * where L can be N,[8][16] N+1,[17] or N-1.[18] The last one is also known as Bartlett window. All three definitions converge at large N.
             * The triangular window is the 2nd order B-spline window and can be seen as the convolution of two half-sized rectangular windows, giving it twice the width of the regular windows.
             ****/
            Triangle: function (plus, index, end) {
                var L = end + plus;
                var v = 1 - Math.abs(((index - ((end - 1) / 2)) / (L / 2)));
                return v;
            },
            Triang: function (n, N) {
                var sym = true;
                if (N < 1)
                    return [];
                if (N === 1) {
                    return [1];
                }
                var odd = N % 2;
                if (!sym && !odd) {
                    N += 1;
                }
                var ns = [].interpolate(1, Math.floor((N + 1) / 2) + 1, function (t) {
                    return t;
                });
                var w;
                if (N % 2 === 0) {
                    w = ns.select(function (n) {
                        return ((n * 2) - 1) / N;
                    });
                    w = w.select().concat(w.select().reverse());
                }
                else {
                    w = ns.select(function (t) {
                        return (2 * t) / (N + 1);
                    });

                    w = w.select().concat(w.select().reverse());
                }
                return w;
            },
            Rect: function (n, N) {
                var t = Math.abs(n / N);
                if (t > 0.5) {
                    return 0;
                }
                else if (t === .5) {
                    return .5
                }
                else if (t < .5) {
                    return 1;
                }
            },
            Rectangle: function (index, end) {
                return 1;
            },
            Welch: function (n, N) {
                return 1 - Math.pow(((n - ((N - 1) / 2)) / ((N + 1) / 2)), 2);
            },
            Hann: function (a, b, n, N) {
                return a - (b * Math.cos((2 * Math.PI * n) / (N - 1)));
            },
            Hamming: function (n, N) {
                return MEPH.math.Util.window.Hann(.54, .46, n, N);
            },
            Blackman: function (n, N) {
                var a0 = 0.42;
                var a1 = .5;
                var a2 = 0.08;
                return a0 -
                        (a1 * Math.cos((2 * Math.PI * n) / (N - 1))) +
                        (a2 * Math.cos((4 * Math.PI * n) / (N - 1)));
            },
            BlackmanHarris: function (n, N) {
                var a0 = 0.35875;
                var a1 = 0.48829;
                var a2 = 0.14128;
                var a3 = 0.01168;
                return a0 -
                        (a1 * Math.cos((2 * Math.PI * n) / (N - 1))) +
                        (a2 * Math.cos((4 * Math.PI * n) / (N - 1))) +
                        (a3 * Math.cos((6 * Math.PI * n) / (N - 1)));
            }
        }
    }
}).then(function (x) {
    if (!Math.sec) {
        Math.sec = MEPH.math.Util.sec;
    }
    if (!Math.csc) {
        Math.csc = MEPH.math.Util.csc;
    }
    if (!Math.cot) {
        Math.cot = MEPH.math.Util.cot;
    }
    if (!Math.sinh) {
        Math.sinh = MEPH.math.Util.sinh;
    }
    if (!Math.cosh) {
        Math.cosh = MEPH.math.Util.cosh;
    }
    if (!Math.sech) {
        Math.sech = MEPH.math.Util.sech;
    }
    if (!Math.csch) {
        Math.csch = MEPH.math.Util.csch;
    }
    if (!Math.coth) {
        Math.coth = MEPH.math.Util.coth;
    }
    if (!Math.tanh) {
        Math.tanh = MEPH.math.Util.tanh;
    }
});;