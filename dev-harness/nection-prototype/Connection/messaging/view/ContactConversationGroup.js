MEPH.define('Connection.messaging.view.ContactConversationGroup', {
    alias: 'main_contact_conversation_group',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService',
        'relationshipService',
        'overlayService',
        'dialogService',
        'stateService'],
    requires: ['Connection.messaging.view.contactconversationgroupview.ContactConversationGroupView',
        'Connection.template.EditConversationGroupItem', ,
        'MEPH.input.MultilineText',
        'MEPH.list.View'],
    properties: {
        contacts: null,
        memberNames: null,
        inputValue: null,
        messages: null,
        groupContacts: null,
        changePossible: true,
        currentContact: null,
        chatSession: null
    },
    onLoaded: function () {
        var me = this;
    },
    afterShow: function () {
        var me = this;

        if (me.$aftershow) {
            clearTimeout(me.$aftershow);
            me.$aftershow = null;
        }
        me.$aftershow = setTimeout(function () {
            me.setupGroupContacts();
        }, 500);
    },
    removeContactFromList: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        return me.when.injected.then(function () {
            return me.$inj.dialogService.confirm({
                title: 'Remove This Person?',
                message: 'They won\'t be able to keep chatting with this group.',
                yes: 'Remove',
                no: 'Cancel'
            });
        }).then(function (remove) {
            MEPH.Log('Removing');
            return me.$inj.messageService.removeContactFromConversation(data, me.currentGroupId, me.groupContacts);
        }).catch(function () {
            MEPH.Log('Not removing');
        }).then(function () {
        });
    },
    setupGroupContacts: function () {
        var me = this,
            currentContact,
            currentContacts;
        return me.when.injected.then(function () {
            me.$inj.overlayService.open('openining editconversationgroup');
            currentContacts = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversationContacts);//, { data: data }
            currentContact = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversationContact);//, { data: data }
            if (currentContacts && currentContacts.data) {
                me.currentGroupId = currentContacts.groupId;
                if (me.groupContacts) {
                    me.groupContacts.un(me);
                }

                me.groupContacts = MEPH.util.Observable.observable(currentContacts.data);
                // me.messages = MEPH.util.Observable.observable([]);
                me.groupContacts.on('changed', me.onContactsChange.bind(me), me);
            }
            if (currentContact && currentContact.data) {
                me.currentContact = currentContact.data;
            }
            me.onContactsChange();

        }).catch(function () {
        }).then(function () {
            me.$inj.overlayService.close('openining editconversationgroup');
        });
    }
});