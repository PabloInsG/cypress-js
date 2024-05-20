before(() => {
    cy.fixture('carritoCompra').then(function (datos) {
        this.datos = datos
    })
})