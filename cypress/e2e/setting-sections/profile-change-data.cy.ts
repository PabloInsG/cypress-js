/// <reference types="cypress" />

describe('Test Profile user', () => {
  let office = Cypress.env('despacho');
  let users: UserCredentialOptions;
  let userData: UserDataFake;
  let oldData: UserDataResponseValue[];
  before(() => {
    cy.fixture('users').then(data => (users = data));
    cy.fixture('userSettings_data').then(data => (userData = data));
  });

  it('should change the data and save it', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.interceptCrmRequest<UserDataResponse>({
      path: 'user/39',
      trigger: () => cy.clickOnUserSettings('userMenu_settings'),
      callback: (body, status) => {
        oldData = body.register.values;
        cy.get('.el-card__body').as('containers');
        cy.get('@containers').each(($el, index, $list) => {
          const title = $el.find('h3').text();
          if (title == 'Datos personales') {
            cy.get('.el-input__inner[prop="nombre"]').clear().type(userData.name);
            cy.get('.el-input__inner[prop="primer_apellido"]').clear().type(userData.firstLastname);
            cy.get('.el-input__inner[prop="segundo_apellido"]').clear().type(userData.secondLastname);
            cy.get('.el-input__inner[prop="telefono"]').clear().type(userData.phone);
            cy.wrap($el)
              .contains(/es activo/i)
              .next()
              .find('input[type="checkbox"]')
              .then($checkbox => {
                cy.wrap($checkbox)
                  .invoke('prop', 'checked')
                  .then($valueInput => {
                    $valueInput == userData.isActive
                      ? cy
                          .wrap($checkbox)
                          .should(userData.isActive ? 'be.checked' : 'not.be.checked')
                      : cy
                          .wrap($checkbox)
                          .click({ force: true })
                          .should(userData.isActive ? 'be.checked' : 'not.be.checked');
                  });
              });
            cy.wrap($el)
              .contains(/es administrador/i)
              .next()
              .find('input[type="checkbox"]')
              .should('be.checked');
          }
          if (title == 'Email de notificaciones') {
            cy.get('.el-input__inner[prop="notificationsEmail"]').clear().type(userData.email);
          }
        });
        cy.get('#save-btn').should('be.visible').click();
        cy.get('.el-notification')
          .should('be.visible')
          .then($notificationBox => {
            cy.wrap($notificationBox).find('.el-notification--success').should('exist');
            cy.wrap($notificationBox)
              .contains('Perfil de usuario guardado correctamente')
              .should('be.visible');
          });
      },
    });
  });

  it('should render the data saved', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.interceptCrmRequest<UserDataResponse>({
      path: 'user/39',
      trigger: () => cy.clickOnUserSettings("userMenu_settings"),
      callback: (body, status) => {
        cy.wrap(status).should(
          'eq',
          200,
          'The response of the request should have a status code of 200',
        );
        cy.get('.el-card__body').as('containers');
        cy.get('@containers').each(($el, index, $list) => {
          const title = $el.find('h3').text();
          if (title == 'Datos personales') {
            cy.get('.el-input__inner[prop="nombre"]').should('have.value', userData.name);
            cy.get('.el-input__inner[prop="primer_apellido"]').should('have.value', userData.firstLastname);
            cy.get('.el-input__inner[prop="segundo_apellido"]').should('have.value',userData.secondLastname);
            cy.get('.el-input__inner[prop="telefono"]').should('have.value', userData.phone);
            cy.wrap($el)
              .contains(/es activo/i)
              .next()
              .find('input[type="checkbox"]')
              .should(userData.isActive ? 'be.checked' : 'not.be.checked');
            cy.wrap($el)
              .contains(/es administrador/i)
              .next()
              .find('input[type="checkbox"]')
              .should('be.checked');
          }
          if (title == 'Email de notificaciones') {
            cy.get('.el-input__inner[prop="notificationsEmail"]').should(
              'have.value',
              userData.email,
            );
          }
        });
      },
    });
  });

  it('should restart the old data', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings("userMenu_settings");
    cy.wait(5000);
    cy.get('.el-card__body').as('containers');
    const name = oldData.find(data => data.property.name == 'nombre')!.value;
    const firstLastname = oldData.find(data => data.property.name == 'primer_apellido')!.value;
    const secondLastname = oldData.find(data => data.property.name == 'segundo_apellido')!.value;
    const phone = oldData.find(data => data.property.name == 'telefono')!.value;
    const isActive = oldData.find(data => data.property.name == 'activo')!.value;
    const email = oldData.find(data => data.property.name == 'email')!.value;
    cy.get('@containers').each(($el, index, $list) => {
      const title = $el.find('h3').text();
      if (title == 'Datos personales') {
        cy.get('.el-input__inner[prop="nombre"]').clear().type(name);
        cy.get('.el-input__inner[prop="primer_apellido"]').clear().type(firstLastname);
        cy.get('.el-input__inner[prop="segundo_apellido"]').clear().type(secondLastname);
        cy.get('.el-input__inner[prop="telefono"]').clear().type(phone);
        cy.wrap($el)
          .contains(/es activo/i)
          .next()
          .find('input[type="checkbox"]')
          .invoke('prop', 'checked')
          .then($valueInput => {
            $valueInput == parseInt(isActive) // We take advantage of coercion -- 1 == true -> true; 0 == true -> false
              ? cy
                  .wrap($el)
                  .contains('Es activo')
                  .next()
                  .should(isActive == '1' ? 'be.checked' : 'not.be.checked')
              : cy
                  .wrap($el)
                  .contains('Es activo')
                  .next()
                  .click()
                  .should(userData.isActive ? 'be.checked' : 'not.be.checked');
          });
        cy.wrap($el)
          .contains('Es administrador')
          .next()
          .find('input[type="checkbox"]')
          .should('be.checked');
      }
      if (title == 'Email de notificaciones') {
        cy.get('.el-input__inner[prop="notificationsEmail"]').clear().type(email);
      }
    });
    cy.get('#save-btn').should('be.visible').click();
    cy.get('.el-notification')
      .should('be.visible')
      .then($notificationBox => {
        cy.wrap($notificationBox).find('.el-notification--success').should('exist');
        cy.wrap($notificationBox)
          .contains('Perfil de usuario guardado correctamente')
          .should('be.visible');
      });
  });
});
