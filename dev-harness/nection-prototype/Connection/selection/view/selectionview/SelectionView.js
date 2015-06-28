MEPH.define('Connection.selection.view.selectionview.SelectionView', {
    alias: 'selectionview',
    templates: true,
    requires: [
        'MEPH.button.IconButton',
        'MEPH.input.Search',
        'MEPH.util.Style',
        'Connection.template.SelectedContactListItem'
    ],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    injections: [
        'relationshipService',
        'overlayService',
        'stateService'],
    properties: {
        contacts: null,
        memberNames: null,
        inputValue: null,
        selectedContact: null,
        selectedCardValue: null
    },
    onLoaded: function () {
        var me = this;
        me.great()
        me.hideCloseBtn()
        me.hideFooter();
        me.hideHeaderName();
        me.contacts = MEPH.util.Observable.observable([]);
        me.selectedContacts = MEPH.util.Observable.observable([]);
        MEPH.util.Style.hide(me.selectedContactsSpace)
    },
    searchContacts: function () {
        var me = this,
            val = me.getSearchValue();
        if (me.$lastValue === val || !val) return;
        me.$lastValue = val;
        me.searchThrottle = me.searchThrottle || MEPH.throttle(function () {
            me.when.injected.then(function () {

                if (me.cancel && me.cancel.abort) {
                    me.cancel.abort();
                }
                val = me.getSearchValue();
                me.cancel = {};
                //me.$inj.relationshipService.searchContacts(0, 10, true, val, me.contacts, me.cancel, false, true);
                me.$inj.relationshipService.search({
                    index: 0,
                    count: 10,
                    initial: true,
                    search: val,
                    source: me.contacts,
                    cancel: me.cancel,
                    useSearch: true,
                    skipLocalContacts: true,
                    filter: function (data) {
                        return !me.selectedContacts.some(function (x) { return x.card === data.card });
                    }
                });

            })
        }, 500);
        me.searchThrottle();
    },
    toggleSelected: function () {
        var me = this, data = me.getDomEventArg(arguments);
        var filter = function (x) { return x.card === data.card; };

        if (!me.selectedContacts.some(filter)) {
            me.selectedContacts.push(data);
        }
        me.contacts.removeWhere(filter);
    },
    removeTouched: function () {
    },
    getSearchValue: function () {
        var me = this;
        return me.search.getRawValue();
    }
});