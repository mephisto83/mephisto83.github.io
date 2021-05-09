
ScoreLibrary.ScoreDiv.Load = function (jqueryselector, musicxml_file) {

    return ScoreLibrary.ScoreDiv.divList =
         $(jqueryselector).map(function (index) {
             //var musicxml_file = undefined;
             var is_standalone = true;
             var show_toolbar = false;
             return new ScoreLibrary.ScoreDiv($(this), musicxml_file, is_standalone, show_toolbar);
         }).get();
};


ScoreLibrary.Engraver.Pager.PageListLazyIter.prototype.lazyNext = function () {

    var page = new ScoreLibrary.Renderer.Page(this.page_counter);

    page.setExplicit('width', this.layout_manager.getPageWidth());
    page.setExplicit('height', this.layout_manager.getPageHeight());

    page.setOrg(this.fix_org_coord, 'x', 0);
    page.setOrg(this.fix_org_coord, 'y', 0);

    this.engraveTopMargin(page);
    this.engraveCreditInfos(page);

    this.layout_manager.setMaxSystemHeights(
        page.getExplicit('height') -
            page.getImplicit('height') -
            this.layout_manager.getSystemMargin(page, 'bottom'));

    var accumulate_system_heights = 0;

    var system_v_padding = 5;

    while (this.system_iterator.hasNext()) {

        var system_renderer = this.system_iterator.next();

        accumulate_system_heights += system_v_padding;

        accumulate_system_heights += system_renderer.getRequisite('height');

        if (accumulate_system_heights >
            this.layout_manager.getMaxSystemHeights()) {

            this.system_iterator.prev();

            if (!this.system_iterator.hasPrev()) {

                var message = "score-div's height is not enough,";

                message += ' at least ';
                message +=
                Math.ceil(accumulate_system_heights + 50);
                // !NOTE: temp fix toolbar height.

                message += ' please!';
                ScoreManager.ExpandHeight(Math.ceil(accumulate_system_heights + 50));
            }

            break;
        }

        system_renderer.setOrg(
            this.fix_org_coord, 'x',
            this.layout_manager.getSystemMargin(page, 'left'));

        page.pack(
            system_renderer, false, false,
            system_v_padding, 0, this.fix_org_coord, true);
        break;
    }

    this.engraveBottomMargin(page);

    this.page_counter.incPageNumber();

    this.page_list = this.page_list || [];
    this.page_list.push(page);

    ++this.current;

    return page;
};
ScoreLibrary.Engraver.Liner.SystemListLazyIter.prototype.lazyNext = function () {

    var system_renderer = new ScoreLibrary.Renderer.System();

    this.accumulate_system_heights =
        this.accumulate_system_heights || 0;

    var accumulate_system_length = 0;

    var labelgroups_width =
        this.labelgroups_engraver.getRendererWidth(
            this.context,
            !this.column_iterator.hasPrev());

    var available_system_length =
        this.layout_manager.getMaxSystemLength(this.page_counter) -
        labelgroups_width;

    var first_measure_in_system = true;

    var measure_column_prev = undefined;

    var measure_column = undefined;

    var part_renderers = undefined;

    while (this.column_iterator.hasNext()) {

        measure_column_prev = measure_column;

        measure_column = this.column_iterator.next();

        this.connector_mgrs =
            this.connector_mgrs ||
            measure_column.map(
                function () {

                    return new ScoreLibrary.Score.ConnectorManager();
                }, this);

        var width_tester =
            this.system_engraver.engrave(
                this.reverse_parts,
                this.measure_engraver.engraveColumn(
                    measure_column,
                    first_measure_in_system,
                    undefined));

        var align_width = width_tester.getRequisite('width');

        accumulate_system_length +=
        align_width * ScoreLibrary.Engraver.Constants.density;

        if (accumulate_system_length > available_system_length) {

            this.column_iterator.prev();

            if (!this.column_iterator.hasPrev()) {

                var message = "score-div's width is not enough,";

                message += ' at least ';
                message += Math.ceil(accumulate_system_length +
                                     labelgroups_width + 50);
                message += ' please!';

                throw Error(message);
            }

            measure_column = measure_column_prev;

            break;
        }
        part_renderers =
            this.measure_engraver.engraveColumn(
                measure_column, first_measure_in_system,
                part_renderers, system_renderer);

        first_measure_in_system = false;

        measure_column.forEach(
            function (measure, index, measures) {

                var connector_mgr = this.connector_mgrs[index];

                connector_mgr.addMeasure(measure);
            }, this);
        if (measure_column)
            if (measure_column[0].number) {
                break;
            }
    }

    if (part_renderers) {

        part_renderers =
            this.measure_engraver.engraveColumnSystemEnds(
                measure_column,
                part_renderers,
                system_renderer);

        var is_last_system = !this.column_iterator.hasNext();

        part_renderers =
            this.part_engraver.engrave(
                this.connector_mgrs, part_renderers,
                is_last_system, available_system_length);

        this.connector_mgrs.forEach(
            function (connector_mgr) {

                connector_mgr.reset();
            });

        system_renderer =
            this.system_engraver.engrave(
                this.reverse_parts, part_renderers, system_renderer);

        var requisite_width =
            system_renderer.getRequisite('width');

        if (is_last_system) {

            system_renderer.setExplicit(
                'width',
                Math.min(available_system_length,
                         requisite_width *
                         ScoreLibrary.Engraver.Constants.sparsity));
        }
        else {

            system_renderer.setExplicit('width', available_system_length);
        }

        system_renderer = this.labelSystemRenderer(system_renderer);

        this.accumulate_system_heights +=
        system_renderer.getRequisite('height');

        if (this.accumulate_system_heights >
            this.layout_manager.getMaxSystemHeights(this.page_counter)) {

            this.page_counter.incPageNumber();
        }

        this.system_list = this.system_list || [];
        this.system_list.push(system_renderer);

        ++this.current;
    }
    else {

        system_renderer = undefined;
    }

    return system_renderer;
};
