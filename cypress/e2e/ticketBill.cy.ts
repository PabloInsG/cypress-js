/// <reference types="cypress" />
import 'cypress-localstorage-commands';

const users = require('../fixtures/users.json');
const ticketBillProps = require('../fixtures/ticketBill.json');

describe('TicketBill', () => {
  before(() => {
    cy.getLocalStorage('token').then(value => {
      if (!value || Cypress.env().nodeEnv === 'production') {
        cy.open();
        cy.enterOffice(users.clouddistrict.office);
        cy.login(users.clouddistrict.okUser.email, users.clouddistrict.okUser.password);
      }
    });
  });
  context(`Should load Ticket Bill and check all items`, () => {
    before(() => {
      cy.open();
      cy.wait(3000);
      cy.clickOnApp('TicketBill');
    });
    it('should have expected title', () => {
      cy.get(`[data-testid_ticketBill="mainTitle"]`).should('contain', 'List of invoices');
    });
    it('should have the correct number and name of columns', () => {
      cy.get(`.el-table-v2__header-cell-text`).should(value => {
        ticketBillProps.columns.forEach((col, index) =>
          expect(value[index].innerText).to.have.string(col),
        );
      });
    });
  });
});
