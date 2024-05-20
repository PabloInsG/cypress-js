import {Given, When, Then, And} from "cypress-cucumber-preprocessor/steps"
import AddressPage from "../../../support/PageObjects/AddressPage"
import AuthenticationPage from "../../../support/PageObjects/AuthenticationPage"
import HomePage from "../../../support/PageObjects/HomePage"
import PaymentPage from "../../../support/PageObjects/PaymentPage"
import ShippingPage from "../../../support/PageObjects/ShippingPage"
import ShoppingCartSummary from "../../../support/PageObjects/ShoppingCartSummaryPage" 


const addressPage = new AddressPage()
const authenticationPage = new AuthenticationPage()
const homePage = new HomePage()
const paymentPage = new PaymentPage()
const shippingPage = new ShippingPage()
const shoppingCartSummaryPage = new ShoppingCartSummary()

Given('el usuario se encuentra en la pagina de compra', ()=>{
    cy.visit("http://automationpractice.com/index.php")
})
And('busca un articulo llamado blusa', ()=>{
    homePage.getSearchBoxInput().type('Blouse')
    homePage.getSearchBoxBtn().click()
})

And('agrega una blusa al carrito', ()=>{
    homePage.getAddToCartElementBtn("Blouse").click()
    homePage.getProceedToCheckoutBtn().click()
})

Then('el valor del articulo es de 27.00 dolares', () => {
    shoppingCartSummaryPage.getProductNameText().should('contain.text', 'Blouse')
    shoppingCartSummaryPage.getProductPriceText().should('contain.text', '27.00')
})

When('finaliza la compra de los articulos', () => {
    authenticationPage.getEmailAddressInput().type('johndoe@example.com')
    authenticationPage.getPasswordInput().type('JonhDoe')
    authenticationPage.getSignInButton().click()

    addressPage.getProceedToCheckoutButton().click()

    shippingPage.getTermsOfServiceCheckbox().check().should('be.checked')
    shippingPage.getProceedToCheckoutButton().click()

    paymentPage.getPayByBankWireOptionButton().click()
    paymentPage.getConfirmMyOrderButton().click()
})

Then('el mensaje de orden completada deberia aparecer', () => {
    paymentPage.getDescriptionTitleText().should('contain.text','Your order on My Store is complete.')
})


And