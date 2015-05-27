
var key = 'AIzaSyBgmZ3XWpTJxs-HQxIupVBiftoaQIrLfc4';

document.addEventListener('DOMContentLoaded', function () {



    MEPH.ready().then(function () {
        setTimeout(function () {
            MEPH.define('porter.beats.porterdownloader', {
                statics: {
                    getVideo: function (url) {
                        var getVideoUrl = 'https://www.googleapis.com/youtube/v3/videos?id=' + url + '&key=' + key + '&part=snippet,contentDetails,statistics,status';

                        return MEPH.ajax(getVideoUrl);
                    }
                },
                properties: {
                    downloadBtn: null,
                    input: null
                },
                initialize: function (input, btn) {
                    var me = this;
                    me.input = input;
                    me.downloadBtn = btn;
                    me.addListeners();
                },
                getInput: function () {
                    var me = this
                    return me.input.value;
                },
                downloadFile: function () {
                    var me = this;
                    var target = me.getInput();
                    var id = me.isProperVideo(target);
                    console.log(id);
                    Promise.resolve().then(me.disableBtn.bind(me)).then(function () {
                        return porter.beats.porterdownloader.getVideo(id).then(function (res) {
                            var data = JSON.parse(res.responseText)
                            console.log(data);
                            var imagespace = me.getImageSpace();
                            if (imagespace) {
                                me.addImage(imagespace, data)
                            }
                        })
                    }).catch(function (e) {
                        console.log(e);
                    }).then(me.enableBtn.bind(me));
                },
                addImage: function (space, data) {

                    var item = data.items.first();
                    var height = item.snippet.thumbnails.high.height;
                    var width = item.snippet.thumbnails.high.width;
                    space.innerHTML = '<img src="' + item.snippet.thumbnails.high.url + '" style="height:' + height + 'px;width:' + width + 'px"/>'
                },
                getImageSpace: function () {
                    var me = this;
                    return document.querySelector('[imagespace]');
                },
                disableBtn: function () {
                    var me = this;
                    me.downloadBtn.setAttribute('disabled', 'disabled');
                },
                enableBtn: function () {
                    var me = this;
                    if (me.downloadBtn) {
                        me.downloadBtn.removeAttribute('disabled');
                    }
                },
                isProperVideo: function (url) {
                    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                    var match = url.match(regExp);
                    if (match && match[7].length == 11) {
                        return match[7];
                    } else {
                        return false;
                    }
                },
                addListeners: function () {
                    var me = this;
                    if (me.downloadBtn) {
                        me.downloadBtn.addEventListener('click', me.downloadFile.bind(me));
                    }
                }
            }).then(function () {

                var app = new porter.beats.porterdownloader(input, button);

                console.log('app created');

            })

        }, 1000)
    });

    var input;
    var button;

    input = document.body.querySelector('.youtubeaddress');
    button = document.body.querySelector('[loadButton]');
})