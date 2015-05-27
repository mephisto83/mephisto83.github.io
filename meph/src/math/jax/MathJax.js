/**
 * @class MEPH.math.jax.MathJax
 * A wrapper around MathJax, http://www.mathjax.org/
 **/
MEPH.define('MEPH.math.jax.MathJax', {
    statics: {
        ready: function () {
            MEPHJax.$promise = MEPHJax.$promise || Promise.resolve();
            MEPHJax.$promise = MEPHJax.$promise.then(function () {
                if (!MEPHJax.$loaded) {
                    var toresolve;
                    return MEPH.loadJSCssFile('../external/MathJax-2.3-latest/MathJax-2.3-latest/MathJax.js?config=TeX-AMS_HTML-full', '.js', function () {
                        MEPHJax.$loaded = true;
                        toresolve(MEPHJax.$loaded);
                    }).then(function () {
                        return new Promise(function (r, f) {
                            toresolve = r;
                        });
                    });
                }
                return MEPHJax.$loaded;
            });
            return MEPHJax.$promise;
        },
        load: function (script, dom) {
            var toresolve,
                tofail,
                promise = new Promise(function (r, f) {
                    toresolve = r;
                    tofail = f;

                    var math;
                    dom.innerHTML = '${}$';
                    dom.setAttribute('id', dom.getAttribute('id') || MEPH.GUID());
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    MathJax.Hub.queue.Push(function () {
                        if (math) {
                            MathJax.Hub.Queue(["Text", math, script]);
                        }
                        else {

                            MathJax.Hub.queue.Push(function () {

                                math = MathJax.Hub.getAllJax("MathOutput")[0];
                                MathJax.Hub.queue.Push(["Text", math, script]);
                            });


                        }
                        MathJax.Hub.Queue(function () {
                            toresolve(true);
                        });
                    });
                });;
            return MEPHJax.ready().then(function () {
                return promise;
            });
        }
    },
}).then(function () {
    MEPH.namespace('MEPHJax');
    MEPHJax = MEPH.math.jax.MathJax;
    MEPHJax.$promise = MEPHJax.$promise || Promise.resolve();
});