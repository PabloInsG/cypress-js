class HomePage {

    getSearchBoxInput(){
        return cy.get('#search_query_top')
    }

    getSearchBoxBtn(){
        return cy.get('#search_box > .btn')
    }
    
    getAddToCartElementBtn(productDescription){
        return cy.get('.product-container:has(.product-name[title=" ' + productDescription + '"]) > .ajax add to cart button')
    }

    getProceedToCheckoutBtn(){
        return cy.get('.button-medium[title="Proceed to checkout"]')
    }

}

export default HomePage;