MEPH.define('MEPH.synchronization.util.InstanceObject', {
    alernateNames: ['InstanceObject'],
    requires: ['MEPH.util.Observable'],
    statics: {
        set: function (obj) {
            return (function () {
                var lead = MEPH.nonEnumerablePropertyPrefix;
                if (!this[lead + 'id']) {

                    Object.defineProperty(this, lead + 'id', {
                        enumerable: true,
                        writable: true,
                        configurable: true,
                        value: synctarget || MEPH.GUID()
                    });
                    this.fire('created', { value: this });
                }
                return this[lead + 'id'];
            }).bind(obj)();
        },
        instify: function (obj) {
            if (!obj.instanceObj) {
                MEPH.util.Observable.observable(obj);
                Object.defineProperty(obj, 'instanceObj', {
                    enumerable: false,
                    writable: false,
                    configurable: false,
                    value: function (lead, synctarget) {
                        lead = MEPH.nonEnumerablePropertyPrefix;
                        if (!this[lead + 'id']) {

                            Object.defineProperty(this, lead + 'id', {
                                enumerable: true,
                                writable: true,
                                configurable: true,
                                value: synctarget || MEPH.GUID()
                            });
                            this.fire('created', { value: this });
                        }
                        return this[lead + 'id'];
                    }
                });
                Object.defineProperty(obj, 'jsyncId', {
                    enumerable: false,
                    writable: false,
                    configurable: false,
                    value: function (lead) {
                        lead = MEPH.nonEnumerablePropertyPrefix;
                        return this[lead + 'id'];
                    }
                });
            }
            return obj;
        }
    }
});