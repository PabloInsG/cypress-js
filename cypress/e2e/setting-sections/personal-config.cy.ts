/// <reference types="cypress" />
import { getValueForNumberSeparator } from 'cypress/lib/utils';

describe('Test person config', () => {
  let office = Cypress.env('despacho');
  let users: UserCredentialOptions;
  let labelMap: labelMapConfigPersonal;
  let valueMap: valueMapConfigPersonal;

  before(() => {
    cy.fixture('users').then(data => (users = data));
    cy.fixture('labelMap_config-personal').then(data => (labelMap = data));
    cy.fixture('valueMap_config-personal').then(data => (valueMap = data));
  });

  it.skip("should check that the user's data is present", () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.interceptCrmRequest<PersonalConfigResponse>({
      path: 'personal_config/me',
      trigger: () => cy.clickOnUserSettings('userMenu_settings'),
      callback: (body, status) => {
        cy.get('#tab-personalConfig').should('be.visible').click();
        cy.get('.ep-property.option-field').each(($el, index, $list) => {
          const label = $el.find('label').text();
          const key = labelMap[label];
          if (label == 'Coste hora') {
            const apiResponse = body[key];
            cy.wrap($el).contains(apiResponse);
            return;
          }
          if (label == 'Separador de miles y decimales') {
            const thousandsSeparator = body.thousandsSeparator;
            const decimalSeparator = body.decimalSeparator;
            const valueForNumberSeparator = getValueForNumberSeparator(
              thousandsSeparator,
              decimalSeparator,
            );
            const label = valueMap.numberSeparator.find(
              option => option.value == valueForNumberSeparator,
            );
            if (!label) throw new Error('label is undefined');
            cy.wrap($el).contains(label.label);
            return;
          }
          const apiResponse = body[key];
          const value = valueMap[key].find(option => option.value == apiResponse);
          cy.wrap($el).contains(value.label);
        });
        cy.get('.input-text-form-item.horizontal.option-field[prop="template"]').then($el => {
          const label = $el.find('label').text();
          const key = labelMap[label];
          const apiResponse = body[key];
          const labelResponse = valueMap.template.find(option => option.value == apiResponse);
          cy.wrap($el).find('input').invoke('val').then(value => {
            expect(value).equal(labelResponse?.label)
          });
        })
      },
    });
  });
});
