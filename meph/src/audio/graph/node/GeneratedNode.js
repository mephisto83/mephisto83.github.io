/**
 * @class MEPH.audio.graph.node.GeneratedNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.GeneratedNode', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'generatednode',
    templates: true,
    requires: ['MEPH.audio.graph.AudioGraphReader'],
    scripts: ['MEPH.audio.graph.node.generated.Range',
                'MEPH.audio.graph.node.generated.Select',
                'MEPH.audio.graph.node.generated.Control'],
    properties: {
    },
    initialize: function (seed) {
        var me = this, input, output;

        me.nodecontrols = me.nodecontrols || [];
        if (seed) {
            seed = MEPH.audio.graph.AudioGraphReader.cloneUnique(seed);
            me.subGraph = seed;
            input = seed.nodes.first(function (x) {
                return x.data.type === 'MEPH.audio.graph.node.InputNode';
            });

            output = seed.nodes.first(function (x) {
                return x.data.type === 'MEPH.audio.graph.node.OutputNode';
            });

            if (input && output) {

                input = input.data;
                output = output.data;

                output.nodeOutputs.foreach(function (inp) {
                    var iname = 'output_' + MEPH.GUID().nodename();
                    inp.alternateId = iname;
                    me.addCorrespondingControl(iname, inp)
                    me.nodecontrols.push(iname);
                });

                input.nodeInputs.foreach(function (inp) {
                    var iname = 'input_' + MEPH.GUID().nodename();
                    inp.alternateId = iname;
                    me.addCorrespondingControl(iname, inp)
                    me.nodecontrols.push(iname);

                });

                me.$input = input;
                me.$output = output;

                me.generateInputTemplate(input, output);
                me.generateProperties(input, output);
            }
        }
        //me.nodecontrols.push('bufferoutput');
        //me.nodecontrols.push('bufferinput');
        //me.nodecontrols.push('gain');

        me.great();
        if (input && output) {
            input.nodeInputs.foreach(function (inp) {
                me.nodeInputs.push(me.createInput(inp.name, inp.type));
            });

            output.nodeOutputs.foreach(function (inp) {
                me.nodeOutputs.push(me.createOutput(inp.name, inp.type));
            });
        }
        //
        //me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));

    },
    /**
     * Generates properties
     * @param {Object} input
     * @oaram {Object} output
     */
    generateProperties: function (input, output, set) {
        var me = this;
        input.nodeInputs.foreach(function (x) {
            var temp = me.getCorrespondingControl(x);

            var dict = {
                title: temp.name.nodename() + 'Title',
                y: temp.name.nodename() + 'y',
                types: temp.name.nodename() + 'types',
                isoutput: temp.name.nodename() + 'isoutput'
            }
            for (var i in dict) {
                me[dict[i]] = null;
            }
        })
        input.nodeInputs.concat(output.nodeOutputs).unique(function (x) {
            return x.name.nodename();
        }).select(function (x) {
            var temp = me.getCorrespondingControl(x);
            var dict = {
                title: temp.name.nodename() + 'Title',
                y: temp.name.nodename() + 'y',
                types: temp.name.nodename() + 'types',
                isoutput: temp.name.nodename() + 'isoutput'
            }

            for (var i in dict) {
                me[dict] = null;
            }
        });
    },
    setGeneratedProperties: function (input, output) {
        var me = this;
        input.nodeInputs.concat(output.nodeOutputs).select(function (x) {
            var temp = me.getCorrespondingControl(x);

            me[temp.name.nodename()].left = !!!x.output;
            me[temp.name.nodename()].title = x.title;

        });
    },
    /**
     * Generates the input templaet for the generated node.
     * @param {Object} input
     * @param {Object} output
     **/
    generateInputTemplate: function (input, output) {
        var me = this;
        me.uniqueTemplates();
        var completeTemplate = input.nodeInputs.select(function (x) {
            var templateinfo = me.getGenNodeTemplateForType(x.type);
            var temp = me.getCorrespondingControl(x);
            var dict = {
                id: temp.name.nodename(),
                title: 'c$.' + temp.name.nodename() + 'Title',
                y: 'c$.' + temp.name.nodename() + 'y',
                types: 'c$.' + temp.name.nodename() + 'types'
            }
            return me.parseAndReplace(dict, templateinfo);
        }).join('') + output.nodeOutputs.select(function (x) {
            var templateinfo = me.getGenNodeTemplateForType(x.type, 'MEPH.audio.graph.node.generated.Control');
            var temp = me.getCorrespondingControl(x);
            var dict = {
                id: temp.name.nodename(),
                title: 'c$.' + temp.name.nodename() + 'Title',
                y: 'c$.' + temp.name.nodename() + 'y',
                types: 'c$.' + temp.name.nodename() + 'types'
            }
            return me.parseAndReplace(dict, templateinfo);
        }).join('');


        completeTemplate = '<!-- "instruction": true, "name" : "genop", "operation" : "inject" , "position" : "inputs", "before" : true -->' +
        completeTemplate + '<!-- "instruction": true, "name" : "genop", "close": true -->';
        var alias = 'GeneratedNodeTemplate' + MEPH.GUID().replace(new RegExp("-", 'g'), '_');
        var constructedTemplate = {
            alias: alias,
            classifiedName: alias,
            type: MEPH.templateType,
            template: completeTemplate
        }
        MEPH.addTemplateInformation(constructedTemplate);

        me.addTemplate(alias);
    },
    /**
     * Parse and replace the template parts in with the dictionary values.
     * @param {Object} dic
     * @param {Object} templateinfo
     * @returns {String}
     **/
    parseAndReplace: function (dic, templateinfo) {
        var me = this, template;
        template = templateinfo.template;
        for (var i in dic) {
            if (dic.hasOwnProperty(i)) {
                var re = new RegExp("{{{" + i + "}}}", 'g');
                template = template.replace(re, dic[i]);
            }
        }
        return template;
    },
    getGenNodeTemplateForType: function (type, override) {
        var template;
        if (override) {
            template = MEPH.getDefinedTemplate(override);
        }
        else
            switch (type) {
                case MEPH.audio.graph.node.Node.Number:
                    template = MEPH.getDefinedTemplate('MEPH.audio.graph.node.generated.Range');
                    break;
                case MEPH.audio.graph.node.Node.String:
                    template = MEPH.getDefinedTemplate('MEPH.audio.graph.node.generated.Select');
                    break;
                default:
                    template = MEPH.getDefinedTemplate('MEPH.audio.graph.node.generated.Control');
                    break
            }
        return template;
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.title = 'Generated Node';
        me.setGeneratedProperties(me.$input, me.$output);

        me.refresh++;
    }

});