/// <reference path="../RecorderWorker.js" />
/*global MEPH*/

/**
* @class
*
* This is a convenient way of defining a visual selector.
*/
MEPH.define('MEPH.audio.view.VisualSelector', {
    alias: 'visualselector',
    extend: 'MEPH.audio.view.Visualizer',
    requires: ['MEPH.input.Range',
        'MEPH.util.Renderer',
        'MEPH.input.Dropdown',
        'MEPH.signalprocessing.SignalProcessor'],
    templates: true,
    properties: {
        stop: 100,
        maxCache: 20,
        position: 0,
        step: .0001,
        markBtnText: 'Mark',
        max: null,
        min: null,
        marks: null,
        offsetbtnheight: 19,
        windowpadding: 5,
        offsetstretchvertical: 4,
        stretchlinewidth: 3,
        marktype: 'default',
        stretchtype: 'stretchtype',
        windowingcolor:'#aa3939',
        markercolor: '#d9534f',
        markscolor: '#f0ad4e',
        markscolorbg: 'rgba(45, 64, 114, 0.5)',
        markerBtns: null,
        stretchControls: null,
        stretchcolor: '#f2f233',
        stretchmarks: null,
        stretchFlowState: '',
        beats: null,
        beatsPerMin: null,
        pitchShift: .5,
        pitchWindowSize: 1000,
        smallestStep: 0.0000001,
        silenceThreshold: 0,
        silenceTimeSticky: 0,
        silenceTimeThreshold: 0,
        renderer: null,
        stretchValue: 1,
        injectControls: {
            location: 'buttonpanel'
        },
        detectedPitch: null,
        $signalProcessor: null,
        markerrenderer: null
    },
    initialize: function () {
        var me = this;
        me.great();
        me.markerBtns = [];
        me.stretchControls = [];
        me.$signalProcessor = new SignalProcessor();;

        Observable.defineDependentProperty('silenceThresholdHeight', me, ['silenceThreshold'], me.calculateSilenceThreholdHeight.bind(me));
        me.on('altered', function (type, args) {
            if (args.path === 'marks') {
                if (me.marks) {
                    me.marks.onIf('changed', me.update.bind(me));
                }
                me.update();
            }
            if (args.path === 'stretchmarks') {
                if (me.stretchmarks) {
                    me.stretchmarks.onIf('changed', me.update.bind(me));
                }
                me.update();
            }

            if (args.path === 'vertical' || args.path === 'scrollMutiplier' || args.path === 'scrollleft') {
                me.update();
            }
        });
    },
    onLoaded: function () {
        var me = this;
        me.beats = MEPH.util.Observable.observable([].interpolate(35, 170, function (x) {
            return {
                name: x,
                value: x
            };
        }));
        me.beatsPerMin = 72;
        me.stretchFlowState = 'Start';
    },
    calculateSilenceThreholdHeight: function () {
        var me = this,
            height = me.height || 0,
            st = me.silenceThreshold || 0, stheight = height * st;

        Style.top(me.silenceThresholdDiv, (height / 2) - (stheight / 2));
        Style.height(me.silenceThresholdDiv, stheight);
        Style.width(me.silenceThresholdDiv, me.width);
        return stheight;
    },
    addMark: function () {
        var me = this,
            relativePosition = me.getCurrentPosition();
        var absPosition = me.getAbsoluteMarkPosition(relativePosition);
        me.$addMark(absPosition);

    },
    $addMark: function (pos) {
        var me = this;

        if (me.marks && !me.marks.some(function (x) {
             return x.position === pos;
        })) {
            me.marks.push({
                position: pos,
                type: me.marktype
            })
        }
    },
    addStretchMark: function () {
        var me = this,
            relativePosition = me.getCurrentPosition();
        var absPosition = me.getAbsoluteMarkPosition(relativePosition);
        if (me.stretchmarks && !me.stretchmarks.some(function (x) {
            return x.position === absPosition || (x.position < absPosition && x.targetposition > absPosition);
        })) {
            me.$addStretchMark(absPosition)
        }
    },
    $addStretchMark: function (position, targetposition) {
        var me = this;
        me.stretchmarks.push({
            position: position,
            targetposition: targetposition || 0,
            stretch: 0,
            type: me.stretchtype
        })
    },
    detectPitch: function () {
        var me = this, clip = me.getSelectedClip();
        if (clip) {
            var res = MEPH.audio.Audio.updatePitch(clip.buffer.buffer.getChannelData(0), me.source.buffer.buffer.sampleRate);
            me.detectedPitch = res;
        }
    },
    getSelectedClip: function () {
        var me = this,
            startstop = me.getStartEndPosition();
        if (startstop) {
            var start = startstop.start;
            var end = startstop.end;
            if (me.source) {
                var clip = me.getClip(me.source, start, end);
                return clip;
            }
        }
        return null;
    },
    getStartEndPosition: function () {
        var me = this,
         pixels = me.width;
        if (me.selectedRange) {
            var start = me.getAbsoluteMarkPosition(me.selectedRange.start / pixels) / me.source.buffer.buffer.sampleRate;
            var end = me.getAbsoluteMarkPosition((me.selectedRange.end) / pixels) / me.source.buffer.buffer.sampleRate;
            return {
                start: start,
                end: end
            }
        }
        return null;
    },
    detectPitches: function () {
        var me = this,
            startend = me.getStartEndPosition(),
            clip = me.getSelectedClip();
        if (clip) {
            var sampleRate = me.source.buffer.buffer.sampleRate;


            var res = MEPH.audio.Audio.detectPitches(clip.buffer.buffer.getChannelData(0), sampleRate, parseInt(me.pitchWindowSize));
            me.renderAreasOfInterest('pitches', res.select(function (x) {
                return {
                    start: x.start + startend.start * sampleRate,
                    key: x.key,
                    end: x.end + startend.start * sampleRate
                }
            }));
        }
    },
    detectSilence: function () {
        var me = this,
            startend = me.getStartEndPosition(),
            clip = me.getSelectedClip();

        if (clip) {
            var sampleRate = me.source.buffer.buffer.sampleRate;
            var res = MEPH.audio.Audio.detectSilence(clip.buffer.buffer.getChannelData(0), parseFloat(me.silenceThreshold), parseFloat(me.silenceTimeThreshold),
                parseFloat(me.silenceTimeSticky));
            me.renderAreasOfInterest('silence', res.select(function (x) {
                return {
                    start: x.start + startend.start * sampleRate,
                    end: x.end + startend.start * sampleRate
                }
            }));
        }
    },
    renderAreasOfInterest: function (type, areas) {
        var me = this,
            container = me.container,
            interestAreas = (me.$areasOfInterest || []).where(function (x) {
                if (type === undefined) return true;
                return x.type === type;
            });
        if (areas === undefined) {
            areas = (me.$areasOfInterest || []).select();
        }
        var newareas = areas.select(function (x) {
            var left = me.getRelativeMarkPosition(x.start);
            var right = me.getRelativeMarkPosition(x.end);
            if (right - left < 5) {
                return null;
            }
            var area = interestAreas.unshift(),
                div;

            if (area) {
                div = area.div;
            }

            div = div || document.createElement('div');
            Style.height(div, me.height);
            Style.absolute(div);
            Style.top(div, 0);
            div.classList.add('infoarea');
            div.classList.add('noresponse');
            if (type === 'pitches') {
                var h3 = document.createElement('h3');
                h3.innerHTML = x.key.note;
                div.appendChild(h3);
            }
            if (div.parentNode !== container)
                container.appendChild(div);
            Style.left(div, left);
            Style.width(div, right - left);
            return {
                div: div,
                start: x.start,
                type: type || x.type,
                end: x.end
            }
        }).where();
        interestAreas.foreach(function (t) {
            t.div.parentNode.removeChild(t.div);
        })

        me.$areasOfInterest = newareas;
    },
    addSelectionAsMarks: function () {
        var me = this, pixels = me.width;

        if (me.selectedRange) {
            var start = me.getAbsoluteMarkPosition(me.selectedRange.start / pixels);
            var end = me.getAbsoluteMarkPosition((me.selectedRange.end) / pixels);

            if (me.marks && !me.marks.some(function (x) {
           return x.position === start;
            })) {
                me.marks.push({
                    position: start,
                    type: me.marktype
                })
            }
            if (me.marks && !me.marks.some(function (x) {
          return x.position === end;
            })) {
                me.marks.push({
                    position: end,
                    type: me.marktype
                })
            }
        }
    },
    getAbsoluteMarkPosition: function (position) {
        var result,
            me = this,
            pixels = me.width,
            buffer = me.getBuffer();
        if (buffer) {
            var start = buffer.length * me.timeScroll;
            var length = (buffer.length * me.magnification);

            return (position * length) + start;
        }
    },
    shiftPitch: function () {
        var me = this;
        var sp = me.$signalProcessor;

        if (me.playingClip) {
            me.playingClip.stop();
            return;
        }
        var buffer = me.getBuffer();
        var audioresult = me.getSnippet();
        var inbucket;
        var outbucket;
        if (!audioresult) return;
        var audio = new MEPH.audio.Audio();
        audio.buffer(audioresult.buffer, { name: 'buffer' })
            .processor({
                name: 'proce',
                process: function (audioProcessingEvent) {
                    var inputBuffer = audioProcessingEvent.inputBuffer;
                    var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    var d = audioProcessingEvent.outputBuffer.getChannelData(0);
                    sp.pitchShift(parseFloat(me.pitchShift), inputData.length, inputData.length, 4, me.source.buffer.buffer.sampleRate, inputData, d);
                }
            })
            .complete();
        var snippet = audio.get({ name: 'buffer' });
        snippet.first().node.onended = function () {
            audio.disconnect();
            delete me.playingClip;
            delete audio;
            delete snippet.first().node;
        }
        me.playingClip = snippet.first().node;
        me.playingClip.start();

    },
    getSnippet: function () {
        var me = this,
           source = me.source,
           audio = new MEPH.audio.Audio(),
           magnification = parseFloat(me.magnification);
        if (me.source) {
            var start = me.getSnippetStart();
            var time = source.buffer.buffer.duration * magnification;
            var snippet = me.getClip(source, start, start + time);
            return snippet;
        }
        return null;
    },
    getSnippetStart: function () {
        var me = this, source = me.source,
           magnification = parseFloat(me.magnification),
           timeScroll = parseFloat(me.timeScroll);

        var start = timeScroll * source.buffer.buffer.duration;
        return start;
    },
    getClip: function (source, start, stop) {
        var snippet = MEPH.audio.Audio.clip(source, start, Math.min(source.buffer.buffer.duration, stop));
        return snippet;
    },
    playClip: function () {
        var me = this;
        if (me.playingClip) {
            me.playingClip.stop();
            return;
        }

        var snippet = me.getSnippet();;

        if (snippet) {
            snippet = me.$playSnippet(snippet);
        }

    },
    saveClip: function () {
        var me = this, snippet = me.getSnippet();

        if (!snippet) return;
        me.markCanvas.dispatchEvent(MEPH.createEvent('saveclip', {
            snippets: [snippet]
        }))
    },
    saveClips: function () {
        var me = this, source;
        if (!me.source) {
            return null;
        }
        source = me.source;
        var tmarks = me.marks.orderBy(function (x, y) {
            return x.position - y.position;
        });

        me.marks.length = 0;
        me.marks.push.apply(me.marks, tmarks);
        var res = me.marks.select(function (x, index) {
            if (index) {
                var mark = me.marks[index - 1];
                var end = me.marks[index] ? me.marks[index].position : source.buffer.buffer.length;
                var snippet = MEPH.audio.Audio.clipBuffer(me.source, mark.position, end);
                return snippet;
            }
            return false;
        }).where();

        if (res.length)
            me.markCanvas.dispatchEvent(MEPH.createEvent('saveclip', {
                snippets: res
            }))
    },
    cutSectionOut: function () {
        var me = this, pixels = me.width;
        if (me.selectedRange) {
            var start = me.getAbsoluteMarkPosition(me.selectedRange.start / pixels);
            var end = me.getAbsoluteMarkPosition((me.selectedRange.end) / pixels);
            if (end - start > 10) {
                var res = MEPH.audio.Audio.cutOutSection(me.source, start, end, null);
                me.source.buffer = res.buffer;
            }
        }
    },
    trimSection: function () {
        var me = this,
            pixels = me.width;
        if (me.selectedRange) {
            var start = me.getAbsoluteMarkPosition(me.selectedRange.start / pixels);
            var end = me.getAbsoluteMarkPosition((me.selectedRange.end) / pixels);
            console.log('start : ' + start + ' ' + ' end ' + end)
            if (end - start > 10) {
                me.marks.removeWhere(function (x) {
                    return x.position > end || x.position < start;
                });
                me.marks.where(function (x) {
                    return x.position < end && x.position > start;
                }).foreach(function (mark) {
                    mark.position -= start;
                })
                var res = MEPH.audio.Audio.clipBuffer(me.source, start, end, null);
                me.source.buffer = res.buffer;
            }
        }
    },
    $playSnippet: function (snippet) {
        var me = this;
        if (me.playingClip) {
            me.playingClip.stop();
        }
        if (snippet) {
            var audio = new MEPH.audio.Audio();
            audio.buffer(snippet.buffer.buffer, { name: 'buffer' }).gain({ name: 'gain', volume: 1 }).complete();
            var snippet = audio.get({ name: 'buffer' });
            snippet.first().node.onended = function () {
                audio.disconnect();
                if (me.getCurrentTime)
                    me.clipEnded = me.getCurrentTime();
                delete me.getCurrentTime;
                delete me.playingClip;
                delete audio;
                delete snippet.first().node;
            }
            me.playingClip = snippet.first().node;
            me.getCurrentTime = function () { return audio.getAudioContext().currentTime; }
            me.playingClip.start();
            me.startedTime = audio.getAudioContext().currentTime;

        }
        return snippet;
    },
    getRelativeMarkPosition: function (position) {
        var me = this,
            pixels = me.width,
            buffer = me.getBuffer();
        if (buffer) {
            var start = buffer.length * me.timeScroll;
            position -= start;
            var length = (buffer.length * me.magnification);
            position /= length;

            return (position) * pixels;
        }
    },
    getCurrentPosition: function () {
        var me = this;
        var position = parseFloat(me.position);
        var a = parseFloat(me.container.scrollLeft);
        var canvasWidth = parseFloat(me.canvas.clientWidth);
        var containerWidth = parseFloat(me.container.clientWidth);

        var windowWidth = Math.min(containerWidth, canvasWidth - a);
        var windowStep = windowWidth * position;

        return (windowStep + a) / canvasWidth
    },
    getMarkerPosition: function () {
        var me = this;
        var position = parseFloat(me.position);
        var a = parseFloat(me.container.scrollLeft);
        var canvasWidth = parseFloat(me.canvas.clientWidth);
        var containerWidth = parseFloat(me.container.clientWidth);

        var windowWidth = Math.min(containerWidth, canvasWidth - a);
        var windowStep = windowWidth * position;

        return (windowStep + a);
    },
    scanToMark: function (dir) {
        var me = this, buffer = me.getBuffer();
        if (buffer) {
            if (me.$currentMark === undefined) {
                var mark = me.marks.first();
                if (mark) {
                    me.timeScroll = mark.position / buffer.length;
                    me.$currentMark = 0;
                }
            }
            else {
                me.$currentMark = (me.$currentMark + parseInt(dir));
                if (me.$currentMark === me.marks.length) me.$currentMark = -1;
                if (me.$currentMark < -1) me.$currentMark = me.marks.length - 1;
                if (me.$currentMark === -1) {
                    me.timeScroll = 0;
                    return;
                }
                me.$currentMark = me.$currentMark % me.marks.length
                var position = me.marks[me.$currentMark].position;
                me.timeScroll = position / buffer.length;

            }
        }
    },
    updateStretchControls: function () {
        var me = this;
        if (me.stretchmarks) {
            var removed = me.stretchControls.removeWhere(function (btnObject) {
                return !me.stretchmarks.some(function (x) { return x === btnObject.marker; });
            });
            removed.foreach(function (control) {
                if (control.destroy) {
                    control.destroy();
                }
            });
            var newmarks = me.stretchmarks.where(function (x) {
                return !me.stretchControls.some(function (t) { return t.marker === x; })
            });

            var newmarkObjects = me.createNewStretchMarkerControls(newmarks);
            me.stretchControls.push.apply(me.stretchControls, newmarkObjects);
            me.stretchControls.foreach(function (x) {
                me.positionStretchControls(x);
            });
        }
    },
    updateMarkBtns: function () {
        var me = this;
        if (me.marks) {
            var removed = me.markerBtns.removeWhere(function (btnObject) {
                return !me.marks.some(function (x) { return x === btnObject.marker });
            });
            removed.foreach(function (x) {
                x.dom.parentNode.removeChild(x.dom);
            });
            var newmarks = me.marks.where(function (x) {
                return !me.markerBtns.some(function (t) { return t.marker === x; });
            });

            var newmarksObjects = me.createNewMarkerBtns(newmarks);
            me.markerBtns.push.apply(me.markerBtns, newmarksObjects);

            me.markerBtns.foreach(function (x) {
                var rel = me.getRelativeMarkPosition(x.marker.position, me.magnification, me.timeScroll);
                x.dom.style.left = (rel) + 'px';
                x.dom.style.top = (me.height - me.offsetbtnheight) + 'px';
            })
            //
        }
    },
    getBufferSampleRate: function () {
        var me = this, buffer = me.getBuffer();
        if (buffer)
            return me.source.buffer.buffer.sampleRate;
        return null;
    },
    getBufferLength: function () {
        var me = this, buffer = me.getBuffer();

        if (buffer) {
            return buffer.length;
        }
        return null;
    },
    createStretchPointFlow: function () {
        var me = this;

        if (!me.stretchPointFlowState) {
            me.stretchFlowState = 'Mark Start';
            me.playClip();
            me.stretchPointFlowState = {
                state: true,
                started: me.getCurrentTime()
            }
        }
        else if (me.stretchPointFlowState.state && me.getCurrentTime) {
            me.stretchPointFlowState.start = me.getCurrentTime();
            me.stretchPointFlowState.state = false;
            me.stretchFlowState = 'Mark End';
        }
        else if (!me.stretchPointFlowState.state) {
            if (me.getCurrentTime) {
                me.stretchPointFlowState.end = me.getCurrentTime();
            }
            else me.stretchPointFlowState.end = me.clipEnded;
            var samplerate = me.getBufferSampleRate();
            var start = me.getSnippetStart() + samplerate * (me.stretchPointFlowState.start - me.stretchPointFlowState.started);
            var end = me.getSnippetStart() + samplerate * (me.stretchPointFlowState.end - me.stretchPointFlowState.started);

            if (me.playingClip) {
                me.playingClip.stop();
            }
            me.$addStretchMark(start, end - start);
            me.stretchFlowState = '';
            me.stretchPointFlowState = null;
        }

    },
    getWindowfunctions: function () {
        var me = this;
        var res = [];
        for (var i in MEPH.math.Util.window) {
            res.push({ name: i, value: i })
        }

        return res;
    },
    createNewStretchMarkerControls: function (stretchmarks) {
        var me = this;
        return stretchmarks.select(function (x, index) {
            var stretchtemplate = me.createStretchMark();
            var anchorbtn = stretchtemplate.querySelector('[anchorbtn]');
            var targetbtn = stretchtemplate.querySelector('[targetbtn]');
            var stretchselect = stretchtemplate.querySelector('[stretchselect]');
            var stretchcontrol = stretchtemplate.querySelector('[stretchcontrol]');
            var stretchvalue = stretchtemplate.querySelector('[stretchvalue]');
            var removebtn = stretchtemplate.querySelector('[removebtn]');
            var stretchbeattarget = stretchtemplate.querySelector('[stretchbeattarget]');
            var stretchactualbeattarget = stretchtemplate.querySelector('[stretchactualbeattarget]');
            var addanchormarker = stretchtemplate.querySelector('[addanchormarker]');
            var addtargetmarker = stretchtemplate.querySelector('[addtargetmarker]');
            var stretchandplay = stretchtemplate.querySelector('[stretchandplay]');
            var normalplaybtn = stretchtemplate.querySelector('[normalplaybtn]');
            var windowfunction = stretchtemplate.querySelector('[windowfunction]');
            var saveclip = stretchtemplate.querySelector('[saveclip]');
            var savestretchclip = stretchtemplate.querySelector('[savestretchclip]');
            var windowfunctionspread = stretchtemplate.querySelector('[windowfunctionspread]');
            var notes = [{
                name: 'Sixteenth note', value: .25
            }, {
                name: 'Eighth note', value: .5
            }, {
                name: 'Quarter note', value: 1
            }, {
                name: 'Half note', value: 2
            }, {
                name: 'Whole note', value: 4
            }, {
                name: '2 Whole', value: 8
            }, {
                name: '4 Whole', value: 16
            }, {
                name: '8 Whole', value: 32
            }, {
                name: '16 Whole', value: 64
            }, {
                name: '32 Whole', value: 128
            }, {
                name: '64 Whole', value: 256
            }];

            notes.foreach(function (note) {
                MEPH.util.Dom.addOption(note.name, note.value, stretchbeattarget);
                MEPH.util.Dom.addOption(note.name, note.value, stretchactualbeattarget);
            });

            me.getWindowfunctions().foreach(function (x) {
                MEPH.util.Dom.addOption(x.name, x.value, windowfunction);
            });

            var control = {
                marker: x,
                dom: stretchtemplate,
                targetbtn: targetbtn,
                anchorbtn: anchorbtn,
                destroy: function () {
                }
            }
            var getwidth = function (bpm, val, samplerate) {
                return 1 / (bpm / 60) * val * samplerate;
            }
            stretchvalue.innerHTML = Math.round(100 * parseFloat(control.marker.stretch)) / 100;
            me.don('change', stretchbeattarget, function (control) {
                var val = parseFloat(stretchbeattarget.value);
                var bpm = parseFloat(me.beatsPerMin);
                if (bpm && me.source && me.source.buffer) {
                    var samplerate = me.source.buffer.buffer.sampleRate;
                    //60 / me.smallestnote / me.beatspermin;
                    var desiredwidth = getwidth(bpm, val, samplerate);;
                    var stretch = desiredwidth / control.marker.targetposition;
                    control.marker.stretch = stretch;
                    me.update();
                }
            }.bind(me, control));
            me.don('change', windowfunction, function (control) {
                var wf = windowfunction.value;
                if (MEPH.math.Util.window[wf]) {
                    control.marker.windowFunc = wf;
                    me.update();
                }
            }.bind(me, control));
            me.don('change', windowfunctionspread, function (control) {
                if (MEPH.math.Util.window[control.marker.windowFunc]) {
                    var wfv = parseFloat(windowfunctionspread.value);
                    control.marker.windowFuncValue = wfv;
                    me.update();
                }
            }.bind(me, control))
            me.don('change', stretchactualbeattarget, function (control) {
                var val = parseFloat(stretchactualbeattarget.value);
                var bpm = parseFloat(me.beatsPerMin);
                if (bpm && me.source && me.source.buffer) {
                    var samplerate = me.source.buffer.buffer.sampleRate;
                    var desiredwidth = getwidth(bpm, val, samplerate);
                    control.marker.targetposition = desiredwidth;
                    me.update();
                }
            }.bind(me, control))
            me.don('click', saveclip, function (control) {
                var sampleRate = me.getBufferSampleRate();
                var windowing = control.marker.windowFunc ? me.createWindow(control.marker.targetposition, control.marker.windowFunc, control.marker.windowFuncValue) : null;
                var snippet = MEPH.audio.Audio.clipBuffer(me.source, control.marker.position, control.marker.position + control.marker.targetposition, null, windowing);
                var signal = snippet.buffer.buffer.getChannelData(0);
                var audio = new MEPH.audio.Audio();
                var audioresult = audio.copyToBuffer(snippet, 0, signal.length / sampleRate);
                me.markCanvas.dispatchEvent(MEPH.createEvent('saveclip', {
                    snippets: [snippet]
                }))
            }.bind(me, control))
            me.don('click', normalplaybtn, function (control) {
                var sampleRate = me.getBufferSampleRate();

                var snippet = MEPH.audio.Audio.clipBuffer(me.source, control.marker.position, control.marker.position + control.marker.targetposition);
                var signal = snippet.buffer.buffer.getChannelData(0);

                var audio = new MEPH.audio.Audio();
                var audioresult = audio.copyToBuffer(snippet, 0, signal.length / sampleRate);
                me.$playSnippet(audioresult)

            }.bind(me, control));
            me.don('click', savestretchclip, function (control) {
                var sampleRate = me.getBufferSampleRate();
                var item = me.getCache({
                    sampleRate: sampleRate,
                    position: control.marker.position,
                    targetposition: control.marker.targetposition,
                    stretch: control.marker.stretch
                })
                if (item) {
                    var windowing = control.marker.windowFunc ? me.createWindow(control.marker.targetposition, control.marker.windowFunc, control.marker.windowFuncValue) : null;
                    var snippet = MEPH.audio.Audio.clipBuffer(me.getResource(item.resource, item.sampleRate), 0, item.resource.length, null, windowing);
                    var signal = snippet.buffer.buffer.getChannelData(0);
                    var audio = new MEPH.audio.Audio();
                    var audioresult = audio.copyToBuffer(snippet, 0, signal.length / sampleRate);
                    //var snippet = audio.copyToBuffer(me.getResource(item.resource, item.sampleRate), 0, item.resource.length / item.sampleRate);
                    me.markCanvas.dispatchEvent(MEPH.createEvent('saveclip', {
                        snippets: [audioresult]
                    }))
                }
            }.bind(me, control))
            me.don('click', stretchandplay, function (control) {
                var audio = new MEPH.audio.Audio();
                var sampleRate = me.getBufferSampleRate();
                var item = me.getCache({
                    sampleRate: sampleRate,
                    position: control.marker.position,
                    targetposition: control.marker.targetposition,
                    stretch: control.marker.stretch
                })
                if (item) {
                    var audioresult = audio.copyToBuffer(me.getResource(item.resource, item.sampleRate), 0, item.resource.length / item.sampleRate);
                    me.$playSnippet(audioresult);
                    return;
                }
                var snippet = MEPH.audio.Audio.clipBuffer(me.source, control.marker.position, control.marker.position + control.marker.targetposition);
                var signal = snippet.buffer.buffer.getChannelData(0);
                var sp = me.$signalProcessor;
                var sres = sp.modifySignal(1, [{ start: 0, scale: 0 }, { start: 1, scale: control.marker.stretch || 1 }], 4096, 8, sampleRate, signal);


                var audioresult = audio.copyToBuffer(me.getResource(sres, sampleRate), 0, sres.length / sampleRate);
                me.cacheAudio({
                    resource: sres,
                    sampleRate: sampleRate,
                    position: control.marker.position,
                    targetposition: control.marker.targetposition,
                    stretch: control.marker.stretch
                })
                me.$playSnippet(audioresult);
            }.bind(me, control));
            me.don('click', addanchormarker, function (control) {
                me.$addMark(control.marker.position);
            }.bind(me, control));

            me.don('click', addtargetmarker, function (control) {
                me.$addMark(control.marker.position + control.marker.targetposition);
            }.bind(me, control));

            me.don('click', removebtn, function (control) {
                me.stretchmarks.removeWhere(function (x) { return x === control.marker })
                stretchtemplate.parentNode.removeChild(stretchtemplate);
                me.update();
            }.bind(me, control))
            me.don('mouseover', stretchtemplate, function () {
                Style.show(stretchcontrol);
            });
            me.don('mouseout', stretchtemplate, function () {
                Style.hide(stretchcontrol);
            });
            me.don('change', stretchselect, function (control) {
                stretchvalue.innerHTML = Math.round(100 * parseFloat(stretchselect.value)) / 100;
                control.marker.stretch = parseFloat(stretchselect.value);
                me.update();
            }.bind(me, control));
            me.don('click', anchorbtn, function (x) {
                me.toggleStretchMarkerDrag(x, 'dom');
            }.bind(me, control));

            me.don('click', targetbtn, function (x) {
                me.toggleStretchMarkerDrag(x, 'targetbtn');
            }.bind(me, control));


            return control;
        })
    },
    cacheAudio: function (item) {
        var me = this;
        me.$audioCache = me.$audioCache || [];

        me.$audioCache.push(item);

        if (me.$audioCache.length > me.maxCache) {
            me.$audioCache = me.$audioCache.subset(me.maxCache - me.$audioCache.length);
        }
    },
    getCache: function (item) {
        var me = this;
        me.$audioCache = me.$audioCache || [];

        return me.$audioCache.first(function (it) {
            for (var i in item) {
                if (item[i] !== it[i]) {
                    return false
                }
            }
            return true;
        })
    },
    toggleStretchMarkerDrag: function (x, target) {
        var me = this;
        if (!me.stretchdrag) {
            me.stretchdrag = {
                marker: x.marker,
                target: target,
                callback: function () {
                    me.positionStretchControls(x);
                    me.update()
                }
            }
        }
        else {
            me.stretchdrag = false;
        }
    },
    onMouseMove: function () {
        var me = this, pos;
        if (me.stretchdrag) {
            pos = MEPH.util.Dom.getEventPositions(MEPH.Array(arguments).last().domEvent).first();
            if (pos) {
                pos.x += -50;
                var abspos = me.getAbsoluteMarkPosition(pos.x / me.width);
                switch (me.stretchdrag.target) {
                    case 'targetbtn':
                        me.stretchdrag.marker.targetposition = abspos - me.stretchdrag.marker.position;
                        break;
                    default:
                        me.stretchdrag.marker.position = abspos;
                        break;

                }
                me.stretchdrag.callback();
            }
        }
        else {
            me.great();
        }
    },

    getResource: function (result, sampleRate) {
        sampleRate = sampleRate || 44100
        var resource = {
            buffer: {
                buffer: {
                    getChannelData: function () {
                        return result;
                    },
                    sampleRate: sampleRate
                },
                channelCount: 1
            }
        };
        return resource;
    },
    positionStretchControls: function (control) {
        var me = this;
        var rel = me.getRelativeMarkPosition(control.marker.position);

        var targetrel = me.getRelativeMarkPosition(control.marker.position + control.marker.targetposition);

        control.dom.style.left = (rel) + 'px';
        control.dom.style.top = (me.offsetstretchvertical) + 'px';
        Style.top(control.targetbtn, (0));
        Style.left(control.targetbtn, (targetrel - rel));
    },

    createNewMarkerBtns: function (newmarks) {
        var me = this;
        return newmarks.select(function (x, index) {
            var btntemplate = me.createMarkerBtn();
            var btn = btntemplate.querySelector('[removebtn]');
            me.don('click', btn, function (x) {
                me.marks.removeWhere(function (y) { return y === x; });
            }.bind(me, x));

            me.don('click', btntemplate.querySelector('[playbtn]'), function (x) {
                console.log('play snippet')
                me.playSnippet(x);
            }.bind(me, x))

            return {
                marker: x,
                dom: btntemplate
            }
        })
    },
    /**
     * Plays the snippet.
     * @param {Object} percentage
     ***/
    playSnippet: function (mark) {
        var me = this;
        var tmarks = me.marks.orderBy(function (x, y) {
            return x.position - y.position;
        });
        me.marks.length = 0;
        me.marks.push.apply(me.marks, tmarks);
        var index = me.marks.indexWhere(function (x) {
            return x.position === mark.position;
        }).first();
        if (index !== null) {
            var end = me.marks[index + 1] ? me.marks[index + 1].position : me.source.buffer.buffer.length;
            var snippet = MEPH.audio.Audio.clipBuffer(me.source, mark.position, end);
            me.$playSnippet(snippet)
        }
    },
    createMarkerBtn: function () {
        var me = this;
        var clone = me.markerBtnTemplate.cloneNode(true);
        me.markerCanvas.parentNode.appendChild(clone);
        return clone;
    },
    createStretchMark: function () {
        var me = this;
        var clone = me.stretchMarkTemplate.cloneNode(true);
        me.stretcherCanvas.parentNode.appendChild(clone);
        return clone;
    },
    update: function () {
        var me = this;
        return Promise.resolve().then(function () {
            me.updateMarkBtns();
            me.updateStretchControls();
        }).then(function () {
            return me.updateMarks()
        }).then(function () {
            return me.updateMarker();
        }).then(function () {
            return me.updateStretcher();
        }).then(function () {
            me.draw();
        }).then(function () {
            me.renderAreasOfInterest();
        });
    },
    updateBpm: function () {
        var me = this;
        if (me.source) {
            MEPH.audio.Audio.bpm(me.source.buffer).then(function (res) {
                if (res && res.length) {
                    var bpm = res.subset(0, 4)
                        .orderBy(function (x, y) {
                            return y.count - x.count;
                        })
                        .select(function (x, index) {
                            return 'Tempo :' + x.tempo + '(Score:' + x.count + ')  ';
                        }).join('|');
                    setTimeout(function () {
                        me.calculatedBpm = bpm;
                    }, 10)
                }
            })['catch'](function (e) {
                MEPH.Log(e);
            });
        }
    },
    updateMarks: function () {
        var me = this;


        return me.render();
    },
    updateStretcher: function () {
        var me = this;
        if (me.stretcherFrame)
            cancelAnimationFrame(me.stretcherFrame);
        if (me.stretcherrenderer) {
            me.stretcherrenderer.clear();
        }
        me.stretcherFrame = requestAnimationFrame(function () {
            me.stretcherFrame = null;
            var HEIGHT = me.height;
            var WIDTH = me.width;
            if (!me.stretcherrenderer) {
                me.stretcherrenderer = new MEPH.util.Renderer();
                me.stretcherrenderer.setCanvas(me.stretcherCanvas);
            }

            me.stretcherrenderer.clear();
            if (me.stretchmarks) {
                var lines = me.stretchmarks.concatFluent(function (x) {
                    var xpos = me.getRelativeMarkPosition(x.position);
                    var xtpos = me.getRelativeMarkPosition(x.position + x.targetposition);
                    var diffx = x.targetposition;
                    var targetxpos = me.getRelativeMarkPosition(x.position + diffx * (x.stretch || 1));

                    var res = [{
                        shape: MEPH.util.Renderer.shapes.polygon,
                        lb: {
                            x: xpos,
                            y: HEIGHT / 2
                        },
                        rb: {
                            x: xtpos,
                            y: HEIGHT / 2
                        },
                        rt: {
                            x: targetxpos,
                            y: me.offsetstretchvertical
                        },
                        lt: {
                            x: xpos,
                            y: me.offsetstretchvertical
                        },
                        fillStyle: me.markscolorbg
                    }, {
                        shape: MEPH.util.Renderer.shapes.line,
                        lineWidth: me.stretchlinewidth,
                        end: {
                            x: xtpos,
                            y: HEIGHT / 2
                        },
                        start: {
                            x: targetxpos,
                            y: me.offsetstretchvertical
                        },
                        strokeStyle: me.markscolor
                    }, {// 
                        shape: MEPH.util.Renderer.shapes.line,
                        lineWidth: me.stretchlinewidth,
                        end: {
                            x: xpos,
                            y: HEIGHT / 2
                        },
                        start: {
                            x: xpos,
                            y: me.offsetstretchvertical
                        },
                        strokeStyle: me.markscolor
                    }];
                    if (x.windowFunc) {
                        var width = Math.floor(xtpos - xpos);
                        var blocksize = 4;
                        var blockspace = 10;
                        var N = (width / blockspace);
                        //var wfv = x.windowFuncValue * N || 0;
                        //var hwfv = wfv / 2 + N / 2;
                        //var lwfv = N / 2 - wfv / 2;
                        //[].interpolate(0, N, function (n) {
                        //    var r = MEPH.math.Util.window[x.windowFunc](n, N);
                        //    if (hwfv > n && lwfv < n) {
                        //        r = 1;
                        //    }
                        //    else {
                        //        if (n < lwfv) {
                        //            r = MEPH.math.Util.window[x.windowFunc](n, N - wfv);
                        //        }
                        //        else
                        //            r = MEPH.math.Util.window[x.windowFunc](n - wfv, N - wfv);
                        //    }
                        //    return r;
                        //})
                        me.createWindow(N, x.windowFunc, x.windowFuncValue)
                            .select(function (r, n) {
                                return {
                                    shape: MEPH.util.Renderer.shapes.circle,
                                    lineWidth: me.stretchlinewidth,
                                    y: HEIGHT / 2 - HEIGHT / 2 * r + (me.windowpadding || 0),
                                    x: n * blockspace + xpos,
                                    fillStyle: me.windowingcolor,
                                    radius: blocksize
                                }
                            }).foreach(function (t) { res.push(t) });
                    }
                    return res;
                });
                me.renderer.draw(lines);
            }
            rsolve();
        });
        var rsolve;
        return new Promise(function (r) {
            rsolve = r;
        });
    },
    createWindow: function (N, wf, wfv) {
        wfv = wfv * N || 0;
        var hwfv = wfv / 2 + N / 2;
        var lwfv = N / 2 - wfv / 2;
        return [].interpolate(0, N, function (n) {
            var r = MEPH.math.Util.window[wf](n, N);
            if (hwfv > n && lwfv < n) {
                r = 1;
            }
            else {
                if (n < lwfv) {
                    r = MEPH.math.Util.window[wf](n, N - wfv);
                }
                else
                    r = MEPH.math.Util.window[wf](n - wfv, N - wfv);
            }
            return r;
        });
    },
    updateMarker: function () {
        var me = this;
        if (me.markerFrame)
            cancelAnimationFrame(me.markerFrame)
        me.markerFrame = requestAnimationFrame(function () {
            var HEIGHT = me.height;
            var WIDTH = me.width;
            me.markerFrame = null;

            if (!me.markerrenderer) {
                me.markerrenderer = new MEPH.util.Renderer();
                me.markerrenderer.setCanvas(me.markerCanvas);
            }
            me.markerrenderer.clear();
            var xpos = me.getMarkerPosition();
            me.markerrenderer.draw({
                shape: MEPH.util.Renderer.shapes.line,
                end: {
                    x: xpos,
                    y: HEIGHT
                },
                start: {
                    x: xpos,
                    y: 0
                },
                strokeStyle: me.markercolor
            });
            rsolve();
        });
        var rsolve;
        return new Promise(function (r) {
            rsolve = r;
        });
    },
    stectchClip: function () {
        var me = this,
            source = me.source,
            stretchvalue = parseFloat(me.stretchValue) || 1;
        if (source) {
            me.source = MEPH.audio.Audio.stretch(source, stretchvalue);
        }
    },
    render: function () {
        var me = this;
        if (me.markframe)
            cancelAnimationFrame(me.markframe)
        me.markframe = requestAnimationFrame(function () {
            var HEIGHT = me.height;
            var WIDTH = me.width;
            var dataArray = me.source;
            me.markframe = null;

            if (!me.renderer) {
                me.renderer = new MEPH.util.Renderer();
                me.renderer.setCanvas(me.markCanvas);
            }


            me.renderer.clear();
            if (me.marks) {
                var lines = me.marks.select(function (x) {
                    var xpos = me.getRelativeMarkPosition(x.position, me.magnification, me.timeScroll);
                    return {
                        shape: MEPH.util.Renderer.shapes.line,
                        end: {
                            x: xpos,
                            y: HEIGHT
                        },
                        start: {
                            x: xpos,
                            y: 0
                        },
                        strokeStyle: me.markscolor
                    }
                });
                me.renderer.draw(lines);
            }
            rsolve();
        });
        var rsolve;
        return new Promise(function (r) {
            rsolve = r;
        });
    }
});