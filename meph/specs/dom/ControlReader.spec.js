describe("MEPH/dom/ControlReader.spec.js", function () {
    var createDomObjects = function (node) {
        var dom = document.createElement(node);
        return dom;
    };
    it("Reads dom objects from the parent dom.", function (done) {
        //Arrange
        var dom = document.createElement('div'),
            $subdom = dom;
        [].interpolate(0, 10, function (i) {
            MEPH.addTemplateInformation({ classifiedName: 'node' + i, alias: 'node' + i });
            return createDomObjects('node' + i);
        }).foreach(function (subdom) {
            $subdom.appendChild(subdom);
            $subdom = subdom;
        });

        MEPH.create('MEPH.dom.ControlReader').then(function ($class) {
            //Act
            var reader = new $class(),
                viewobjects;

            viewobjects = reader.getViewObjects(dom);

            //Assert
            expect(viewobjects).toBeTruthy();
            expect(viewobjects.length === 10).toBeTruthy();
            [].interpolate(0, 10, function (i) {
                MEPH.removeTemplateInformation('node' + i);
            }) 
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('Reads the child view objects from the parent dom ', function (done) {
        //Arrange

        var dom = createDomObjects('div'), $subdom;
        [].interpolate(0, 10, function (i) {
            MEPH.addTemplateInformation({ classifiedName: 'node_' + i, alias: 'node_' + i });
            return createDomObjects('node_' + i);
        }).foreach(function (subdom) {
            dom.appendChild(subdom);
            $subdom = subdom;
        });
        
        MEPH.addTemplateInformation({ classifiedName: 'nodetest', alias: 'nodetest' });
        $subdom.appendChild(createDomObjects('nodetest'));
        MEPH.create('MEPH.dom.ControlReader').then(function ($class) {
            //Act
            var reader = new $class(),
                viewobjects,
                allobjects;
            viewobjects = reader.getChildViewObjects(dom);
            allobjects = reader.getViewObjects(dom);
            //Assert
            expect(viewobjects).toBeTruthy();
            expect(viewobjects.length === 10).toBeTruthy();
            expect(allobjects.length === 11).toBeTruthy();
            [].interpolate(0, 10, function (i) {
                MEPH.removeTemplateInformation('node_' + i);
            })
            MEPH.removeTemplateInformation('nodetest'); 
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
});