MEPH.define('MEPHTests.helper.view.View', {
    templates: true,
    alias: 'mephtests_view_view',
    extend: 'MEPH.control.Control',
    properties: {
        injectControls: {
            location: 'defaultLocation'
        }
    }
});