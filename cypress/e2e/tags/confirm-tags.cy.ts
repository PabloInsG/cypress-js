/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test Tags', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  let element: string;

  before(() => {
    cy.fixture('users').then(data => (users = data));
    cy.intercept('GET', `${Cypress.env().crmUrl}/view/enums/contactos_met/tags`).as('getTags');
    if(office === 'lopd-qa') {
      cy.intercept('GET', `${Cypress.env().crmUrl}/tags/contactos_met?field=tipocontacto`).as('getTypeContact');
    }
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    if(office === 'clouddistrict') {
      cy.clickOnModuleElement('Fichero', 'Clientes');
      element = 'clientes_propios'
    }
    if(['lopd', 'lopd-qa'].includes(office)) {
      cy.clickOnModuleElement('Fichero', 'Contactos principales');
      element = 'contactos_met'
    }
  });

  it('should validate that the tags received in the request are in the list', () => {
    cy.findAllByTestId('rowDetailLink').first().click();
    cy.wait('@getTags').then(({ response, request }) => {
      cy.findByTestId('select-tags').then($container => {
        cy.wrap($container).find('.el-select').click();
        cy.get('.el-select__popper[aria-hidden="false"]').find('.el-select-dropdown__item').as('tags')
        response?.body.enums.forEach(tag => {
          cy.get('@tags').contains(tag.label);
        })
      })
    })
    if(office === 'lopd-qa') {
      cy.wait('@getTypeContact').then(({ response, request }) => {
        cy.findByTestId('select-tipocontacto').then($container => {
          cy.wrap($container).find('.el-select').click();
          cy.get('.el-select__popper[aria-hidden="false"]').find('.el-select-dropdown__item').as('tags')
          response?.body.tagCollection.forEach(tag => {
            cy.get('@tags').contains(tag.label);
          });
        });
      });
    }
  });

  it('should validate that the tags received in the request are in the drawer list', () => {
    cy.interceptCrmRequest<ViewActionResponse>({
      path: `view/enums/${element}/tags`,
      trigger: () => cy.findAllByTestId('rowDetailLink').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
        cy.findByTestId('tag-list').click();
        cy.get('.el-drawer.rtl.open').find('.el-table__row').as('tags')
        body.enums.forEach(tag => {
          cy.get('@tags').contains(tag.label)
        });
      },
    });
  });
});
