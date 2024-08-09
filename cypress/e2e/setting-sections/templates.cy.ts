/// <reference types="cypress" />

describe("Test Template", () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => { users = data });
  });

  it('should check template list in e-mail tab', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'templates/html/templates',
      trigger: () => cy.clickOnSubMenuAsideSettings('Plantillas'),
      callback: (body, status) => {
        expect(status).equal(200);
        const templateName = body.elementRegistries.map(registry => {
          return registry.values.find(item => item.property.elementProperty.name == 'nombre')?.value
        })
        templateName.forEach( name => {
          cy.get('.el-table__row.templates-row').contains(name!);
        }) 
      }
    });
  });

  it('should check template list in document tab', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
    cy.clickOnSubMenuAsideSettings('Plantillas');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'templates/rtf/templates',
      trigger: () => cy.get('#tab-rtf').should('not.have.class', 'is-disabled').click(),
      callback: (body, status) => {
        expect(status).equal(200);
        const templateName = body.elementRegistries.map(registry => {
          return registry.values.find(item => item.property.elementProperty.name == 'nombre')?.value
        })
        templateName.forEach( name => {
          cy.get('.el-table__row.templates-row').contains(name!);
        }) 
      }
    })
  });

  it('should check template list in notification tab', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
    cy.clickOnSubMenuAsideSettings('Plantillas');
    cy.wait(300);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'templates/html/templates',
      trigger: () => cy.get('#tab-notification').should('not.have.class', 'is-disabled').click(),
      callback: (body, status) => {
        expect(status).equal(200);
        const templateName = body.elementRegistries.map(registry => {
          return registry.values.find(item => item.property.elementProperty.name == 'nombre')?.value
        })
        templateName.forEach( name => {
          cy.get('.el-table__row.templates-row').contains(name!);
        }) 
      }
    })
  })
});
