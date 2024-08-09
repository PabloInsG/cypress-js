/// <reference types="Cypress"/>

describe('Test Doc Manager', () => {
  const office = Cypress.env('despacho');
  let users: UserCredentialOptions;
  let previousDate: Date = new Date();
  let currentDate: Date = new Date();
  const module = office === 'lopd-qa' ? 'Utilidades' : 'Gestor Documental';

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.goToDocManager(office);
  });

  it('Should test sort order columns', () => {
    cy.interceptCrmRequest<ElementRegistries>({
      path: 'element_registries/gdocu?',
      trigger: () =>
        cy
          .findByTestId('list-main')
          .find('.el-table-v2__header-cell')
          .eq(2)
          .children()
          .eq(0)
          .click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
        // todo ¿Esto está testando correctamente el ordenado?
        const idx1 = response.items[0].values.findIndex(
          item => item.property.elementProperty.name === 'fechamodificacion',
        );
        currentDate = new Date(response.items[0].values[idx1].value || 0);
        expect(previousDate).to.not.equal(currentDate);
        const idx2 = response.items[0].values.findIndex(
          item => item.property.elementProperty.name === 'nombrefinal',
        );
        const currentFileName = response.items[0].values[idx2].value;
        cy.getElementOfDocsList(currentFileName);
      },
    });
  });
});
