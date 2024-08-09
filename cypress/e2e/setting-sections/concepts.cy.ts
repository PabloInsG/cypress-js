describe('Test concepts', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
  });

  it.skip('should check concept list in honorario tab', () => {
    cy.clickOnUserSettings('userMenu_settings');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'predefined',
      trigger: () => cy.clickOnSubMenuAsideSettings('Conceptos'),
      callback: (body, status) => {
        expect(status).eq(200);
        const conceptsName = body.elementRegistries.map(registry => {
          return registry.values.find(item => item.property.elementProperty.name == 'nombre')?.value
        })
        conceptsName.forEach( name => {
          cy.get('#pane-Honorario .el-table__row').contains(name!);
        }) 
      }
    });
  });
  
  it.skip('should check concept list in provision tab', () => {
    cy.clickOnUserSettings('userMenu_settings');
    cy.clickOnSubMenuAsideSettings('Conceptos');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'predefined',
      trigger: () => cy.get('#tab-Provision').click(),
      callback: (body, status) => {
        expect(status).eq(200);
        const conceptsName = body.elementRegistries.map(registry => {
          return registry.values.find(item => item.property.elementProperty.name == 'nombre')?.value
        })
        conceptsName.forEach( name => {
          cy.get('#pane-Provision .el-table__row').contains(name!);
        }) 
      }
    });
  });

  it.skip('should check concept list in gasto tab', () => {
    cy.clickOnUserSettings('userMenu_settings');
    cy.clickOnSubMenuAsideSettings('Conceptos');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'predefined',
      trigger: () => cy.get('#tab-Gasto').click(),
      callback: (body, status) => {
        expect(status).eq(200);
        const conceptsName = body.elementRegistries.map(registry => {
          return registry.values.find(item => item.property.elementProperty.name == 'nombre')?.value
        })
        conceptsName.forEach( name => {
          cy.get('#pane-Gasto .el-table__row').contains(name!);
        }) 
      }
    });
  });

  it.skip('should check concept list in suplido tab', () => {
    cy.clickOnUserSettings('userMenu_settings');
    cy.clickOnSubMenuAsideSettings('Conceptos');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'predefined',
      trigger: () => cy.get('#tab-Suplido').click(),
      callback: (body, status) => {
        expect(status).eq(200);
        const conceptsName = body.elementRegistries.map(registry => {
          return registry.values.find(item => item.property.elementProperty.name == 'nombre')?.value
        })
        conceptsName.forEach( name => {
          cy.get('#pane-Suplido .el-table__row').contains(name!);
        }) 
      }
    });
  });
});
