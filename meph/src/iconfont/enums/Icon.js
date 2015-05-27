/**
* @class MEPH.iconfont.enums.Icon
*
*/
MEPH.define('MEPH.iconfont.enums.Icon', {
    alternateNames: ['MEPH.iconfont.Icon', 'Icons'],
    statics: {

        /**
        * Determine if given icon name is a valid icon font icon.
        * @param {String} iconName
        * Name of icon to check for
        *
        * @return {Boolean}
        * True if valid icon, else false.
        */
        hasIcon: function (iconName) {
            var me = this,
                item,
                retVal = false;

            if (typeof (iconName) === 'string') {

                if (iconName.indexOf('-') !== 0) {
                    iconName = '-' + iconName;
                }

                for (i in MEPH.iconfont.Icon) {
                    item = MEPH.iconfont.Icon;
                    if (MEPH.iconfont.Icon[item] === iconName) {
                        return true;
                    }
                }
            }
            return false;
        },
        /**
         * Gets the prefix;
         * @returns {String}
         **/
        getPrefix: function () { return 'glyphicon glyphicon'; },
        /**
        * @property
        */
        Asterisk: '-asterisk',

        /**
        * @property
        */
        Plus: '-plus',

        /**
        * @property
        */
        Euro: '-euro',

        /**
        * @property
        */
        Minus: '-minus',

        /**
        * @property
        */
        Cloud: '-cloud',

        /**
        * @property
        */
        envelope: '-envelope',

        /**
        * @property
        */
        Pencil: '-pencil',

        /**
        * @property
        */
        glass: '-glass',

        /**
        * @property
        */
        Music: '-music',

        /**
        * @property
        */
        Search: '-search',

        /**
        * @property
        */
        Heart: '-heart',

        /**
        * @property
        */
        Star: '-star',

        /**
        * @property
        */
        StarEmpty: '-star-empty',

        /**
        * @property
        */
        User: '-user',

        /**
        * @property
        */
        Film: '-film',

        /**
        * @property
        */
        ThLarge: '-th-large',

        /**
        * @property
        */
        Th: '-th',

        /**
        * @property
        */
        ThList: '-th-list',

        /**
        * @property
        */
        Ok: '-ok',

        /**
        * @property
        */
        Remove: '-remove',

        /**
        * @property
        */
        ZoomIn: '-zoom-in',

        /**
        * @property
        */
        ZoomOut: '-zoom-out',

        /**
        * @property
        */
        Off: '-off',

        /**
        * @property
        */
        Signal: '-signal',

        /**
        * @property
        */
        Cog: '-cog',

        /**
        * @property
        */
        Trash: '-trash',

        /**
        * @property
        */
        Home: '-home',

        /**
        * @property
        */
        File: '-file',

        /**
        * @property
        */
        Time: '-time',

        /**
        * @property
        */
        Road: '-road',

        /**
        * @property
        */
        DownloadAlt: '-download-alt',

        /**
        * @property
        */
        Download: '-download',

        /**
        * @property
        */
        Upload: '-upload',

        /**
        * @property
        */
        Inbox: '-inbox',

        /**
        * @property
        */
        PlayCircle: '-play-circle',

        /**
        * @property
        */
        Repeat: '-repeat',

        /**
        * @property
        */
        Refresh: '-refresh',
        /**
        * @property
        */
        ListAlt: '-list-alt',

        /**
        * @property
        */
        Lock: '-lock',

        /**
        * @property
        */
        Flag: '-flag',

        /**
        * @property
        */
        Headphones: '-headphones',

        /**
        * @property
        */
        VolumeOff: '-volume-off',

        /**
        * @property
        */
        VolumeUp: '-volume-up',

        /**
        * @property
        */
        VolumeDown: '-volume-down',

        /**
        * @property
        */
        Qrcode: '-qrcode',

        /**
        * @property
        */
        Barcode: '-barcode',

        /**
        * @property
        */
        Tag: '-tag',

        /**
        * @property
        */
        Tags: '-tags',

        /**
        * @property
        */
        Book: '-book',

        /**
        * @property
        */
        Bookmark: '-bookmark',


        /**
        * @property
        */
        Print: '-print',

        /**
        * @property
        */
        Camera: '-camera',

        /**
        * @property
        */
        Font: '-font',

        /**
        * @property
        */
        Bold: '-bold',

        /**
        * @property
        */
        Italic: '-italic',

        /**
        * @property
        */
        TextHeight: '-text-height',


        /**
        * @property
        */
        TextWidth: '-text-width',

        /**
        * @property
        */
        AlignLeft: '-align-left',


        /**
        * @property
        */
        AlignCenter: '-align-center',

        /**
        * @property
        */
        AlignRight: '-align-right',

        /**
        * @property
        */
        AlignJustify: '-align-justify',

        /**
        * @property
        */
        List: '-list',

        /**
        * @property
        */
        IndentLeft: '-indent-left',

        /**
        * @property
        */
        IndentRight: '-indent-right',

        /**
        * @property
        */
        FacetimeVideo: '-facetime-video',

        /**
        * @property
        */
        Picture: '-picture',

        /**
        * @property
        */
        MapMarker: '-map-marker',

        /**
        * @property
        */
        Adjust: '-adjust',


        /**
        * @property
        */
        Tint: '-tint',

        /**
        * @property
        */
        Edit: '-edit',

        /**
        * @property
        */
        Share: '-share',

        /**
        * @property
        */
        Check: '-check',

        /**
        * @property
        */
        Move: '-move',

        /**
        * @property
        */
        StepBackward: '-step-backward',

        /**
        * @property
        */
        FastBackward: '-fast-backward',

        /**
        * @property
        */
        Backward: '-backward',


        /**
        * @property
        */
        Play: '-play',

        /**
        * @property
        */
        Pause: '-pause',


        /**
        * @property
        */
        Stop: '-stop',


        /**
        * @property
        */
        Forward: '-forward',


        /**
        * @property
        */
        FastForward: '-fast-forward',

        /**
        * @property
        */
        StepForward: '-step-forward',

        /**
        * @property
        */
        Eject: '-eject',

        /**
        * @property
        */
        ChevronLeft: '-chevron-left',

        /**
        * @property
        */
        ChevronRight: '-chevron-right',

        /**
        * @property
        */
        PlusSign: '-plus-sign',

        /**
        * @property
        */
        MinusSign: '-minus-sign',

        /**
        * @property
        */
        RemoveSign: '-remove-sign',

        /**
        * @property
        */
        OkSign: '-ok-sign',


        /**
        * @property
        */
        QuestionSign: '-question-sign',


        /**
        * @property
        */
        InfoSign: '-info-sign',

        /**
        * @property
        */
        Screenshot: '-screenshot',

        /**
        * @property
        */
        RemoveCircle: '-remove-circle',

        /**
        * @property
        */
        OkCircle: '-ok-circle',

        /**
        * @property
        */
        BanCircle: '-ban-circle',

        /**
        * @property
        */
        ArrowLeft: '-arrow-left',

        /**
        * @property
        */
        ArrowRight: '-arrow-right',

        /**
        * @property
        */
        ArrowUp: '-arrow-up',

        /**
        * @property
        */
        ArrowDown: '-arrow-down',

        /**
        * @property
        */
        ShareAlt: '-share-alt',


        /**
        * @property
        */
        ResizeFull: '-resize-full',

        /**
        * @property
        */
        ResizeSmall: '-resize-small',

        /**
        * @property
        */
        ExclamationSign: '-exclamation-sign',

        /**
        * @property
        */
        Gift: '-gift',

        /**
        * @property
        */
        Leaf: '-leaf',

        /**
        * @property
        */
        Fire: '-fire',

        /**
        * @property
        */
        EyeOpen: '-eye-open',

        /**
        * @property
        */
        EyeClose: '-eye-close',

        /**
        * @property
        */
        WarningSign: '-warning-sign',

        /**
        * @property
        */
        Plane: '-plane',

        /**
        * @property
        */
        Calendar: '-calendar',

        /**
        * @property
        */
        Random: '-random',

        /**
        * @property
        */
        Comment: '-comment',

        /**
        * @property
        */
        Magnet: '-magnet',

        /**
        * @property
        */
        ChevronUp: '-chevron-up',

        /**
        * @property
        */
        ChevronDown: '-chevron-down',

        /**
        * @property
        */
        Retweet: '-retweet',

        /**
        * @property
        */
        ShoppingCart: '-shopping-cart',

        /**
        * @property
        */
        FolderClose: '-folder-close',

        /**
        * @property
        */
        FolderOpen: '-folder-open',

        /**
        * @property
        */
        ResizeVertical: '-resize-vertical',


        /**
        * @property
        */
        ResizeHorizontal: '-resize-horizontal',

        /**
        * @property
        */
        HDD: '-hdd',
        /**
        * @property
        */
        Bullhorn: '-bullhorn',

        /**
        * @property
        */
        Bell: '-bell',

        /**
        * @property
        */
        Certificate: '-certificate',

        /**
        * @property
        */
        ThumbsUp: '-thumbs-up',

        /**
        * @property
        */
        ThumbsDown: '-thumbs-down',

        /**
        * @property
        */
        HandRight: '-hand-right',

        /**
        * @property
        */
        HandLeft: '-hand-left',

        /**
        * @property
        */
        HandUp: '-hand-up',

        /**
        * @property
        */
        HandDown: '-hand-down',


        /**
        * @property
        */
        CircleArrowRight: '-circle-arrow-right',

        /**
        * @property
        */
        CircleArrowLeft: '-circle-arrow-left',

        /**
        * @property
        */
        CircleArrowUp: '-circle-arrow-up',

        /**
        * @property
        */
        CircleArrowDown: '-circle-arrow-down',

        /**
        * @property
        */
        Globe: '-globe',

        /**
        * @property
        */
        Wrench: '-wrench',

        /**
        * @property
        */
        Tasks: '-tasks',

        /**
        * @property
        */
        Filter: '-filter',

        /**
        * @property
        */
        Briefcase: '-briefcase',

        /**
        * @property
        */
        Fullscreen: '-fullscreen',

        /**
        * @property
        */
        Dashboard: '-dashboard',

        /**
        * @property
        */
        Paperclip: '-paperclip',

        /**
        * @property
        */
        HeartEmpty: '-heart-empty',

        /**
        * @property
        */
        Link: '-link',

        /**
        * @property
        */
        Phone: '-phone',

        /**
        * @property
        */
        Pushpin: '-pushpin',

        /**
        * @property
        */
        USD: '-usd',

        /**
        * @property
        */
        GBP: '-gbp',

        /**
        * @property
        */
        Sort: '-sort',

        /**
        * @property
        */
        SortByAlphabet: '-sort-by-alphabet',

        /**
        * @property
        */
        SortByAlphabetAlt: '-sort-by-alphabet-alt',

        /**
        * @property
        */
        SortByOrder: '-sort-by-order',

        /**
        * @property
        */
        SortByOrderAlt: '-sort-by-order-alt',

        /**
        * @property
        */
        SortByAttributes: '-sort-by-attributes',

        /**
        * @property
        */
        SortByAttributesAlt: '-sort-by-attributes-alt',

        /**
        * @property
        */
        Unchecked: '-unchecked',

        /**
        * @property
        */
        Expand: '-expand',

        /**
        * @property
        */
        CollapseDown: '-collapse-down',

        /**
        * @property
        */
        CollapseUp: '-collapse-up',
        /**
        * @property
        */
        Login: '-log-in',

        /**
        * @property
        */
        Flash: '-flash',

        /**
        * @property
        */
        Logout: '-log-out',

        /**
        * @property
        */
        NewWindow: '-new-window',

        /**
        * @property
        */
        Record: '-record',

        /**
        * @property
        */
        Save: '-save',

        /**
        * @property
        */
        Open: '-open',

        /**
        * @property
        */
        Saved: '-saved',

        /**
        * @property
        */
        Import: '-import',

        /**
        * @property
        */
        Export: '-export',

        /**
        * @property
        */
        Send: '-send',

        /**
        * @property
        */
        FloppyDisk: '-floppy-disk',

        /**
        * @property
        */
        FloppySaved: '-floppy-saved',

        /**
        * @property
        */
        FloppyRemoved: '-floppy-remove',

        /**
        * @property
        */
        FloppySave: '-floppy-save',

        /**
        * @property
        */
        FloppyOpen: '-floppy-open',

        /**
        * @property
        */
        CreditCard: '-credit-card',

        /**
        * @property
        */
        Transfer: '-transfer',
        /**
        * @property
        */
        Cutlery: '-cutlery',

        /**
        * @property
        */
        Header: '-header',

        /**
        * @property
        */
        Compressed: '-compressed',

        /**
        * @property
        */
        Earphone: '-earphone',
        /**
        * @property
        */
        PhoneAlt: '-phone-alt',
        /**
        * @property
        */
        Tower: '-tower',

        /**
        * @property
        */
        Stats: '-stats',

        /**
        * @property
        */
        SDVideo: '-sd-video',

        /**
        * @property
        */
        HDVideo: '-hd-video',
        /**
        * @property
        */
        Subtitles: '-subtitles',

        /**
        * @property
        */
        SoundStereo: '-sound-stereo',

        /**
        * @property
        */
        SoundDolby: '-sound-dolby',

        /**
        * @property
        */
        Sound51: '-sound-5-1',

        /**
        * @property
        */
        Sound61: '-sound-6-1',
        /**
        * @property
        */
        Sound71: '-sound-7-1',
        /**
        * @property
        */
        CopyrightMark: '-copyright-mark',

        /**
        * @property
        */
        RegistrationMark: '-registration-mark',
        /**
        * @property
        */
        CloudDownload: '-cloud-download',

        /**
        * @property
        */
        CloudUpload: '-cloud-upload',
        /**
        * @property
        */
        TreeConifer: '-tree-conifer',
        /**
        * @property
        */
        TreeDeciduous: '-tree-deciduous'
    }
});
