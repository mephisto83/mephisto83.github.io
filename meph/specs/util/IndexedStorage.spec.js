describe("MEPH/util/IndexedStorage.spec.js", 'MEPH.util.IndexedStorage', function () {
    var caught;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
        caught = function (e) {
            expect(e).caught();
        };
    });

    it("can store a config and get it .", function () {
        //Arrange
        //Act

        var storage = new MEPH.util.IndexedStorage({ id: 'test', an: MEPH.GUID() });

        //Assert
        expect(storage.dbconfig).toBeTruthy();
    });

    it('can open a db', function (done) {
        //Arrange
        //Act

        var opened,
            storage = new MEPH.util.IndexedStorage({
                id: 'test',
                indexes: [{
                    name: 'name',
                    option: {
                        unique: false
                    }
                }]
            });

        storage.open().then(function () {
            opened = true;
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
        //Assert
        expect(storage.dbconfig).toBeTruthy();

    });
    var getTestStorage = function () {
        var opened,
            storage = new MEPH.util.IndexedStorage({
                id: 'test',
                indexes: [{
                    name: 'name',
                    option: {
                        unique: false
                    }
                }]
            });

        return storage.open().then(function () {
            return storage;
        });
    };
    it('can get the getObjectStore', function (done) {
        getTestStorage().then(function (storage) {
            return storage.getObjectStore('readonly');
        }).then(function (res) {
            expect(res).toBeTruthy();
        }).catch(caught)
            .then(done);
    });

    it('can save and get an object from the store ', function (done) {
        getTestStorage().then(function (storage) {
            return storage.add({ name: 'andrew' }).then(function () {
                return storage
            });
        }).then(function (storage) {
            return storage.get('name', 'andrew');
        }).then(function (res) {
            expect(res).toBeTruthy();
        }).catch(caught).then(done);
    });

    it('get where matching some criteria', function (done) {
        getTestStorage().then(function (storage) {
            return storage.add({ name: 'andrew' }).then(function () {
                return storage
            });
        }).then(function (storage) {
            return storage.where(function (obj) {
                return obj.name === 'andrew';
            })
        }).then(function (res) {
            expect(res).toBeTruthy();
        }).catch(caught).then(done);
    });

    it('removewhere x', function (done) {
        getTestStorage().then(function (storage) {
            return storage.add({ name: 'andrew' }).then(function () {
                return storage
            });
        }).then(function (storage) {
            return storage.removeWhere(function (obj) {
                return obj.name === 'andrew';
            })
        }).then(function (res) {
            expect(res).toBeTruthy();
        }).catch(caught).then(done);
    });

    it('can put and get an object from the store ', function (done) {
        getTestStorage().then(function (storage) {
            return storage.put({ name: 'andrew' }).then(function () {
                return storage
            });
        }).then(function (storage) {
            return storage.get('name', 'andrew');
        }).then(function (res) {
            expect(res).toBeTruthy();
        }).catch(caught).then(done);
    });


    it('can not get an object from the store ', function (done) {
        var failed;
        getTestStorage().then(function (storage) {
            return storage.get('name', 'novalue');
        }).catch(function () {
            failed = true;
        }).then(function (res) {
            expect(failed).toBeTruthy();
        }).catch(caught).then(done);
    });
});