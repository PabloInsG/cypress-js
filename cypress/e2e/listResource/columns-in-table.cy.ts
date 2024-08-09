/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test - Column Headers', () => {
    let users: UserCredentialOptions;
    const office = Cypress.env('despacho');
    const officeModules = Cypress.env('officeModules').split(',')
    let modules: CrmMenuItem[];
    before(() => {
        cy.fixture('users').then(data => users = data );
    });

    context('should verify that the selected columns appear in the header table', () => {
        beforeEach(() => {
            cy.interceptCrmRequest<UserMenuResponse>({
                path: 'menus/me',
                trigger: () => cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword),
                callback: (body, status) => {
                    expect(status).eq(200);
                    modules = body.items;
                }
            });
        });

        officeModules.forEach(officeModule => {
            it(`Test module ${officeModule}`, () => {
                const module = modules.find(m => m.label === officeModule)
                if (!module) {
                    cy.log('Module not found!');
                    return;
                }
                cy.testOverModulElements(module, 'view/list/', body => {
                    const selectedColumns = body.headers.filter(header => header.elementProperty.enabled === true);
                    cy.wait(1000)
                    cy.get('.el-table__body').find('thead tr').first().as('row')
                    selectedColumns.forEach(column => {
                        const isEnabled = column.elementProperty.enabled;
                        if(!isEnabled) return
                        const label = column.elementProperty.label;
                        cy.get('@row').contains(label).should('exist');
                    })
                });
            });
        });
    });
});