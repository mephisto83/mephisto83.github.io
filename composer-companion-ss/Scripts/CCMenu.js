var addToRuntime = function (main) {
    var lib = {
        popup: {
            ganttChartMenu: '#ganttChartMenu'
        },
        runtime: {
            createCollapsibleSet: function (title, list) {
                var div = $("<div>", {
                    'data-role': "collapsible-set",
                    'data-theme': "b",
                    'data-content-theme': "c",
                    'data-collapsed-icon': "arrow-r",
                    'data-expanded-icon': "arrow-d",
                    'style': "margin: 0; width: 250px;"
                });
                var divinner = $("<div>", {
                    'data-role': "collapsible",
                    'data-inset': "false"
                });
                var title = $("<h2>", {
                    text: title
                });
                var ul = $cc.runtime.createList(false);
                for (var i = 0 ; i < list.length ; i++) {
                    ul.append(list[i]);
                }
                divinner.append(title);
                divinner.append(ul);
                div.append(divinner);
                return div;
            },
            applyFunctions: function (bankentry) {
                if (bankentry.configuration) {
                    bankentry.entrysource = function (id) {
                        return $cc.runtime.getBankEntry(id);
                    };
                    var _entry = new ComposerCompanion.CompositeEntry(bankentry);
                }
                else
                    var _entry = new ComposerCompanion.BankEntry(bankentry);
                return _entry;
            },
            rowClicked: function (args) {
                var list = [];
                $(lib.popup.ganttChartMenu).html("");
                $cc.variables.bankentry.forEach(function (x, index) {
                    list.push($("<li>", {
                        text: x.entryname || 'Unnamed ' + index,
                        click: function (datarow) {
                            $cc.runtime.addEntryToTrack(this, datarow, args);
                        }.bind(x, args.row)
                    }));
                });
                var collapsible = lib.runtime.createCollapsibleSet('Atomic Banks', list);
                $(lib.popup.ganttChartMenu).append(collapsible);
                collapsible.trigger('create');
                $(lib.popup.ganttChartMenu).popup("open", {});
            }
        }
    }
    for (var i in lib.runtime) {
        main.runtime[i] = lib.runtime[i];
    }
    main.popup = main.popup || {};
    for (var i in lib.popup) {
        main.popup[i] = lib.popup[i];
    }
}