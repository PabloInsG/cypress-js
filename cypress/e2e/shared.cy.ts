/// <reference types="cypress" />
import 'cypress-localstorage-commands';

const users = require('../../fixtures/users.json');
const menu = require('../../fixtures/menu.json');
let clientSeleted;

describe('Breadcrumbs', () => {
  before(() => {
    cy.getLocalStorage('token').then(value => {
      if (!value || Cypress.env().nodeEnv === 'production') {
        cy.open();
        cy.enterOffice(users.clouddistrict.office);
        cy.login(users.clouddistrict.okUser.email, users.clouddistrict.okUser.password);
      }
    });
  });

  menu.forEach(section => {
    section.items
      .filter(item => item.isListResource && item.element)
      .forEach(item => {
        context(`Should load ${section.sectionName}, ${item.title} and check all items`, () => {
          before(() => {
            cy.open();
            cy.clickOnModuleElement(section.sectionName, item.title);
            cy.findByTestId('rowDetailLink]', { timeout: 25000 }).should(value => {
              clientSeleted = value[0].innerText;
            });
            cy.get('[data-testid="rowDetailLink"]').first().click();
          });
          it('Corrects names on breadcrumbs', () => {
            cy.get(':nth-child(5) > .el-breadcrumb__inner', { timeout: 15000 }).should(
              'contain',
              clientSeleted,
            );
            cy.get('[aria-current="page"] > .el-breadcrumb__inner').should('contain', item.title);
            cy.get(':nth-child(3) > .el-breadcrumb__inner').should('contain', section.sectionName);
            //   // // cy.go("back")
            //   // cy.get(':nth-child(3) > .el-breadcrumb__inner').should("contain", section.sectionName).click()
          });
          it('Click on list and return to comple view with breadcrumbs', () => {
            cy.get('[aria-current="page"] > .el-breadcrumb__inner').click();
            cy.findByTestId('sectionTitle').should('contain', item.expectedTitle);
            // cy.go('back')
            // cy.get(':nth-child(5) > .el-breadcrumb__inner', {timeout: 15000}).should("contain", clientSeleted)
          });
          it('should go to section and find a element there', () => {
            cy.get(':nth-child(3) > .el-breadcrumb__inner').click();
            cy.get(`.section-children div div`, { timeout: 15000 }).should('contain', item.title);
            //  cy.go('back')
          });
        });
      });
  });
});
