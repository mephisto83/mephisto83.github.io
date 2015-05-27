MEPH.define('MEPHControls.graph.view.Graph', {
    alias: 'mephcontrols_graph',
    templates: true,
    extend: 'MEPH.control.Control',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView',
        'MEPH.graph.Node',
        'MEPH.graph.GraphControl',
        'MEPH.button.IconButton'],
    properties: {
        name: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        //me.on('load', me.onLoaded.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Graph';
    },
    addNode: function () {

        var me = this,
            node = new MEPH.graph.Node();
        node.setId(MEPH.GUID());
        node.appendData({
            title: 'Node ' + MEPH.GUID().substr(0, 4),
            id: MEPH.GUID(),
            nodeInputs: [].interpolate(0, 3, function (x) {
                return {
                    title: 'Input ',
                    type: x,
                    id: MEPH.GUID()
                }
            }),
            nodeOutputs: [].interpolate(0, 3, function (x) {
                return {
                    title: 'Output ' + x,
                    type: x,
                    id: MEPH.GUID()
                }
            })
        });
        me.graph.addNode(node);
    },
    show: function () {
        var me = this,
            view,
            dom;
        dom = me.getDomTemplate();
        view = dom.first();
        return me.viewTransition(view, { remove: me.$removeHomePageCls });
    },
    hide: function () {
        var me = this,
            view,
            dom = me.getDomTemplate();

        view = dom.first();
        return me.viewTransition(view, { add: me.$removeHomePageCls });
    },
    close: function () {
        var me = this;
    },
    open: function () {
        var me = this;
    }
});