describe("MEPH/util/Dom.spec.js", 'MEPH.util.Style', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    it("Comment nodes can be found within html dom.", function () {
        //Arrange
        var dom = '<div><!-- comment --></div>';
        var element = document.createElement('div');
        element.innerHTML = dom;

        //Act
        var comments = MEPH.util.Dom.getComments(element);

        //Assert
        expect(comments).toBeTruthy();
        expect(comments.length === 1).toBeTruthy();
    });

    it('can calculate the overlap', function () {
        //Arrange
        var dom = document.createElement('div');
        MEPH.util.Style.absolute(dom);
        MEPH.util.Style.width(dom, 100);
        MEPH.util.Style.height(dom, 200);
        MEPH.util.Style.setPosition(dom, 0, 0);
        document.body.appendChild(dom);
        //Act
        var res = MEPH.util.Dom.calculateOverlap(dom, { top: 0, left: 0, right: 100, bottom: 100 });
        expect(res === (100 * 100)).toBeTruthy()
        //Assert
        dom.parentNode.removeChild(dom);
    });

    it('can find the most overlapped section of a page', function () {
        var dom = document.createElement('div');
        dom.innerHTML = '<div class="container-narrow store-theme"><article class="checkout ">    <input class="js-cart-store-id" data-val="true" data-val-number="The field Id must be a number." data-val-required="The Id field is required." id="Seller_Id" name="Seller.Id" type="text" value="53665">    <input class="js-cart-currency" id="CurrencyCode" name="CurrencyCode" type="text" value="USD">        <input class="js-checkout-total" id="checkoutTotal" name="checkoutTotal" type="text" value="0">    <input class="js-checkout-total-shipping" id="checkoutShippingTotal" name="checkoutShippingTotal" type="text" value="0">    <input class="js-checkout-seller-country-code" id="checkoutSellerCountry" name="checkoutSellerCountry" type="text" value="RS">    <input class="js-checkout-is-custom-domain" id="checkoutIsCustomDomain" name="checkoutIsCustomDomain" type="text" value="false">'
        document.body.appendChild(dom);

        var res = MEPH.util.Dom.getBestOverlap({ top: 0, left: 0, right: 100, bottom: 100 }, dom);
        expect(res).toBeTruthy()
        expect(res.dom).toBeTruthy()
        expect(res.best !== undefined).toBeTruthy()
        dom.parentNode.removeChild(dom);
    });

    it('can extract a css selector for a dom object', function () {
        var dom = document.createElement('div');
        dom.innerHTML = '<div class="container-narrow store-theme"><article class="checkout ">    <input class="js-cart-store-id" data-val="true" data-val-number="The field Id must be a number." data-val-required="The Id field is required." id="Seller_Id" name="Seller.Id" type="text" value="53665">    <input class="js-cart-currency" id="CurrencyCode" name="CurrencyCode" type="text" value="USD">        <input class="js-checkout-total" id="checkoutTotal" name="checkoutTotal" type="text" value="0">    <input class="js-checkout-total-shipping" id="checkoutShippingTotal" name="checkoutShippingTotal" type="text" value="0">    <input class="js-checkout-seller-country-code" id="checkoutSellerCountry" name="checkoutSellerCountry" type="text" value="RS">    <input class="js-checkout-is-custom-domain" id="checkoutIsCustomDomain" name="checkoutIsCustomDomain" type="text" value="false">'
        document.body.appendChild(dom);
        var res = MEPH.util.Dom.getBestOverlap({ top: 0, left: 0, right: 100, bottom: 100 }, dom);

        var cssSelector = MEPH.util.Dom.generateCssSelector(res.dom);
        expect(document.body.querySelector(cssSelector) === res.dom).toBeTruthy();
        expect(document.body.querySelectorAll(cssSelector).length === 1).toBeTruthy();
        expect(cssSelector).toBeTruthy();
        dom.parentNode.removeChild(dom);
    });
});