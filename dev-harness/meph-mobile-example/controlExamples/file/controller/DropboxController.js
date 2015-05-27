MEPH.define('MEPHControls.file.controller.DropboxController', {
    requires: ['MEPH.mixins.Referrerable',
                'MEPH.util.FileReader',
               'MEPH.mixins.Observable',
               'MEPH.util.Observable'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
        referrerable: 'MEPH.mixins.Referrerable'
    },
    properties: {
        listsource: null
    },
    initialize: function () {
        var me = this;
        me.mixins.referrerable.init.apply(me);
        me.mixins.observable.init.apply(me);
        me.$referenceConnections = MEPH.Array([{
            type: MEPH.control.Control.connectables.control, obj: me
        }]);

        //   me.on('referencesbound', me.referenceBound.bind(me));
        // setTimeout(function () {
        me.referenceBound()
        //}, 3000);
    },
    loadFiles: function () {
        var me = this;
        var args = MEPH.util.Array.convert(arguments);
        var evntArgs = args.last();

        var files = args.last();

        FileReader.readFileList(files.domEvent.files).then(function (res) {
            
            res.foreach(function (i) {

                me.listsource.push(i);
            });
        });
    },
    referenceBound: function () {
        var me = this;
        var source = [];
        Observable.observable(source)
        me.listsource = source;
    }
});