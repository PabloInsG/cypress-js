/// <reference types="cypress" />
import 'cypress-localstorage-commands';

const properties = require('../fixtures/detailView.json');
const users = require('../fixtures/users.json');
const menu = require('../fixtures/menu.json');

const checkOnlyThisSections: string[] = [];
const checkOnlyThisElements: string[] = ['clientes_propios', 'expedientes_judiciales'];
const random = 1;

describe('Detail View', () => {
  before(() => {
    cy.getLocalStorage('token').then(value => {
      if (!value || Cypress.env().nodeEnv === 'production') {
        cy.open();
        cy.enterOffice(users.clouddistrict.office);
        cy.login(users.clouddistrict.okUser.email, users.clouddistrict.okUser.password);
      }
    });
  });

  menu
    .filter(
      section =>
        !checkOnlyThisSections.length || checkOnlyThisSections.includes(section.sectionName),
    )
    .forEach(section => {
      section.items
        .filter(item => item.isListResource)
        .filter(
          item => !checkOnlyThisElements.length || checkOnlyThisElements.includes(item.element),
        )
        .filter(() => Math.random() < random)
        .forEach(item => {
          context(
            `Should load ${section.sectionName}, ${item.title}, first register and check all items`,
            () => {
              before(() => {
                cy.open();
                cy.clickOnModuleElement(`"menu-${section.sectionName}"`, `"submenu-${item.title}"`);
                cy.get('[data-testid="rowDetailLink"]', { timeout: 25000 }).first().click();
              });
              if (properties[item.title.replace(' ', '_').toLowerCase()]) {
                it.only('should have expected fields', () => {
                  cy.makeApiCrmViewRequest({
                    viewType: 'complete',
                    element: item.element,
                    callback: result => {
                      const { sections } = result.body;
                      sections.forEach(section => {
                        cy.findByTestId('sectionTitle_' + section.label).should('exist');
                        section.properties.forEach(property => {
                          cy.findByTestId(
                            'property_label_' + property.elementProperty.label,
                          ).should('exist');
                          cy.findByTestId('renderer_' + property.name).should('exist');
                        });
                      });
                    },
                  });
                });
              }
              it('should colapse the first collapse', () => {
                cy.get('#pane-complete .el-collapse-item__header ').first().click();
                cy.get('#pane-complete .el-collapse-item__content')
                  .first()
                  .should('not.be.visible');
                cy.get('#pane-complete .el-collapse-item__header ').first().click();
                cy.get('#pane-complete .el-collapse-item__content ').first().should('be.visible');
              });
              it('should colapse the last collapse', () => {
                cy.get('#pane-complete .el-collapse-item__header').last().click();
                cy.get('#pane-complete .el-collapse-item__content').last().should('be.visible');
                cy.get('#pane-complete .el-collapse-item__header ').last().click();
                cy.get('#pane-complete .el-collapse-item__content ')
                  .last()
                  .should('not.be.visible');
              });
            },
          );
        });
    });
});
