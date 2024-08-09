/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test the "go back" button', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const module = 'Gestión';
  const element = 'Actuaciones';
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  it('should change the label of the "go back" button and, when clicked, return to the previous view', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnModuleElement(module, element);
    cy.findAllByTestId('rowDetailLink').first().click();
    cy.findByTestId('button_go_back').contains(element).should('exist');
    cy.get('[data-testid="detail_view_section_tab__Historial"]')
      .first()
      .should('not.have.class', 'is-disabled')
      .click();
    cy.findByTestId('button_go_back').contains(element).should('exist').click({ force: true });
    cy.get('.el-breadcrumb__item').last().contains(element);
  });
});
