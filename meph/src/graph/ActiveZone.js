/**
* @class MEPH.graph.ActiveZone
*/
MEPH.define('MEPH.graph.ActiveZone', {
    properties: {
        raiseZIndex: 12,
        textPopupTemplate: '<div activezone="holder"><input type="text" activezone="texttemplate" /></div>'
    },
    initialize: function () {
        var me = this;
        MEPH.Events(me);
    },
    statics: {
        canCreateConnection: function (zone1, zone2) {
            var result = true;
            if (zone1.$options &&
                zone1.$options.option &&
                zone1.$options.option.canConnect
                ) {
                result = result && zone1.$options.option.canConnect(zone1, zone2);
            }
            if (zone2.$options &&
                zone2.$options.option &&
                zone2.$options.option.canConnect
                ) {
                result = result && zone2.$options.option.canConnect(zone2, zone1);
            }
            return result;
        },
        type:
            {
                'connector': 'connector',
                color: 'color',
                select: 'select',
                header: 'header',
                custom: 'custom',
                title: 'title'
            }
    },
    onTitleZoneClick: function (type, domAndMouseEvnt) {
        var me = this, template;

        switch (me.$options.option.type) {
            case 'custom':
                template = me.$options.option.generator(me, domAndMouseEvnt);
                break;
            default:
                template = me.createTextPopup(domAndMouseEvnt, ['title', 'variable']);
                break;
        }
        if (template) {
            template.az.addEventListener('activezoneblur', function () {
                template.az.parentNode.removeChild(template.az);
                me.getNode().fire('move', {});
                // MEPH.cancelBubble(e);
            });
        }
    },
    onColorZoneClick: function (type, domAndMouseEvnt) {
        var me = this, template;

        switch (me.$options.option.type) {
            case 'custom':
                template = me.$options.option.generator(me, domAndMouseEvnt);
                break;
            default:
                template = me.createTextPopup(domAndMouseEvnt, 'value');
                break;
        }
        if (template) {
            template.az.addEventListener('activezoneblur', function () {
                template.az.parentNode.removeChild(template.az);
                me.getNode().fire('move', {});
            });
        }
    },
    isEnumerable: function () {
        var me = this;
        if (me.getOptions() && me.getOptions().option) {
            return me.getOptions().option.enumerable
        }
        return false;
    },
    isMatching: function () {
        var me = this;
        if (me.getOptions() && me.getOptions().option) {
            return me.getOptions().option.matchingoutput;
        }
        return false;
    },
    createTextPopup: function (domAndMouseEvnt, prop) {
        var me = this;
        var domtext = document.createElement('div');
        var divchild = document.body.appendChild(domtext);
        divchild.innerHTML = me.textPopupTemplate;
        if (!Array.isArray(prop)) {
            prop = [prop];
        }
        var az = divchild.querySelector('[activezone="holder"]');
        az.style.position = 'fixed';
        az.style.zIndex = 10000;
        az.style.top = domAndMouseEvnt.evt.clientY + 'px';
        az.style.left = domAndMouseEvnt.evt.clientX + 'px';
        var azt = divchild.querySelector('[activezone="texttemplate"]');
        azt.addEventListener('change', function () {
            me.fire('change', {});
        });
        azt.addEventListener('blur', function () {
            prop.foreach(function (x) {
                me.$options.option[x] = azt.value;
            });
            me.getDom().setAttribute('title', azt.value);
            azt.dispatchEvent(MEPH.createEvent('activezoneblur', { bubbles: true }));
        });
        azt.value = me.$options.option[prop.first()];
        document.body.appendChild(divchild.firstChild);
        azt.focus();
        return { az: az, azt: azt };
    },
    setGraphViewPort: function (graphviewport) {
        var me = this;
        me.$graphviewport = graphviewport;
        me.$graphviewport.on('moved', me.onViewPortChange.bind(me));
        me.$graphviewport.on('change', me.onViewPortChange.bind(me));
    },
    getGraphViewPort: function (graphviewport) {
        var me = this;
        return me.$graphviewport;
    },
    isDraggable: function () {
        var me = this;
        return me.$draggable;
    },
    setZoneType: function (type) {
        var me = this;
        me.$zoneType = type;
    },
    getZoneType: function () {
        var me = this;
        return me.$zoneType;
    },
    isConnector: function () {
        var me = this;
        return me.getZoneType() === pgx.ActiveZone.type.connector;
    },
    setOptions: function (options) {
        var me = this;
        me.$options = options;
        me.setDomTitle();
    },
    getOptions: function () {
        var me = this;
        return me.$options;
    },
    onViewPortChange: function () {
        var me = this, pos = me.getGraphViewPort().getPosition();
        me.setRelativePosition(pos.x, pos.y, pos.z);//setPosition(pos.x, pos.y, pos.z);
    },
    onClick: function (e) {
        var me = this;
        if (me.$clickable) {
            me.fire('click', { dom: me.getDom(), evt: e });
        }
        //MEPH.cancelBubble(e);
    },
    onMouseDown: function (e) {
        var me = this;
        if (me.$draggable) {
            me.fire('activezone_dragstart', { dom: me.getDom(), evt: e });
        }
        //MEPH.cancelBubble(e);
    },
    setDom: function (dom) {
        var me = this;
        me.$dom = dom;
        var graphviewport = me.getGraphViewPort();
        if (graphviewport && (!me.getOptions() || !me.getOptions().managed)) {
            graphviewport.getDock().appendChild(dom);
        }
        if (me.$clickable) {
            Style.cursor(dom, 'pointer');
        }

        me.interactivity();

        if ((!me.getOptions() || !me.getOptions().managed)) {
            Style.position(dom, 'absolute');
            Style.zIndex(dom, me.raiseZIndex);
        }

        me.$dom.addEventListener('mousedown', me.onMouseDown.bind(me));
        me.$dom.addEventListener('click', me.onClick.bind(me));
        me.setDomTitle();
        me.ignoreMouse();

    },
    ignoreMouse: function (value) {
        var me = this;
        if (me.getDom() && (value || me.$ignoreMouse)) {
            me.getDom().style.pointerEvents = 'none';
        }

        else if (value !== undefined) {
            me.$ignoreMouse = value;
        }
    },
    setDomTitle: function () {
        var me = this;
        if (me.getDom() && me.$options && me.$options.option && me.$options.option) {
            switch (me.getZoneType()) {
                case ActiveZone.type.color:
                    me.$dom.setAttribute('title', me.$options.option.value);
                    break;
                case ActiveZone.type.title:
                    me.$dom.setAttribute('title', me.$options.option.title);
                    break;
            }
        }
    },
    setNode: function (node) {
        var me = this;
        me.$node = node;
        if (node && node.addZone)
            node.addZone(me);

    },
    getNode: function () {
        var me = this;
        return me.$node;
    },
    getId: function () {
        var me = this;
        return me.id;
    },
    getDom: function () {
        var me = this;
        return me.$dom;
    },
    destroy: function () {
        var me = this;
        if (me.getDom() && me.getDom().parentNode && (!me.getOptions() || !me.getOptions().managed)) {
            me.getDom().parentNode.removeChild(me.getDom());
        }
        me.fire('destroy', me);
    },
    isOutput: function () {
        var me = this;
        if ((me.getOptions() && me.getOptions().managed)) {
            return me.getOptions().option.isOutput;
        }
        return me.getNode().isOutput(me.getOptions().option);
    },

    clickable: function (notclickable) {
        var me = this;
        me.$clickable = notclickable !== undefined ? notclickable : true;
        var dom = me.getDom();
        if (dom) {
            Style.cursor(dom, 'pointer');
        }
        me.setDomTitle();
    },
    draggable: function (notdraggable) {
        var me = this;
        me.$draggable = notdraggable !== undefined ? notdraggable : true;
        me.interactivity();
    },
    interactivity: function () {
        var me = this;
        if (!me.$draggable && me.getDom()) {
            //me.getDom().style.pointerEvents = 'none';
        }
    },
    setRelativePosition: function (x, y, z) {
        var me = this,
            dom = me.getDom();
        me.$relativeposition = new J3DIVector3(x, y, z);
    },
    setPosition: function (x, y, z, override) {
        var me = this,
            _x = 0,
            _y = 0,
            dom = me.getDom();
        me.$position = new J3DIVector3(x, y, z);
        if (me.$relativeposition) {
            //_x += me.$relativeposition[0];
            //_y += me.$relativeposition[1];
        }
        if (me.$$$timeout) {
            clearTimeout(me.$$$timeout);
        }
        if (dom && (!me.stoppedMoveAbility || override) && (!me.getOptions() || !me.getOptions().managed)) {
            // me.$$$timeout = setTimeout(function () {
            Style.translate(dom, (x + _x), (y + _y));
            //}, 100);
        }
    },
    getPosition: function () {
        var me = this;
        if (me.$position) {
            return {
                x: me.$position[0],
                y: me.$position[1],
                z: me.$position[2]
            }
        }
        return null;
    }
});