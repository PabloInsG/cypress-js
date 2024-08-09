/// <reference types="cypress" />

describe('Client Element Test', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });
  it('should filter by province - "es desconocido"', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    // Go to the menu bar, click a module and select an element
    cy.clickOnModuleElement('Ficheros', 'Clientes');
    // click button "Todos los filtros"
    cy.findByTestId('allFiltersButton').click();
    cy.findByTestId('allFilters')
      .contains(/provincia/i)
      .click();
    cy.get('.el-radio-group').as('provinceInputs');
    cy.get('@provinceInputs').contains('es desconocido').click();
    cy.get('@provinceInputs').find('button').click();
    // declaring the interception before the client makes the request
    // This way, we can ignore any other request that has the same format and is not useful
    cy.intercept(`${Cypress.env().crmUrl}element_registries/clientes_propios**`).as(
      'filterByProvince',
    );
    cy.get('.el-drawer__body')
      .find('button')
      .contains(/filtrar/i)
      .click();
    cy.wait('@filterByProvince').then(({ request, response }) => {
      if (!response) throw new Error('The response is undefined');
      const totalItemsFromResponse = response.body.totalItems;
      expect(
        response.statusCode,
        'The status code should be 200 because the request has succeeded',
      ).to.equal(200);
      //The total filtered items correspond to the total items on the page.
      cy.get('.el-pagination__total.is-last').then($total => {
        const totalitemsInWebPage = Number($total.text().split(' ')[1]);
        expect(
          totalItemsFromResponse,
          'the total items from request should be equal to the total from the webpage',
        ).to.equal(totalitemsInWebPage);
      });
    });
  });
});
