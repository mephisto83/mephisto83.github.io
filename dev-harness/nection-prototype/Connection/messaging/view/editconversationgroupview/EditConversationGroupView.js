MEPH.define('Connection.messaging.view.editconversationgroupview.EditConversationGroupView', {
    alias: 'ediconversationgroupview',
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
        me.canchange = true;
        me.contacts = MEPH.util.Observable.observable([]);
    },
    isReturnHit: function (domData) {
        var me = this;
        if (domData) {
            var charCode = MEPH.util.Dom.getCharCode(domData.domEvent);
            switch (charCode) {
                case 13:
                    return me.canchange;
                default:
                    return false;
            }
        }
        return false;
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
    showTypeahead: function () {
        var me = this;
        //MEPH.util.Style.show(me.typeaheadHolder);
    },
    focus: function () {
        var me = this;
        //MEPH.util.Style.show(me.typeaheadHolder);
        //MEPH.util.Style.hide(me.nameDisplay);
        //me.focusTypeahead();
    },
    focusTypeahead: function () {
        var me = this;
        //if (me.typeahead)
        //    me.typeahead.focus();
    },
    getSearchValue: function () {
        var me = this;
        return me.typeahead.getRawValue();
    },
    selectionChanged: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        me.getFirstElement().dispatchEvent(MEPH.createEvent('selected-contact', { data: data }));
        me.selectedContact = null;
        me.selectedCardValue = null;

    }
});