

MEPH.define('MEPH.qrcode.detector.Detector', {
    requires: ['MEPH.qrcode.detector.PerspectiveTransform',
            'MEPH.qrcode.AlignmentPatternFinder',
            'MEPH.qrcode.finder.FinderPatternFinder',
            'MEPH.qrcode.GridSampler',
            'MEPH.qrcode.Decoder',
            'MEPH.qrcode.version.Version',
                'MEPH.qrcode.detector.DetectorResult'],
    sizeOfBlackWhiteBlackRun: function (fromX, fromY, toX, toY) {
        var me = this, qrcode = me.qrcode;
        // Mild variant of Bresenham's algorithm;
        // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
        var steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
        if (steep) {
            var temp = fromX;
            fromX = fromY;
            fromY = temp;
            temp = toX;
            toX = toY;
            toY = temp;
        }

        var dx = Math.abs(toX - fromX);
        var dy = Math.abs(toY - fromY);
        var error = -dx >> 1;
        var ystep = fromY < toY ? 1 : -1;
        var xstep = fromX < toX ? 1 : -1;
        var state = 0; // In black pixels, looking for white, first or second time
        for (var x = fromX, y = fromY; x != toX; x += xstep) {

            var realX = steep ? y : x;
            var realY = steep ? x : y;
            if (state == 1) {
                // In white pixels, looking for black
                if (me.image[realX + realY * qrcode.width]) {
                    state++;
                }
            }
            else {
                if (!me.image[realX + realY * qrcode.width]) {
                    state++;
                }
            }

            if (state == 3) {
                // Found black, white, black, and stumbled back onto white; done
                var diffX = x - fromX;
                var diffY = y - fromY;
                return Math.sqrt((diffX * diffX + diffY * diffY));
            }
            error += dy;
            if (error > 0) {
                if (y == toY) {
                    break;
                }
                y += ystep;
                error -= dx;
            }
        }
        var diffX2 = toX - fromX;
        var diffY2 = toY - fromY;
        return Math.sqrt((diffX2 * diffX2 + diffY2 * diffY2));
    },

    sizeOfBlackWhiteBlackRunBothWays: function (fromX, fromY, toX, toY) {
        var me = this, qrcode = me.qrcode;
        var result = me.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

        // Now count other way -- don't run off image though of course
        var scale = 1.0;
        var otherToX = fromX - (toX - fromX);
        if (otherToX < 0) {
            scale = fromX / (fromX - otherToX);
            otherToX = 0;
        }
        else if (otherToX >= qrcode.width) {
            scale = (qrcode.width - 1 - fromX) / (otherToX - fromX);
            otherToX = qrcode.width - 1;
        }
        var otherToY = Math.floor(fromY - (toY - fromY) * scale);

        scale = 1.0;
        if (otherToY < 0) {
            scale = fromY / (fromY - otherToY);
            otherToY = 0;
        }
        else if (otherToY >= qrcode.height) {
            scale = (qrcode.height - 1 - fromY) / (otherToY - fromY);
            otherToY = qrcode.height - 1;
        }
        otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

        result += me.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
        return result - 1.0; // -1 because we counted the middle pixel twice
    },

    calculateModuleSizeOneWay: function (pattern, otherPattern) {
        var me = this;
        var moduleSizeEst1 = me.sizeOfBlackWhiteBlackRunBothWays(Math.floor(pattern.X), Math.floor(pattern.Y), Math.floor(otherPattern.X), Math.floor(otherPattern.Y));
        var moduleSizeEst2 = me.sizeOfBlackWhiteBlackRunBothWays(Math.floor(otherPattern.X), Math.floor(otherPattern.Y), Math.floor(pattern.X), Math.floor(pattern.Y));
        if (isNaN(moduleSizeEst1)) {
            return moduleSizeEst2 / 7.0;
        }
        if (isNaN(moduleSizeEst2)) {
            return moduleSizeEst1 / 7.0;
        }
        // Average them, and divide by 7 since we've counted the width of 3 black modules,
        // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
        return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
    },


    calculateModuleSize: function (topLeft, topRight, bottomLeft) {
        // Take the average
        var me = this;
        return (me.calculateModuleSizeOneWay(topLeft, topRight) + me.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
    },
    distance: function (pattern1, pattern2) {
        xDiff = pattern1.X - pattern2.X;
        yDiff = pattern1.Y - pattern2.Y;
        return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
    },

    computeDimension: function (topLeft, topRight, bottomLeft, moduleSize) {
        var me = this;
        var tltrCentersDimension = Math.round(me.distance(topLeft, topRight) / moduleSize);
        var tlblCentersDimension = Math.round(me.distance(topLeft, bottomLeft) / moduleSize);
        var dimension = ((tltrCentersDimension + tlblCentersDimension) >> 1) + 7;
        switch (dimension & 0x03) {

            // mod 4
            case 0:
                dimension++;
                break;
                // 1? do nothing

            case 2:
                dimension--;
                break;

            case 3:
                throw "Error";
        }
        return dimension;
    },

    findAlignmentInRegion: function (overallEstModuleSize, estAlignmentX, estAlignmentY, allowanceFactor) {
        // Look for an alignment pattern (3 modules in size) around where it
        // should be
        var me = this, qrcode = me.qrcode;
        var allowance = Math.floor(allowanceFactor * overallEstModuleSize);
        var alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
        var alignmentAreaRightX = Math.min(qrcode.width - 1, estAlignmentX + allowance);
        if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
            throw "Error";
        }

        var alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
        var alignmentAreaBottomY = Math.min(qrcode.height - 1, estAlignmentY + allowance);

        var alignmentFinder = new AlignmentPatternFinder(me.qrcode, me.image, alignmentAreaLeftX, alignmentAreaTopY, alignmentAreaRightX - alignmentAreaLeftX, alignmentAreaBottomY - alignmentAreaTopY, overallEstModuleSize, me.resultPointCallback);
        return alignmentFinder.find();
    },
    createTransform: function (topLeft, topRight, bottomLeft, alignmentPattern, dimension) {
        var me = this, qrcode = me.qrcode;
        var dimMinusThree = dimension - 3.5;
        var bottomRightX;
        var bottomRightY;
        var sourceBottomRightX;
        var sourceBottomRightY;
        if (alignmentPattern != null) {
            bottomRightX = alignmentPattern.X;
            bottomRightY = alignmentPattern.Y;
            sourceBottomRightX = sourceBottomRightY = dimMinusThree - 3.0;
        }
        else {
            // Don't have an alignment pattern, just make up the bottom-right point
            bottomRightX = (topRight.X - topLeft.X) + bottomLeft.X;
            bottomRightY = (topRight.Y - topLeft.Y) + bottomLeft.Y;
            sourceBottomRightX = sourceBottomRightY = dimMinusThree;
        }

        var transform = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, dimMinusThree, 3.5, sourceBottomRightX, sourceBottomRightY, 3.5, dimMinusThree, topLeft.X, topLeft.Y, topRight.X, topRight.Y, bottomRightX, bottomRightY, bottomLeft.X, bottomLeft.Y);

        return transform;
    },



    sampleGrid: function (image, transform, dimension) {
        var me = this, qrcode = me.qrcode;
        var sampler = GridSampler;
        return sampler.sampleGrid3(image, dimension, transform);
    },


    processFinderPatternInfo: function (info) {
        var me = this, qrcode = me.qrcode;
        var topLeft = info.TopLeft;
        var topRight = info.TopRight;
        var bottomLeft = info.BottomLeft;

        var moduleSize = me.calculateModuleSize(topLeft, topRight, bottomLeft);
        if (moduleSize < 1.0) {
            throw "Error";
        }
        var dimension = me.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
        var provisionalVersion = Version.getProvisionalVersionForDimension(dimension);
        var modulesBetweenFPCenters = provisionalVersion.DimensionForVersion - 7;

        var alignmentPattern = null;
        // Anything above version 1 has an alignment pattern
        if (provisionalVersion.AlignmentPatternCenters.length > 0) {

            // Guess where a "bottom right" finder pattern would have been
            var bottomRightX = topRight.X - topLeft.X + bottomLeft.X;
            var bottomRightY = topRight.Y - topLeft.Y + bottomLeft.Y;

            // Estimate that alignment pattern is closer by 3 modules
            // from "bottom right" to known top left location
            var correctionToTopLeft = 1.0 - 3.0 / modulesBetweenFPCenters;
            var estAlignmentX = Math.floor(topLeft.X + correctionToTopLeft * (bottomRightX - topLeft.X));
            var estAlignmentY = Math.floor(topLeft.Y + correctionToTopLeft * (bottomRightY - topLeft.Y));

            // Kind of arbitrary -- expand search radius before giving up
            for (var i = 4; i <= 16; i <<= 1) {
                //try
                //{
                alignmentPattern = me.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY, i);
                break;
                //}
                //catch (re)
                //{
                // try next round
                //}
            }
            // If we didn't find alignment pattern... well try anyway without it
        }

        var transform = me.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);

        var bits = me.sampleGrid(me.image, transform, dimension);

        var points;
        if (alignmentPattern == null) {
            points = new Array(bottomLeft, topLeft, topRight);
        }
        else {
            points = new Array(bottomLeft, topLeft, topRight, alignmentPattern);
        }
        return new DetectorResult(bits, points);
    },
    detect: function () {
        var me = this, qrcode = me.qrcode;
        var info = new FinderPatternFinder(me.qrcode).findFinderPattern(me.image);
        return me.processFinderPatternInfo(info);
    },
    initialize: function (image, qrcode) {
        var me = this;
        me.qrcode = qrcode;
        me.image = image;
        MEPH.qrcode.GridSampler.setQrcode(qrcode);
        me.resultPointCallback = null;
    }
});