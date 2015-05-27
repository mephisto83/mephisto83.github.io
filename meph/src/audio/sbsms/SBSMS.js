

/**
 * @class MEPH.audio.sbsms.SBSMS
 **/
MEPH.define('MEPH.audio.sbsms.SBSMS', {
    requires: ['MEPH.audio.sbsms.SBSMSImp'],
    statics: {
    },
    properties: {
        impl: null
    },
    //int channels, SBSMSQuality *quality, bool bSynthesize
    initialize: function (channels, quality, bSynthesize) {
        var me = this;
        this.imp = new MEPH.audio.sbsms.SBSMSImp(channels, quality, bSynthesize);
    },
    //void SBSMS :: SBSMSRenderer * renderer
    addRenderer: function (renderer) {
        this.imp.addRenderer(renderer);
    },
    //void SBSMS :: SBSMSRenderer *renderer
    removeRenderer: function (renderer) {
        this.imp.removeRenderer(renderer);
    },
    //   SBSMSError SBSMS :: 
    getError: function () {
        return this.imp.error;
    },
    //long SBSMS :: SBSMSInterface *iface, audio *buf, long n
    read: function (iface, buf, n) {
        return this.imp.read(iface, buf, n);
    },
    //    long SBSMS ::     SBSMSInterface *iface
    renderFrame: function (iface) {
        return this.imp.renderFrame(iface);
    },
    //long SBSMS :: 
    getInputFrameSize: function () {
        return this.imp.top.getInputFrameSize();
    }
})