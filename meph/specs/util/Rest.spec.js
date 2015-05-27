describe("MEPH/util/Rest.spec.js", 'MEPH.util.Rest', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a rest', function (done) {
        MEPH.create('MEPH.util.Rest').then(function ($class) {
            var renderer = new $class();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('can add a path ', function () {
        var rest = new MEPH.util.Rest();

        rest = rest.addPath('path');

        var res = rest.path();
        expect(res === '/path').toBeTruthy();
    });

    it('can replace template parts', function (done) {
        var rest = new MEPH.util.Rest();
        rest.ajax = function (path, config) {
            expect(path === '/path/c').toBeTruthy();
            return Promise.resolve(true);
        }
        rest = rest.addPath('path/{client}');

        expect(rest.path() === 'path/{client}');

        rest.get({ client: 'c' }).then(done)
    });

    it('can match and replace ', function () {
        var rest = new MEPH.util.Rest();

        var res = rest.matchAndReplace('path/{client}', { client: 'en' });
        expect(res === 'path/en').toBeTruthy();
    });


    it('can match and replace ', function () {
        var rest = new MEPH.util.Rest();

        var res = rest.matchAndReplace('path/{client}/{client}', { client: 'en' });
        expect(res === 'path/en/en').toBeTruthy();
    });



    it('can return a value from GET', function (done) {
        var rest = new MEPH.util.Rest();

        var res = rest.matchAndReplace('path/{client}/{client}', { client: 'en' });
        rest = rest.addPath('path/{client}');
        rest.ajax = function (path, config) {
            expect(config.method).toBe('GET');
            return Promise.resolve(true);
        }
        expect(rest.path() === 'path/{client}');

        rest.get({ client: 'c' }).then(function (res) {
            expect(res === true).toBeTruthy();
        }).catch(function (t) {
            expect(t).caught();
        }).then(done);
    });

    it('can return a value from POST', function (done) {
        var rest = new MEPH.util.Rest();

        var res = rest.matchAndReplace('path/{client}/{client}', { client: 'en' });
        rest = rest.addPath('path/{client}');
        rest.ajax = function (path, config) {
            expect(config.method).toBe('POST');
            return Promise.resolve(true);
        }
        expect(rest.path() === 'path/{client}');

        rest.post({ client: 'c' }).then(function (res) {
            expect(res === true).toBeTruthy();
        }).catch(function (t) {
            expect(t).caught();
        }).then(done);
    });

    it('can return a value from PATCH', function (done) {
        var rest = new MEPH.util.Rest();

        var res = rest.matchAndReplace('path/{client}/{client}', { client: 'en' });
        rest = rest.addPath('path/{client}');
        rest.ajax = function (path, config) {
            expect(config.method).toBe('PATCH');
            return Promise.resolve(true);
        };

        rest.patch({ client: 'c' }).then(function (res) {
            expect(res === true).toBeTruthy();
        }).catch(function (t) {
            expect(t).caught();
        }).then(done);
    });

    it('can return a value from DELETE', function (done) {
        var rest = new MEPH.util.Rest();

        var res = rest.matchAndReplace('path/{client}/{client}', { client: 'en' });
        rest = rest.addPath('path/{client}');
        rest.ajax = function (path, config) {
            expect(config.method).toBe('DELETE');
            return Promise.resolve(true);
        }

        rest.remove({ client: 'c' }).then(function (res) {
            expect(res === true).toBeTruthy();
        }).catch(function (t) {
            expect(t).caught();
        }).then(done);
    });

    it('can return a value from HEAD', function (done) {
        var rest = new MEPH.util.Rest();

        var res = rest.matchAndReplace('path/{client}/{client}', { client: 'en' });
        rest = rest.addPath('path/{client}');
        rest.ajax = function (path, config) {
            expect(config.method).toBe('HEAD');
            return Promise.resolve(true);
        }

        rest.head({ client: 'c' }).then(function (res) {
            expect(res === true).toBeTruthy();
        }).catch(function (t) {
            expect(t).caught();
        }).then(done);
    });

    it('can repeat a reaturn value from GET', function (done) {
        var rest = new MEPH.util.Rest(),
            count = 0;

        rest.ajax = function (path, config) {
            return Promise.resolve(true);
        };

        rest.storage = {
            get: function (path, config) {
                return Promise.resolve(true);
            }, set: function () {
                return Promise.resolve();
            }
        };

        rest.get().then(function () {
            count++;
        }).then(function () {
            expect(count).toBe(2);
        }).catch(function (e) {
            expect(e).caught(e);
        }).then(done);
    });

    it('can return a value from PUT', function (done) {
        var rest = new MEPH.util.Rest();

        var res = rest.matchAndReplace('path/{client}/{client}', { client: 'en' });
        rest = rest.addPath('path/{client}');
        rest.ajax = function (path, config) {
            expect(config.method).toBe('PUT');
            return Promise.resolve(true);
        }

        rest.put({ client: 'c' }).then(function (res) {
            expect(res === true).toBeTruthy();
        }).catch(function (t) {
            expect(t).caught();
        }).then(done);
    });

});