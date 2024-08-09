/// <reference types="cypress" />
import 'cypress-localstorage-commands';
import { getRandomNumber } from 'cypress/lib/utils';

describe('Test tags', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const tagMaxToSelect = 2;
  const tagsSelected: string[] = [];
  let element: string;

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);

    if (office === 'clouddistrict') {
      cy.clickOnModuleElement('Fichero', 'Clientes');
      element = 'clientes_propios';
    }
    if (['lopd', 'lopd-qa'].includes(office)) {
      cy.clickOnModuleElement('Fichero', 'Contactos principales');
      element = 'contactos_met';
    }
    cy.findAllByTestId('rowDetailLink').first().click();
    cy.findByTestId('tagCollapseContainer').contains(/etiquetas/i);
  });

  it.skip('should select some tags', () => {
    if (['lopd', 'lopd-qa'].includes(office)) {
      cy.findByTestId('select-tipocontacto').click();
      cy.get('.el-popper[aria-hidden=false] .el-tag').as('tags');
      cy.get('@tags').then($tags => {
        const tagAmount = $tags.length;
        for (let i = 0; i < tagMaxToSelect; i++) {
          if (i !== 0) {
            cy.findByTestId('select-tipocontacto').click();
          }
          const tagNumber = getRandomNumber(0, tagAmount);
          cy.wrap($tags)
            .eq(tagNumber)
            .then($tag => {
              const tagContent = $tag.text();
              cy.interceptCrmRequest({
                method: 'PUT',
                path: `element_register/${element}/*`,
                trigger: () => cy.wrap($tag).click({ force: true }),
                callback: (body, status) => {
                  expect(status).eq(200, 'The update was done correctly');
                },
              });
              tagsSelected.push(tagContent);
              cy.get('.el-tag.is-closable').contains(tagContent).should('be.visible');
            });
        }
      });
    }

    cy.findByTestId('select-tags').click();
    cy.get('.el-popper[aria-hidden=false] .el-tag').as('tags');
    cy.get('@tags').then($tags => {
      const tagAmount = $tags.length;
      for (let i = 0; i < tagMaxToSelect; i++) {
        if (i !== 0) {
          cy.findByTestId('select-tags').click();
        }
        const tagNumber = getRandomNumber(0, tagAmount);
        cy.wrap($tags)
          .eq(tagNumber)
          .then($tag => {
            const tagContent = $tag.text();
            cy.interceptCrmRequest({
              method: 'PUT',
              path: `element_register/${element}/*`,
              trigger: () => cy.wrap($tag).click({ force: true }),
              callback: (body, status) => {
                expect(status).eq(200, 'The update was done correctly');
              },
            });
            tagsSelected.push(tagContent);
            cy.get('.el-tag.is-closable').contains(tagContent).should('be.visible');
          });
      }
    });
  });

  it.skip('should delete the selected tags', () => {
    cy.get('.el-select.select-input').parent().prev().find('.el-tag.is-closable').as('tags');
    for (let i = 0; i < tagsSelected.length; i++) {
      cy.get('@tags')
        .contains(tagsSelected[i])
        .then($tag => {
          cy.wrap($tag).should('be.visible').parent().find('.el-tag__close').click();
          cy.wrap($tag).should('not.exist');
        });
    }
  });
});
