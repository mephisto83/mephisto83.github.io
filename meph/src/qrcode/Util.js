MEPH.define('MEPH.qrcode.Util', {
    statics: {
        URShift: function (number, bits) {
            if (number >= 0)
                return number >> bits;
            else
                return (number >> bits) + (2 << ~bits);
        }
    }
});