/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('test combine registry', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const packageNameToFind = 'creditos_licencias';
  const fieldLabelToFind = 'separar_por_empresa';
  let isActiveSeparation: boolean;

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.open();
    cy.enterOffice(office);
    cy.interceptCrmRequest<ConfigurationResponse>({
      path: 'configuration',
      trigger: () => cy.login(users.okUsername, users.okPassword),
      callback: (body, status) => {
        expect(status).equal(200);
        const creditosLicencias = body.find(item => item.packageName === packageNameToFind);
        const separarEmpresaValue = creditosLicencias?.fields.find(
          field => field.label === fieldLabelToFind,
        )?.value;
        isActiveSeparation = !!Number(separarEmpresaValue);
      },
    });
  });

  it('should check if company separation is on/off', () => {
    cy.interceptCrmRequest<userRelatedCompanyResponse>({
      path: 'user-related-companies',
      trigger: () => cy.clickOnUserSettings('userMenu_selectCompany'),
      callback: (body, status) => {
        if (isActiveSeparation) {
          console.log('true');
          cy.findByTestId('selectCompanyModal').then($el => {
            cy.wrap($el).find('.el-radio').should('have.length', body.length);
            cy.wrap($el)
              .find('.el-button.el-button--primary')
              .should('not.have.class', 'is-disabled');
            cy.wrap($el).should('not.contain.text', 'Selección de empresa desativada');
            body.forEach(company => {
              cy.wrap($el).find('.el-radio').contains(company.name);
            });
          });
        } else {
          console.log('false');
          cy.findByTestId('selectCompanyModal').then($el => {
            cy.wrap($el).find('.el-radio').should('have.length', body.length);
            cy.wrap($el).find('.el-button.el-button--primary').should('have.class', 'is-disabled');
            cy.wrap($el).should('contain.text', 'Selección de empresa desativada');
            body.forEach(company => {
              cy.wrap($el).find('.el-radio').contains(company.name);
            });
            cy.wrap($el)
              .find('.el-radio')
              .each(($el, index, $list) => {
                cy.wrap($el).find('span.el-radio__input').should('have.class', 'is-disabled');
              });
          });
        }
      },
    });
  });

  it('should check if the last company used is checked', () => {
    cy.interceptCrmRequest<any>({
      path: 'last-used-company',
      trigger: () => cy.clickOnUserSettings('userMenu_selectCompany'),
      callback: (body, status) => {
        cy.findByTestId('selectCompanyModal').then($el => {
          cy.wrap($el)
            .find(`.el-radio__original[value="${body.companyId}"]`)
            .then($input => {
              cy.wrap($input).parent().should('have.class', 'is-checked');
            });
        });
      },
    });
  });
});
