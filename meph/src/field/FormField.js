/**
 * @class MEPH.field.FormField
 * @extends MEPH.control.Control
 * Standard form for a input field.
 **/
MEPH.define('MEPH.field.FormField', {
    alias: 'formfield',
    templates: true,
    extend: 'MEPH.control.Control',
    requires: ['MEPH.util.Observable'],
    properties: {

        /**
         * @property {String} labelText
         * Label text.
         **/
        labelText: null,
        /**
         * @property {String/Array} labelClsBase
         * Base Css classes to apply to the label field.
         */
        labelClsBase: 'meph-label',
        /**
         * @property {String} cls
         * CSS class to apply for this node.
         */
        cls: null,
        css: null,
        /**
         * @property {String} baseComponentCls
         * CSS class to apply for this node.
         */
        baseComponentCls: '',//'form-group',
        /**
         * @property {String/Array} labelClsComponent
         * Base Css classes to apply to the label field.
         */
        labelClsComponent: null,
        /**
         * @property {String/Array} inputCls
         * Css classes to apply to the input field.
         */
        inputCls: 'form-control',
        inputCssClass: '',
        /**
         * Value of the input field
         */
        value: null,
        /**
         * Validation error associated with the field.
         */
        validationError: null,
        /**
         * @property {String} type
         * Type of field, like text, number, phonenumber, email, etc.
         */
        type: null,
        /**
         * @property {String} descriptionText
         * Description text applied to the span following the text.
         */
        descriptionText: null,
        /**
         * @property {String/Array} descriptionCls
         * Css classes applied to the description text.
         */
        descriptionCls: null,
        /**
         * @property {String/Array} defaultValidationErrorCls
         * Defatul css classes applied for validation.
         */
        defaultValidationErrorCls: 'meph-formfield-validation-error',

        internalHiddenCls: '',
        hiddenCls: 'meph-formfield-hidden',
        hidden: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.addAutoBindProperty('value', 'validationError');
        me.addTransferables();
        me.defineDependentProperties();
        me.on('change_hidden', function () {
            if (me.hidden) {
                me.internalHiddenCls = me.hiddenCls;
            }
            else {
                me.internalHiddenCls = '';
            }
        });

        var originalValue;
        me.on('blurred', function () {
            if (originalValue !== me.inputfield.value) {
                me.raiseEvent('changed');
                originalValue = me.inputfield.value;
            }
        });
        me.on('focussed', function () {
            originalValue = me.inputfield.value;
        });
    },
    raiseEvent: function (event) {
        var me = this;
        var element = me.getFirstElement();
        element.dispatchEvent(MEPH.createEvent(event, { val: me.inputfield.value }));
        me.fire(event, { value: me.inputfield.value, event: MEPH.util.Array.convert(arguments).last().domEvent });
        return event;
    },
    onLoaded: function () {
        var me = this;
        me.great();

        me.don(['blurred', 'blur', 'keyup'], me.formBody, function () {
            if (me.$blurrBuffer) {
                clearTimeout(me.$blurrBuffer);
                me.$blurrBuffer = null;
            }
            me.$blurrBuffer = setTimeout(function () {
                var source = document.activeElement;
                if (!MEPH.util.Dom.isDomDescendant(source, me.formBody) ||
                    !MEPH.util.Dom.isDomDescendant(source, me.$window.document.body)) {
                    me.raiseEvent('total-blur');
                }
            }, 1000);
        }, null, true)
    },
    /**
     * Gets the auto bind property paths.
     * @param {String} path
     * @param {String} property
     * @returns {String}
     */
    getAutoBindPropertyPath: function (property, autoProperty) {
        var me = this, autoPropSetup, value, pathArray,
            autoProperties = me.getAutoBindProperties();
        autoPropSetup = autoProperties.first(function (x) { return property === x.property && autoProperty === x.autoProperty; });

        if (autoPropSetup) {
            value = me.getInstanceTemplate().getAttribute(autoPropSetup.property);
            if (value) {
                pathArray = value.split('.');
                if (pathArray.length > 1) {
                    pathArray.splice(pathArray.length - 1, 0, MEPH.isValidatablePropertyKey);
                    return pathArray.join(MEPH.pathDelimiter);
                }
            }
        }
        return me.callParent.apply(path);
    },

    /**
     * @private
     * Adds transferable properties.
     **/

    addTransferables: function () {
        var me = this, properties = (['inputCls',
                                                'descriptionText',

                                                'labelText', 
                                                'descriptionCls',
                                                'baseComponentCls',
                                                'placeholder',
                                                'componentCls',
                                                'inputCssClass',
                                                'labelClsBase',
                                                'labelClsComponent']);

        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });
        me.addTransferableAttribute('cls', {
            object: me,
            path: 'cls',
            asValue: true
        });
    },
    defineDependentProperties: function () {
        var me = this;
        me.combineClsIntoDepenendProperty('formFieldCls', ['cls', 'css', 'inputCssClass', 'baseComponentCls', 'componentCls', 'internalHiddenCls']);
        me.combineClsIntoDepenendProperty('labelCls', ['labelClsBase', 'labelClsComponent']);
        Observable.defineDependentProperty('validationCls', me, ['validationError'], me.validationErrorChange.bind(me));
    },
    /**
     * Validation changes the validationCls is recalulated.
     **/
    validationErrorChange: function () {
        var me = this;
        if (me.validationError) {
            return me.defaultValidationErrorCls;
        }
        return '';
    }
});