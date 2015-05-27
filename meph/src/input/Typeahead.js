MEPH.define('MEPH.input.Typeahead', {
    alias: 'typeahead',
    requires: ['MEPH.util.Observable', 'MEPH.util.Style'],
    templates: true,
    extend: 'MEPH.input.Text',
    properties: {
        source: null,
        type: 'text',
        listsource: null,
        field: 'name',
        serviceObj: null,
        selectedobject: null,
        showempty: false,
        selectedindex: null,
        injectControls: {
            location: 'listtemplate'
        }
    },

    initialize: function () {
        var me = this;

        me.callParent.apply(me, arguments);
        me.listsource = MEPH.util.Observable.observable([]);
        me.on('altered', me.onAltered.bind(me));
        me.on('keypressed', me.onchanged.bind(me));
        me.on('blurred', function () {
            me.$blurr = setTimeout(function () {
                if (me.suggestions)
                    MEPH.util.Style.hide(me.suggestions);
            }, 200);
        });
        var originalValue;
        me.on('focussed', function () {
            originalValue = me.value;
            if (me.$blurr)
                clearTimeout(me.$blurr);
            if (me.suggestions) {
                me.showSuggestions();
                if (!me.notfirsttime) {
                    me.refreshItems({ value: me.value });
                    me.notfirsttime = true;
                }
            }
        });
    },
    showSuggestions: function () {
        var me = this;
        if (me.suggestions) {
            MEPH.util.Style.show(me.suggestions);
        }
    },
    hideSuggestions: function () {
        var me = this;
        if (me.suggestions) {
            MEPH.util.Style.hide(me.suggestions);
        }
    },
    onAltered: function (type, args) {
        var me = this;
        if (args.path === 'source' || args.property === 'source') {
            if (args && args.old && args.old.un) {
                args.old.foreach(function (t) {
                    if (typeof obj === 'object') {
                        MEPH.util.Observable.observable(obj);
                        obj.un(me.source);
                    }
                });
                args.old.un(args.old);
            }
            if (me.source && me.source.isObservable) {
                me.source.on('changed', function () {
                    me.source.foreach(function (obj, index) {
                        if (typeof obj === 'object') {
                            MEPH.util.Observable.observable(obj);
                            obj.un(me.source);
                            obj.on('changed', function () {
                                me.updateDomElements();
                            }, me.source);
                        }
                    })
                    me.updateDomElements();
                }, me.source);

            }

            me.updateDomElements();
        }
        else if (args.property === 'value') {

            me.$selectedObject = me.value;
            me.updateDomElements();
        }
    },
    onLoaded: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.baseComponentCls = 'typehead';
        MEPH.util.Style.hide(me.suggestions);
    },
    onchanged: function (evnt, args) {
        var me = this,
            field = me.field;
        //me.baseComponentCls = 'typehead';
        //me.listsource.clear();
        //if (args.value || me.showempty) {
        //    me.source.where(function (x) {
        //        return x[field] ? x[field].indexOf(args.value) != -1 : 0;
        //    }).foreach(function (t) {
        //        me.listsource.push(t);
        //    });
        //    var item = me.source.first(function (x) {
        //        return x[field] === (args.value);
        //    });
        //    me.selectedindex = me.source.indexOf(data);
        //    me.selectedobject = item;
        //}
        me.refreshItems(args);
        if (args.event.keyCode === 27) {
            me.hideSuggestions();
        }
        else {
            var el = me.getFirstElement();
            //if (el.scrollIntoView) {
            //    el.scrollIntoView({ block: "end", behavior: "smooth" });
            //}
            el.dispatchEvent(MEPH.createEvent('change', {}));
        }


    },
    refreshItems: function (args) {
        var me = this,
            field = me.field;
        me.listsource = [];
        if (args.value || me.showempty) {
            var toadd = me.source.where(function (x) {
                if (!args.value && me.showempty) {
                    return true;
                }
                return x[field] ? x[field].indexOf(args.value) != -1 : 1;
            }).foreach(function (t) {
                return t;
            });

            me.listsource.push.apply(me.listsource, toadd);

            var item = me.source.first(function (x) {
                return x[field] === (args.value);
            });

            me.selectedindex = me.source.indexOf(item);
            me.selectedobject = item;
        }
    },
    itemclicked: function (dataitem) {
        var me = this, changed;
        var data = MEPHArray.convert(arguments).last().domEvent.data;

        if (data) {
            me.selectedindex = me.source.indexOf(data);
            if (me.selectedobject !== data) {
                changed = true;
            }
            me.selectedobject = data;
            me.value = data[me.field];
            if (changed) {
                me.getFirstElement().dispatchEvent(MEPH.createEvent('changed', {}));
            }

            me.inputfield.focus();
            setTimeout(function () {
                me.hideSuggestions();
            }, 10)
        }
    },
    updateDomElements: function () {
    }
});