/// <reference types="cypress" />

describe('Test email accounts', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
  });

  it('Should check list', () => {
    cy.interceptCrmRequest<CountersResponse[]>({
      path: 'general_counters',
      trigger: () => cy.clickOnSubMenuAsideSettings('Contadores'),
      callback: (body, status) => {
        expect(status).equal(200);
      const elementCounter = {}
        
        body.forEach(item => {
          const elementName = item.elementName;
          if(elementCounter[elementName]) {
            elementCounter[elementName] += 1;
          } else {
            elementCounter[elementName] = 1;
          }
        })
        for(const [key, value] of Object.entries(elementCounter)) {
          cy.get(`[id="tab-${key}"]`).should('be.visible').click();
          cy.get(`[id="pane-${key}"]`).find('.el-table__row').should('have.length', value);
        }
      },
    });
  });
});
