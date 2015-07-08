
/**
* @class Connection.application.Application
* Represents functionality for a mobile application.
*/
MEPH.define('Connection.application.Converters', {
    statics: {
        Names: function (obj) {
            var res = [];
            if (obj && obj.cards && obj.cards.select) {

                return obj.cards.select(function (x) { return x.name; }).join();
                //for (var i = 0 ; i < 4 ; i++) {
                //    if (obj['card' + i] && obj['card' + i].name) {
                //        res.push(obj['card' + i].name);
                //    }
                //}
            }
            return '';
        },
        SentBy: function (obj) {
            if (obj.lastMessage) {
                var card = obj.cards.first(function (x) { return x.card === obj.lastMessage.cardId; });
                if (card) {
                    return (card.name || card.firstname) + ': ';
                }
            }
            return '';
        },
        Hide: function (val) {
            if (val) return '';
            return 'display:none;';
        },
        Card: function (cal) {
            return cal ? cal.profileimage : '';
        },
        NoCommonContacts: function (obj) {
            if (obj) {
                return obj.commonRelationshipCount && parseFloat(obj.commonRelationshipCount) ? '' : 'nocommoncontacts';
            }
            return 'nocommoncontacts';
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
                return '< 1 min';
            }
            else if (hour + time > now) {
                return Math.abs(Math.round((now - time) / minute)) + ' min';
            }
            else if (day + time > now) {
                return Math.abs(Math.round((now - time) / hour)) + ' hr';
            }
            else if (week + time > now) {
                return Math.abs(Math.round((now - time) / day)) + ' days';
            }
            return n;
        },
        ToggleReveal: function (data, index, element, list, argument, source) {
            if (list) {
                MEPH.Array(list.querySelectorAll('.reveal-list-item-container'))
                    .where(function (x) {
                        return x !== element;
                    }).foreach(function (element) {
                        var item = element.querySelector('.reveal-list-item-box.show');
                        if (item) {
                            element.classList.remove('slide-over');
                            item.classList.remove('show');
                        }
                    });
            }
            if (element) {
                var item = element.querySelector('.reveal-list-item-box');
                if (item) {
                    element.classList.toggle('slide-over');
                    item.classList.toggle('show');
                }
            }
        }
    }
}).then(function () {
    window.CC = Connection.application.Converters;
})