class ShoppingCartSummary {

    getProductNameText(){
        return cy.get('tr[id^=product]').find('.product-name > a')
    }

    getProductPriceText(){
        return cy.get('tr[id^=product]').find('.price')
    }

    getProceedToCheckoutButton(){
        return cy.get('.cart_navigation > .button')
    }

    getSearchBoxBtn(){
        return cy.get('#search_box > .btn')
    }
    
    getAddToCartElementBtn(productDescription){
        return cy.get('.product-container:has(.product-name[title=" ' + productDescription + '"]) > .ajax add to cart button')
    }


}

export default ShoppingCartSummary;