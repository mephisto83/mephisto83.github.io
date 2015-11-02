
MEPH.define('MEPH.util.LSystem', {
    statics: {
        get: function (_initial) {
            var system = new function () {
                var current = [];
                var initial = _initial;
                var rules = [];
                var sys = this;

                this.print = function () {
                    return console.log(JSON.stringify(current));
                };
                this.get = function () { return current; }
                this.execute = function (_subcurrent) {
                    var res = [];
                    (_subcurrent || current).forEach(function (t) {
                        if (Array.isArray(t)) { 
                            res = res.concat(sys.execute(t));
                        } else {
                            rules.forEach(function (ruleObject) {
                                if (ruleObject.match(t)) {
                                    ruleObject.outFunc(t, res);
                                }
                            });
                        }
                    });

                    return res;
                };

                this.step = function () {
                    var res = this.execute();
                    current = res;
                };

                this.init = function () {
                    current.push(initial);
                };

                this.addRule = function (match, outFunc) {
                    rules.push({
                        match: match,
                        outFunc: outFunc
                    });
                };
            }

            return system;
        }
    }
});