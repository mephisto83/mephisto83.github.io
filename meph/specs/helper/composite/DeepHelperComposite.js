
MEPH.define('MEPHTests.helper.composite.DeepHelperComposite', {
    alias: 'deephelpercomposite',
    requires: ['MEPH.input.Input', 'MEPHTests.helper.composite.HelperComposite'],
    extend: 'MEPH.control.Control',
    templates: true,
    properties: {
        deepHelperProperty: null
    }
});