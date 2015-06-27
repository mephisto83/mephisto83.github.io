MEPH.define('Connection.selection.view.selectionview.SelectionView', {
    alias: 'selectionview',
    templates: true,
    requires: ['MEPH.button.IconButton'],
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
                me.cancel = {};
                me.$inj.relationshipService.searchContacts(0, 10, true, val, me.contacts, me.cancel, false, true);

            })
        }, 500);
        me.searchThrottle();
    },
    getSearchValue: function () {
        var me = this;
        return me.search.getRawValue();
    }
});