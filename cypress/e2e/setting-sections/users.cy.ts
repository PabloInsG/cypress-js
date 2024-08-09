describe('Test Users', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.wait(1000)
  });

  it('should check user list', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings("userMenu_settings");
    cy.wait(500);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'user?',
      trigger: () => cy.clickOnSubMenuAsideSettings('Usuarios'),
      callback: (body, status) => {
        expect(status).eq(200);
        const userName = body.elementRegistries.map(registry => {
          return registry.values.find(item => item.property.elementProperty.name == 'user')?.value
        })
        userName.forEach( name => {
          cy.get('.el-table__row').contains(name!);
        }) 
      }
    })
  });

  it.skip('should set all users permissions', () => {
    cy.clickOnUserSettings('userMenu_settings');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'user?properties%',
      trigger: () => cy.clickOnSubMenuAsideSettings('Usuarios'),
      callback: (body, status) => {
        const users = body.rawRegisterIds;
        const totalItems = body.totalItems;
        cy.log(users.join(', '));
        cy.recursionLoop(index => {
          cy.get('a[href="/lopd/settings/users/"' + users[index] + ']').click();
          cy.findByTestId('permissions-tab').click();
          cy.get('.Panels-Read').then(element => {
            console.log(element);
          });
          cy.get('.Panels-ReadGroup').then(element => {
            console.log(element);
          });
          cy.get('.Panels-Update').then(element => {
            console.log(element);
          });
          cy.get('.Panels-Delete').then(element => {
            console.log(element);
          });
          cy.get('.Panels-Create').then(element => {
            console.log(element);
          });
        }, users.length);
      },
    });
  });
});
