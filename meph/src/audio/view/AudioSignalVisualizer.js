/*global MEPH*/

/**
* @class
*
* This is a convenient way of defining a visual selector.
*/
MEPH.define('MEPH.audio.view.AudioSignalVisualizer', {
    alias: 'audiosignalvisualizer',
    extend: 'MEPH.audio.view.Visualizer',
    requires: ['MEPH.input.Range',
        'MEPH.util.Renderer',
        'MEPH.signalprocessing.SignalProcessor'],
    templates: true,

    properties: {
        stop: 100,
        position: 0,
        step: .0001,
        markBtnText: 'Mark',
        max: null,
        min: null,
        marks: null,
        offsetbtnheight: 19,
        marktype: 'default',
        markercolor: '#d9534f',
        markscolor: '#f0ad4e',
        markerBtns: null,
        pitchShift: .5,
        pitchWindowSize: 1000,
        smallestStep: 0.0000001,
        silenceThreshold: 0,
        silenceTimeSticky: 0,
        silenceTimeThreshold: 0,
        renderer: null,
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
        me.$signalProcessor = new SignalProcessor();;

        Observable.defineDependentProperty('silenceThresholdHeight', me, ['silenceThreshold'], me.calculateSilenceThreholdHeight.bind(me));
        me.on('altered', function (type, args) {
            if (args.path === 'marks') {
                if (me.marks) {
                    me.marks.on('changed', me.update.bind(me));
                }
                me.update();

            }

            if (args.path === 'vertical' || args.path === 'scrollMutiplier' || args.path === 'scrollleft') {
                me.update();
            }
        });
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
        var absPosition = me.getAbsoluteMarkPosition(relativePosition, me.magnification, me.timeScroll)
        if (me.marks && !me.marks.some(function (x) {
            return x.position === absPosition;
        })) {
            me.marks.push({
                position: absPosition,
                type: me.marktype
            })
        }
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
        me.clearAreasOfInterest();
        if (clip) {
            var sampleRate = me.source.buffer.buffer.sampleRate;
            if (me.$detectedSilence) {

                var res = me.$detectedSilence.select(function (x, index) {
                    if (index) {
                        return {
                            start: me.$detectedSilence[index - 1].end,
                            end: me.$detectedSilence[index].start,
                            length: me.$detectedSilence[index].start - me.$detectedSilence[index - 1].end
                        }
                    }
                    else {
                        return {
                            start: 0,
                            end: x.start,
                            length: x.start
                        }
                    }
                });

                var pitches = res.where(function (x) { return x.length > 4000; }).select(function (x) {
                    var $clip = me.getClip(clip, x.start / sampleRate, (x.start + x.length) / sampleRate);
                    var res = MEPH.audio.Audio.detectPitches($clip.buffer.buffer.getChannelData(0), sampleRate, parseInt(me.pitchWindowSize));
                    var sp = new SignalProcessor();
                    res = sp.getNotes($clip.buffer.buffer.getChannelData(0), sampleRate, 4000, 4096 * 2, 512);
                    //var note = res.select(function (x) { return x.key.note }).mostcommon(function (x) { return x; });
                    var note = res.select(function (x) { return x }).mostcommon(function (x) { return x; });
                    return {
                        start: x.start + startend.start * sampleRate,
                        end: x.end + startend.start * sampleRate,
                        key: { note: note }
                    }
                });

                me.renderAreasOfInterest('pitches', pitches);
            }
            else {
                me.renderAreasOfInterest();
                var res = MEPH.audio.Audio.detectPitches(clip.buffer.buffer.getChannelData(0), sampleRate, parseInt(me.pitchWindowSize));
                me.renderAreasOfInterest('pitches', res.select(function (x) {
                    return {
                        start: x.start + startend.start * sampleRate,
                        key: x.key,
                        end: x.end + startend.start * sampleRate
                    }
                }));
            }
        }
    },
    detectSilence: function () {
        var me = this,
            startend = me.getStartEndPosition(),
            clip = me.getSelectedClip();
        me.clearAreasOfInterest();
        if (clip) {
            var sampleRate = me.source.buffer.buffer.sampleRate;
            var res = MEPH.audio.Audio.detectSilence(clip.buffer.buffer.getChannelData(0), parseFloat(me.silenceThreshold), parseFloat(me.silenceTimeThreshold),
                parseFloat(me.silenceTimeSticky));
            me.$detectedSilence = res;
            me.renderAreasOfInterest('silence', res.select(function (x) {
                return {
                    start: x.start + startend.start * sampleRate,
                    end: x.end + startend.start * sampleRate
                }
            }));
        }
    },
    clearAreasOfInterest: function () {
        var me = this, area;

        areas = (me.$areasOfInterest || []).select();
        areas.foreach(function (t) {
            t.div.parentNode.removeChild(t.div);
        })
        me.$areasOfInterest = [];
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
                div.classList.add('pitches');
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
    getAbsoluteMarkPosition: function (position, magnification, timeOffset) {
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
           magnification = parseFloat(me.magnification),
           timeScroll = parseFloat(me.timeScroll);
        if (me.source) {
            var start = timeScroll * source.buffer.buffer.duration;
            var time = source.buffer.buffer.duration * magnification;
            var snippet = me.getClip(source, start, start + time);
            return snippet;
        }
        return null;
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
        if (snippet) {
            var audio = new MEPH.audio.Audio();
            audio.buffer(snippet.buffer.buffer, { name: 'buffer' }).gain({ name: 'gain', volume: 1 }).complete();
            var snippet = audio.get({ name: 'buffer' });
            snippet.first().node.onended = function () {
                audio.disconnect();
                delete me.playingClip;
                delete audio;
                delete snippet.first().node;
            }
            me.playingClip = snippet.first().node;
            me.playingClip.start();

        }
        return snippet;
    },
    getRelativeMarkPosition: function (position, magnification, timeOffset) {
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
            var end = me.marks[index + 1] ? me.marks[index + 1].position : source.buffer.buffer.length;
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
    update: function () {
        var me = this;
        return Promise.resolve().then(function () {
            me.updateMarkBtns();
        }).then(function () {
            return me.updateMarks()
        }).then(function () {
            return me.updateMarker();
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
    updateMarker: function () {
        var me = this;
        if (me.markerFrame)
            cancelAnimationFrame(me.markerFrame)
        me.markerFrame = requestAnimationFrame(function () {
            var HEIGHT = me.height;
            var WIDTH = me.width;
            var dataArray = me.source;
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