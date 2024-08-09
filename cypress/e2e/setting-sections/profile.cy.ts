/// <reference types="cypress" />

describe('Test Profile user', () => {
  const office = Cypress.env('despacho');
  let users: UserCredentialOptions;
  let labels: UserSettingsLabels;
  const isTrue = '1';
  before(() => {
    cy.fixture('users').then(data => (users = data));
    cy.fixture('userSettings_labels').then(data => (labels = data));
  });

  it.skip("should check that the user's data is present", () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.interceptCrmRequest<UserDataResponse>({
      path: 'user/*',
      trigger: () => cy.clickOnUserSettings('userMenu_settings'),
      callback: (body, status) => {
        cy.wrap(status).should(
          'eq',
          200,
          'The response of the request should have a status code of 200',
        );
        const userData = body.register.values;
        console.log(body);
        cy.get('.el-card__body').as('containers');
        cy.get('@containers').each(($el, index, $list) => {
          if (index == 0) return; // Ignore the first section
          cy.wrap($el)
            .find('label')
            .each($label => {
              const labelText = $label.text();
              if (labelText === 'NIF') return; // Ignore the NIF section
              cy.wrap($label).next().as('userData'); // Get input values
              const data = userData.find(
                data => data.property.elementProperty.label === labels[labelText],
              );
              if (!data) throw new Error('Item from values is undefined');
              if (labelText === 'Login de usuario' || labelText === 'Usuario interno') {
                cy.get('@userData').should('contain', data.value);
                return;
              }
              if (labelText === 'Es activo' || labelText === 'Es administrador') {
                cy.get('@userData')
                  .find('input')
                  .should(data.value === isTrue ? 'be.checked' : 'not.be.checked');
              } else if (labelText === 'Teléfono') {
                cy.get('@userData')
                  .find('input')
                  .invoke('val')
                  .then(phoneValue => {
                    const phoneFormatted = (phoneValue! as string).replaceAll(' ', '');
                    expect(phoneFormatted).equal(data.value);
                  });
              } else {
                cy.get('@userData').find('input').invoke('val').should('contain', data.value);
              }
            });
        });
      },
    });
  });
});
