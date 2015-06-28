MEPH.define('Connection.selection.view.SelectContactsView', {
    alias: 'selection_view_select_contacts',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    injections: [
        'relationshipService',
        'overlayService',
        'dialogService',
        'stateService'],
    requires: ['Connection.selection.view.selectionview.SelectionView',
        'Connection.template.SelectContactListItem',
        'MEPH.util.Style',
        'MEPH.list.View'],
    properties: {
        contacts: null,
        selectedContacts: null
    },
    onLoaded: function () {
        var me = this;
        me.selectedContacts = MEPH.util.Observable.observable([]);
    },
    afterShow: function () {
        var me = this;

        if (me.$aftershow) {
            clearTimeout(me.$aftershow);
            me.$aftershow = null;
        }
        me.$aftershow = setTimeout(function () {
            me.setupContactSelection();
        }, 500);
    },
    setupContactSelection: function () {
        var me = this,
            currentConfig;
        return me.when.injected.then(function () {
            currentConfig = me.$inj.stateService.get(Connection.constant.Constants.CurrentSelectionConfig);//, { data: data }
        });
    }
});