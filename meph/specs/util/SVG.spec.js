describe("MEPH/util/SVG.spec.js", 'MEPH.util.SVG', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a svg', function (done) {
        MEPH.create('MEPH.util.SVG').then(function ($class) {
            var renderer = new $class();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('can draw a line', function () {
        var renderer = new MEPH.util.SVG();
        var svgns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(svgns, "svg");
        svg.setAttributeNS(null, "height", 300);
        svg.setAttributeNS(null, "width", 300);
        document.body.appendChild(svg);
        renderer.setCanvas(svg);
        var res = renderer.draw([{ shape: 'line', end: { x: 100, y: 100 }, start: { x: 100, y: 200 } }]);
        expect(res.length).toBe(1);
        svg.parentElement.removeChild(svg);
    })


    it('can draw a bezier', function () {
        var renderer = new MEPH.util.SVG();
        var svgns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(svgns, "svg");
        svg.setAttributeNS(null, "height", 300);
        svg.setAttributeNS(null, "width", 300);
        document.body.appendChild(svg);
        renderer.setCanvas(svg);
        var res = renderer.draw([{
            shape: 'bezier',
            end: { x: 100, y: 100 },
            bezier1: { x: 150, y: 130 },
            bezier2: { x: 170, y: 170 },
            start: { x: 100, y: 200 }
        }]);
        expect(res.length).toBe(1);
        svg.parentElement.removeChild(svg);
    })

    it('can draw a circle', function () {
        var renderer = new MEPH.util.SVG();
        var svgns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(svgns, "svg");
        svg.setAttributeNS(null, "height", 300);
        svg.setAttributeNS(null, "width", 300);
        document.body.appendChild(svg);
        renderer.setCanvas(svg);
        // cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"
        var res = renderer.draw([{
            shape: 'circle',
            x: 100,
            y: 100,
            radius: 40,
            stroke: 'black',
            fill: 'white'
        }]);

        expect(res.length).toBe(1);
        svg.parentElement.removeChild(svg);
    })

    it('can clear by object', function () {

        var renderer = new MEPH.util.SVG();
        var svgns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(svgns, "svg");
        svg.setAttributeNS(null, "height", 300);
        svg.setAttributeNS(null, "width", 300);
        document.body.appendChild(svg);
        renderer.setCanvas(svg);
        var res = renderer.draw([{ shape: 'line', end: { x: 100, y: 100 }, start: { x: 100, y: 200 } }]);


        renderer.remove(res.first());

        expect(renderer.parts.length).toBe(0);

        svg.parentElement.removeChild(svg);

    });
});