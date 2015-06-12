var $array = Array
/**
 * @class MEPH.util.Promise
 * A static class used to add extra functions to Promise.
 **/
MEPH.define('MEPH.util.IndexedStorage', {
    initialize: function (config) {
        var me = this;
        me.initLocal();
        me.dbconfig = me.config({ data: config });
        MEPH.subscribe(MEPH.Constants.LOGOUT, function () {
            me.open().then(function () {
                me.clear();
            })
        });
    },
    initLocal: function () {
        var key = 'meph-util-indexedStorage',
            res = localStorage.getItem(key);
        if (!res) {
            localStorage.setItem(key, JSON.stringify([]))
        }
    },
    /**
     * Opens the configured db.
     */
    open: function () {
        var me = this,
            version = me.dbconfig.version,
            dbconfig = me.dbconfig.data;
        if (me.database) {
            return Promise.resolve(me.database);
        }
        return new Promise(function (r, f) {
            var req = indexedDB.open(dbconfig.id, parseInt(version));
            req.onsuccess = function (evt) {
                // Better use "this" than "req" to get the result to avoid problems with
                // garbage collection.
                // db = req.result;
                db = this.result;
                MEPH.Log("openDb DONE");
                me.database = db;
                r(db);
            };
            req.onerror = function (evt) {
                //console.error("openDb:", evt.target.errorCode);
                f(evt.target.errorCode);
            };

            req.onupgradeneeded = function (evt) {
                MEPH.Log("openDb.onupgradeneeded");
                var store = evt.currentTarget.result.objectStoreNames.contains(dbconfig.id) ?
                     evt.currentTarget.transaction.objectStore(dbconfig.id) :
                    evt.currentTarget.result.createObjectStore(dbconfig.id, {
                        keyPath: 'id', autoIncrement: true
                    });

                dbconfig.indexes.foreach(function (index) {
                    if (store.indexNames.contains(index.name)) {
                        store.deleteIndex(index.name);
                    }
                    store.createIndex(index.name, index.name || index.keyPath, index.options);
                });
            };
        });
    },
    add: function (obj) {
        var me = this;

        return new Promise(function (r, f) {

            var store = me.getObjectStore('readwrite');
            var req;
            try {
                req = store.add(obj);
            } catch (e) {
                f(e);
            }
            req.onsuccess = function (evt) {
                r(true);
            };
            req.onerror = function () {
                f(this.error);
            };
        });
    },

    put: function (obj) {
        var me = this;

        return new Promise(function (r, f) {

            var store = me.getObjectStore('readwrite');
            var req;
            try {
                req = store.put(obj);
            } catch (e) {
                f(e);
            }
            req.onsuccess = function (evt) {
                r(true);
            };
            req.onerror = function () {
                f(this.error);
            };
        });
    },
    where: function (func) {
        var me = this,
            result = [];
        return new Promise(function (r, f) {
            var store = me.getObjectStore('readonly'),
                req = store.openCursor();

            // Start iteration by opening a cursor

            // When any records is found, you's get notified by the 'success' event
            req.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    // We have a record in cursor.value
                    if (func(cursor.value)) {
                        result.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    // Iteration complete
                    r(result);
                }
            };
        });
    },
    removeWhere: function (func) {
        var me = this;
        return me.where(func).then(function (res) {
            return Promise.all(res.select(function (obj) {
                return me.remove(obj);
            }))
        });
    },
    remove: function (obj) {
        var me = this;
        return new Promise(function (r, f) {
            var store = me.getObjectStore('readwrite'),
                req = store.delete(obj.id);

            req.onsuccess = function (evt) {
                r(obj);
            };
            req.onerror = function (evt) {
                // console.error("deletePublication:", evt.target.errorCode);
                f(new Error(evt.target.errorCode));
            };
        });
    },
    clear: function () {
        var me = this;
        return new Promise(function (r, f) {
            var store = me.getObjectStore('readwrite'),
                req = store.clear();

            req.onsuccess = function (evt) {
                r(true);
            };
            req.onerror = function (evt) {
                // console.error("deletePublication:", evt.target.errorCode);
                f(new Error(evt.target.errorCode));
            };
        });
    },
    get: function (property, value) {
        var me = this;

        return new Promise(function (r, f) {
            var store = me.getObjectStore('readonly');
            var req = store.index(property);
            req.get(value).onsuccess = function (evt) {

                if (typeof evt.target.result == 'undefined') {
                    f("No matching record found");
                    return;
                }

                var key = evt.target.result.id;
                var req = store.get(key);
                req.onsuccess = function (evt) {
                    var record = evt.target.result;
                    r(record);
                };
                req.onerror = function (evt) {
                    // console.error(evt.target.errorCode);
                    f(evt.target.errorCode);
                };
            };
            req.onerror = function (evt) {
                // console.error("deletePublication:", evt.target.errorCode);
                f(evt.target.errorCode);
            };
        });
    },
    /**
  * @param {string} store_name
  * @param {string} mode either "readonly" or "readwrite"
  */
    getObjectStore: function (mode, store_name, db) {
        var me = this;
        db = db || me.database;
        if (!db) {
            throw new Error('no database');
        }
        store_name = store_name || me.dbconfig.data.id;
        var tx = db.transaction(store_name, mode);
        return tx.objectStore(store_name);
    },
    config: function (config) {
        var me = this,
            key = 'meph-util-indexedStorage',
            db = null,
            dbs;

        dbs = JSON.parse(localStorage.getItem(key));
        if (dbs) {
            db = dbs.first(function (dbconfig) {
                return config.data.id === dbconfig.data.id;
            });

            if (!db || JSON.stringify(db.data) !== JSON.stringify(config.data)) {
                dbs.removeWhere(function (t) {
                    return t.data.id === config.data.id;
                });
                var version = (db ? db.version || 0 : 0) + 1;
                config.version = version;
                dbs.push(config);
                localStorage.setItem(key, JSON.stringify(dbs));
                return config;
            }
        }
        return db;
    }
});