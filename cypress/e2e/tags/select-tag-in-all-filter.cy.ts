/// <reference types="cypress" />
import 'cypress-localstorage-commands';
import { getRandomNumber } from 'cypress/lib/utils';

describe('Test Tags', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  let tagName = '';
  let tagsName: string[] = [];
  let numberOftagsForSelect;
  let element: string;

  before(() => {
    cy.fixture('users').then(data => (users = data));
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
    cy.findByTestId('allFiltersButton').should('be.visible').click();
    cy.findByTestId('allFilters').contains(/tags/i).click();
    cy.get('.el-radio')
      .contains(/está contenido en/i)
      .parents('label')
      .as('label');
    cy.get('@label').should('have.class', 'is-checked');
    cy.get('@label').next().find('.el-select__selection').click({ force: true });
  });

  it('should select a tag in all filter', () => {
    cy.get(".el-select__popper[aria-hidden='false']")
      .find('.el-select-dropdown__item')
      .first()
      .then($tag => {
        tagName = $tag.text();
        cy.wrap($tag).click();
      });
    cy.get('@label')
      .next()
      .findByTestId('filterButton')
      .then($filterButton => {
        cy.wrap($filterButton).should('not.have.attr', 'disabled');
        cy.wrap($filterButton).click();
      });
    cy.interceptCrmRequest({
      path: `element_registries/${element}`,
      trigger: () =>
        cy
          .get('.el-button')
          .contains(/filtrar/i)
          .click(),
      callback: (body, status) => {
        expect(status).eq(200);
        cy.findByTestId('allFiltersButton').contains('1');
      },
    });
  });

  it('should select multiple tags in all filter', () => {
    cy.get(".el-select__popper[aria-hidden='false']")
      .find('.el-select-dropdown__item')
      .then($tagsList => {
        numberOftagsForSelect = getRandomNumber(1, $tagsList.length + 1);
        for (let i = 0; i < numberOftagsForSelect; i++) {
          cy.wrap($tagsList)
            .eq(i)
            .then($tag => {
              tagsName.push($tag.text());
              cy.wrap($tag).click();
            });
        }
      });
    cy.get('.el-select__wrapper')
      .find('.el-tag')
      .each(($item, index, $list) => {
        expect(tagsName.includes($item.text())).to.be.true;
      });

    cy.get('@label')
      .next()
      .findByTestId('filterButton')
      .then($filterButton => {
        cy.wrap($filterButton).should('not.have.attr', 'disabled');
        cy.wrap($filterButton).click();
      });
    cy.interceptCrmRequest({
      path: `element_registries/${element}`,
      trigger: () =>
        cy
          .get('.el-button')
          .contains(/filtrar/i)
          .click(),
      callback: (body, status) => {
        expect(status).eq(200);
        cy.findByTestId('allFiltersButton').contains(numberOftagsForSelect);
      },
    });
  });
});
