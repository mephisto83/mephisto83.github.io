(function loadTests() {

    mephFrameWork('MEPH', '../src');

    MEPH.ready().then(function () {
        /**
         * Custom Matchers
         */
        var jasmineDescribe = describe;
        jasmine.getEnv().defaultTimeoutInterval = 10000;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        MEPH.waitFor = function (func) {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(func());
                }, 50)
            });
        };

        MEPH.continueWhen = function (func) {
            var resolve,
                fail,
                promise = new Promise(function (res, f) {
                    resolve = res;
                    fail = f;
                });
            var count = 0;
            var interval = setInterval(function () {
                if (func()) {
                    clearInterval(interval);
                    resolve();
                    return;
                }
                count++;
                if (count > 200) {
                    clearInterval(interval);
                }
            }, 50);

            return promise;
        };
        window.describe = function () {
            var args = MEPH.util.Array.convert(arguments);
            var name = args.first();
            var funcIndex = args.indexWhere(function (x) { return typeof x === 'function'; }).first();
            if (funcIndex === 1) {
                jasmineDescribe(name, args[funcIndex]);
            }
            else {
                MEPH.requires.apply(this, args.subset(1, funcIndex)).then(function () {
                    jasmineDescribe(name, args[funcIndex]);
                })
            }
        }
        MEPH.render = function (type, tagname, injections) {
            var app;
            return MEPH.requires(type, 'MEPHTests.helper.Application').then(function () {
                app = new MEPHTests.helper.Application();
                dom = app.createAppSpace(), div = document.createElement('div');
                div.innerHTML = '<' + tagname + '></' + tagname + '>';
                return app.create(type, div.firstElementChild, injections);
            }).then(function (results) {
                return app.loadViewObject([results], dom);
            }).then(function (results) {
                return {
                    res: results,
                    app: app
                };
            })
        }
        MEPH.customMatchers = {
            caught: function (util, customEqualityTesters) {
                return {
                    compare: function (actual, expected) {
                        if (expected === 'undefined') {
                            expected = '';
                        }

                        var result = {};
                        result.pass = actual.stack ? false : true;
                        if (!result.pass) {
                            result.message = 'Caught an expection : \n ' + actual.stack;
                            console.log(actual.stack);
                        }
                        else {
                            result.message = '';
                        }
                        return result;
                    }
                }
            },
            theTruth: function (util, customEqualityTesters) {
                return {
                    compare: function (actual, reason) {
                        if (reason === undefined) {
                            reason = '';
                        }
                        var result = { message: '' };
                        result.pass = actual;
                        if (!result.pass) {
                            result.message = reason;
                        }
                        return result;
                    }
                };
            }
        };
    }).then(function () {
        MEPH.setPath('../src', 'MEPH');
        MEPH.setPath('../specs', 'MEPHTests');
        MEPH.setPath('../specs/data', 'dataviews');
        MEPH.namespace('MEPHTests');
        MEPH.setInterval = function () { }
        MEPHTests.loadTests = function () {
            function loadScriptFiles() {
                var promise,
                    i,
                    tests = [
                        'MEPH.spec.js',
                        'audio/Audio.spec.js',
                        'audio/AudioResources.spec.js',
                        'audio/Recorder.spec.js',
                        'audio/Scheduler.spec.js',
                        'audio/Sequence.spec.js',
                        'audio/effects/AAFilter.spec.js',
                        'audio/effects/FIRFilter.spec.js',
                        'audio/graph/AudioGraph.spec.js',
                        'audio/graph/node/controls/Control.spec.js',
                        'audio/graph/node/AudioBufferSourceNode.spec.js',
                        'audio/graph/node/BiquadFilter.spec.js',
                        'audio/graph/node/ChannelMergerNode.spec.js',
                        'audio/graph/node/ChannelSplitterNode.spec.js',
                        'audio/graph/node/Convolver.spec.js',
                        'audio/graph/node/DelayNode.spec.js',
                        'audio/graph/node/DynamicsCompressorNode.spec.js',
                        'audio/graph/node/GainNode.spec.js',
                        'audio/graph/node/GeneratedNode.spec.js',
                        'audio/graph/node/InputNode.spec.js',
                        'audio/graph/node/Node.spec.js',
                        'audio/graph/node/OscillatorNode.spec.js',
                        'audio/graph/node/PannerNode.spec.js',
                        'audio/graph/node/SequenceNode.spec.js',
                        'audio/graph/node/WaveShaperNode.spec.js',
                        'audio/graph/AudioGraphReader.spec.js',
                        'audio/midi/controller/MidiController.spec.js',
                        'audio/processor/FIFOSampleBuffer.spec.js',
                        'audio/processor/RateTransposer.spec.js',
                        'audio/processor/TDStretch.spec.js',
                        'audio/processor/SoundProcessor.spec.js',
                        'audio/music/instrument/Instrument.spec.js',
                        'audio/music/instrument/piano/GrandPiano.spec.js',
                        'audio/music/instrument/trumpet/Trumpet.spec.js',
                        'audio/music/instrument/SoundFontInstrument.spec.js',
                        'audio/music/theory/Notes.spec.js',
                        'audio/music/theory/Scales.spec.js',
                        'audio/sbsms/TrackPoint.spec.js',
                        'audio/sbsms/Slice.spec.js',
                        'audio/sbsms/SMS.spec.js',
                        'audio/sbsms/SynthRenderer.spec.js',
                        'audio/sbsms/Subband.spec.js',
                        'audio/sbsms/Track.spec.js',
                        'audio/sbsms/Util.spec.js',
                        'audio/soundfont/SFObject.spec.js',
                        'audio/soundfont/ZoneContainer.spec.js',
                        'audio/soundfont/chunks/Subchunk.spec.js',
                        'audio/soundfont/chunks/data/GeneratorRecord.spec.js',
                        'audio/soundfont/chunks/data/GeneratorsSubchunk.spec.js',
                        'audio/soundfont/chunks/data/ZoneRecord.spec.js',
                        'audio/soundfont/chunks/data/operators/Operator.spec.js',
                        'audio/soundfont/chunks/data/operators/KeyRange.spec.js',
                        'audio/soundfont/chunks/data/operators/OperatorFactory.spec.js',
                        'audio/soundfont/chunks/data/operators/RangeOperator.spec.js',
                        'audio/soundfont/chunks/data/operators/SampleOperator.spec.js',
                        'audio/soundfont/chunks/data/operators/StartAddressOffset.spec.js',
                        'audio/soundfont/utils/SFByteArray.spec.js',
                        'audio/view/AudioResourceManager.spec.js',
                        'audio/view/AudioSequencer.spec.js',
                        'audio/view/Visualizer.spec.js',
                        'audio/view/VisualSelector.spec.js',
                        'application/Application.spec.js',
                        'bind/Binder.spec.js',
                        'build/MinificationBatchCreate.spec.js',
                        'button/Button.spec.js',
                        'button/IconButton.spec.js',
                        'control/Control.spec.js',
                        'controller/Controller.spec.js',
                        'dom/ControlLoader.spec.js',
                        'dom/ControlReader.spec.js',
                        'field/FormField.spec.js',
                        'file/Dropbox.spec.js',
                        'gpu/Context.spec.js',
                        'graph/ActiveZone.spec.js',
                        'graph/ConnectionHandler.spec.js',
                        'graph/Graph.spec.js',
                        'graph/GraphControl.spec.js',
                        'graph/GraphRenderer.spec.js',
                        'graph/GraphViewPort.spec.js',
                        'graph/SVGGraphRenderer.spec.js',
                        'graph/renderer/BlenderNode.spec.js',
                        'graph/renderer/ConnectionRenderer.spec.js',
                        'graph/renderer/SquareBoxRenderer.spec.js',
                        'graph/renderer/svg/BlenderNodeRenderer.spec.js',
                        'graph/Node.spec.js',
                        'graph/Connection.spec.js',
                        'identity/IdentityProvider.spec.js',
                        'input/Input.spec.js',
                        'ioc/Container.spec.js',
                        'pad/DrawingSurface.spec.js',
                        'list/List.spec.js',
                        'math/jax/MathJax.spec.js',
                        'math/expression/Evaluator.spec.js',
                        'math/expression/Factor.spec.js',
                        'math/Expression.spec.js',
                        'math/Expression_2.spec.js',
                        'math/Expression_3.spec.js',
                        'math/Expression_4.spec.js',
                        'math/Expression_5.spec.js',
                        'math/FFT.spec.js',
                        'math/Hamilton.spec.js',
                        'math/Matrix.spec.js',
                        'math/Matrix3d.spec.js',
                        'math/Set.spec.js',
                        'math/Quaternion.spec.js',
                        'math/Util.spec.js',
                        'math/Vector.spec.js',
                        'mixins/Observable.spec.js',
                        'mobile/activity/ActivityController.spec.js',
                        'mobile/activity/container/Container.spec.js',
                        'mobile/application/container/MobileApplicationContainer.spec.js',
                        'mobile/application/controller/MobileApplicationController.spec.js',
                        'mobile/application/menu/ActivityMenuProvider.spec.js',
                        'mobile/application/menu/ApplicationMenu.spec.js',
                        'mobile/application/menu/ApplicationMenuProvider.spec.js',
                        'mobile/application/menuview/ApplicationMenuView.spec.js',
                        'mobile/application/menuview/ApplicationMenuCategories.spec.js',
                        'mobile/mixins/Activity.spec.js',
                        'mobile/Application.spec.js',
                        'mobile/providers/identity/FacebookProvider.spec.js',
                        'mobile/providers/identity/IdentityProvider.spec.js',
                        'mobile/providers/menuprovider/MenuProvider.spec.js',
                        'mobile/providers/viewprovider/ViewProvider.spec.js',
                        'mobile/services/MobileServices.spec.js',
                        'panel/flyout/FlyoutPanel.spec.js',
                        'panel/Panel.spec.js',
                        'qrcode/Qrcode.spec.js',
                        'ringcode/RingCode.spec.js',
                        'remoting/RemotingController.spec.js',
                        'scrollbar/Scrollbar.spec.js',
                        'service/rtc/Connection.spec.js',
                        'service/ServiceCaller.spec.js',
                        'service/SignalRService.spec.js',
                        'session/SessionManager.spec.js',
                        'signalprocessing/SignalProcessor.spec.js',
                        'signalprocessing/Spectrogram.spec.js',
                        'synchronization/SyncArray.spec.js',
                        'synchronization/SyncConflictNegotiator.spec.js',
                        'synchronization/SyncMembrane.spec.js',
                        'synchronization/SyncObject.spec.js',
                        'table/Sequencer.spec.js',
                        'table/SpreadSheet.spec.js',
                        'tree/Tree.spec.js',
                        'tween/Calculator.spec.js',
                        'tween/TweenEditor.spec.js',
                        'util/DataModel.spec.js',
                        'util/Dom.spec.js',
                        'util/Features.spec.js',
                        'util/Task.spec.js',
                        'util/IndexedStorage.spec.js',
                        'util/Manifest.spec.js',
                        'util/Observable.spec.js',
                        'util/Rest.spec.js',
                        'util/Queryable.spec.js',
                        'util/String.spec.js',
                        'util/Renderer.spec.js',
                        'util/SVG.spec.js',
                        'util/Validatable.spec.js',
                        'util/Template.spec.js',
                        'query/QueryableWorker.spec.js',
                        'webgl/Context.spec.js'
                    ];

                promise = Promise.resolve();
                for (i = 0 ; i < tests.length ; i++) {
                    promise = promise.then(function () {
                        return MEPH.Loader.loadScript(tests[this]).catch(function () {
                        });
                    }.bind(i));
                }
                promise.then(function () {
                    //jasmine.getEnv().execute();
                });
            }
            loadScriptFiles();

        };
        MEPHTests.loadTests();
    });
})();
