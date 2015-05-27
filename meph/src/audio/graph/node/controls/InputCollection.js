/**
 * @class MEPH.control.Control
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.audio.graph.node.controls.InputCollection', {
    alias: 'inputcollection',
    templates: true,
    scripts: ['MEPH.audio.graph.node.controls.InputCollectionForm'],
    requires: ['MEPH.util.Dom', 'MEPH.util.SVG'],
    extend: 'MEPH.audio.graph.node.controls.AudioControl',
    properties: {
        collection: null
    },
    initialize: function () {
        var me = this;
        me.great();

       me.on('altered', function (type, args) {
            if (args.path === 'collection') {
                me.collection.un(me);
                me.collection.on('changed', me.updateControlList.bind(me), me)
            }
        });
        me.renderer = new MEPH.util.SVG();
    },
    enterValue: function () {
        //var me = this;
        var me = this;
        me.createForm();
    },
    onLoaded: function () {
        var me = this;
        me.great();

        me.getFirstElement().dispatchEvent(MEPH.createEvent('height', { height: me.controlheight }));
    },
    updateControlList: function () {
        var me = this;

        me.renderer.setCanvas(me.collectiongroup);

        me.renderer.clear();
        var step = 15;
        var last = -step;
        me.svgs = me.collection.select(function (x) {
            last += step;
            return {
                text: x.name + ' : ' + x.type,
                shape: MEPH.util.SVG.shapes.text,
                dy: last,
                fill: '#ffffff',
                x: 3
            }
        })
        me.renderer.draw(me.svgs);
        me.controlheight = last + 24;
        me.getFirstElement().dispatchEvent(MEPH.createEvent('height', { height: me.controlheight }));
    },
    addField: function (field) {

        var me = this;
        if (me.collection && me.collection.all(function (x) { return x.name !== field.name; })) {
            me.collection.push(field);
            return true;
        }
        return false

    },
    createForm: function () {
        var me = this;

        var form = MEPH.getTemplate('MEPH.audio.graph.node.controls.InputCollectionForm');
        var element = MEPH.util.Dom.createInputElementOverSvg(me.getFirstElement(), 'div');
        element.innerHTML = form.template;
        var select = element.querySelector('select');
        select.setAttribute('placeholder', 'Input/Output(s)')
        var updateselect = function () {
            MEPH.util.Dom.clearSelect(select);
            me.collection.foreach(function (t) {
                MEPH.util.Dom.addOption(t.name, t.connector, select);
            });
        }
        updateselect();
        Style.width(element, 300)
        var input = element.querySelector('input');
        input.setAttribute('placeholder', 'name');

        var name;
        var type, collectionitem;
        var elements = [{
            setFunc: function (v) {
                if (v && me.collection.all(function (x) { return x.name !== v; })) {
                    if (collectionitem) {
                        collectionitem.name = v;
                        collectionitem.title = v;
                        updateselect();
                        me.updateControlList();
                        select.selectedIndex = me.collection.indexOf(collectionitem);
                    }
                }
            },
            element: input
        }, {
            setFunc: function (v) {
                collectionitem = me.collection.first(function (x) { return x.connector === v; }) || collectionitem;
            },
            element: select
        }];

        MEPH.util.Dom.addSimpleDataEntryToElments(me, elements, element);

    }
})