/// <reference types="cypress" />

context('Auth', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.open(true);
  });

  it(`Should go to ${office} and succesfully login`, () => {
    cy.enterOffice(office);
    cy.login(users.okUsername, users.okPassword);
  });

  it(`Should go to ${office} and incorrect login email`, () => {
    cy.enterOffice(office);
    cy.loginAuth(users.errorEmail, users.okPassword);
    cy.checkErrorMessage();
  });

  it(`Should go to ${office} and incorrect login password`, () => {
    cy.enterOffice(office);
    cy.loginAuth(users.okUsername, users.badPassword);
    cy.checkErrorMessage();
  });

  it('Should validate form with empty email', () => {
    cy.enterOffice(office);
    cy.getInputByTestId('login_email').clear().blur();
    cy.checkValidationError();
  });

  it('Should validate form with empty password', () => {
    cy.enterOffice(office);
    cy.getInputByTestId('login_password').clear().blur();
    cy.checkValidationError();
  });

  it.skip('Should autologin successfully', () => {
    cy.open();
    cy.visit(
      `${Cypress.env().baseUrl}/${office}?access_token=${users.accessToken}&refresh_token=${users.refreshToken}`,
    );
    cy.url({ timeout: 25000 }).should('contain', `${Cypress.env().baseUrl}/${office}/dashboard`);
  });

  it('Should go custom URL and return after login', () => {
    cy.open();
    cy.visit(`${Cypress.env().baseUrl}/${office}/${users.testPath}`);
    cy.loginAuth(users.okUsername, users.okPassword);
    cy.url({ timeout: 25000 }).should(
      'contain',
      `${Cypress.env().baseUrl}/${office}/${users.testPath}`,
    );
  });
});
