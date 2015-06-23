
/**
* @class Connection.application.Application
* Represents functionality for a mobile application.
*/
MEPH.define('Connection.application.Converters', {
    statics: {
        Names: function (obj) {
            var res = [];
            if (obj) {

                for (var i = 0 ; i < 4 ; i++) {
                    if (obj['card' + i] && obj['card' + i].name) {
                        res.push(obj['card' + i].name);
                    }
                }
            }
            return res.join();
        },
        Hide: function (val) {
            if (val) return '';
            return 'display:none;';
        },
        ConversationDate: function (val) {
            if (val === null) return '';
            var d = new Date(val);
            var now = Date.now();
            var second = 1000;
            var minute = 60 * second;
            var hour = minute * 60;
            var day = hour * 24;
            var week = day * 7;
            var n = d.toLocaleDateString();
            var time = d.getTime();
            if (minute + time > now) {
                return '< 1 min ago';
            }
            else if (hour + time > now) {
                return Math.abs(Math.round((now - time) / minute)) + ' min ago';
            }
            else if (day + time > now) {
                return Math.abs(Math.round((now - time) / hour)) + ' hr ago';
            }
            else if (week + time > now) {
                return Math.abs(Math.round((now - time) / day)) + ' days ago';
            }
            return n;
        }
    }
}).then(function () {
    window.CC = Connection.application.Converters;
})