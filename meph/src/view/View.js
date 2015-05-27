MEPH.define('MEPH.view.View', {
    alias: 'view',
    templates: true,
    extend: 'MEPH.control.Control',
    injectControls: {
        location: 'defaultLocation'
    }
});