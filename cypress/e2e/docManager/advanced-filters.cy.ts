/// <reference types="Cypress"/>
import 'cypress-localstorage-commands';
import { getDateFromPicker } from 'cypress/lib/utils';
import { endOfDay, isAfter, isBefore, startOfDay } from 'date-fns';

describe('Test DocManager', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.goToDocManager(office);
    cy.findByTestId('quickSearchButton').click({ force: true });
  });

  it.skip('should filter by type of file', () => {
    cy.findByTestId('quickSearchButton').click({ force: true });
    cy.findByTestId('quick-search-select-type').click({ force: true });
    cy.findByTestId('quick-search-select-option-pdf').should('be.visible').click({ force: true });
    cy.findByTestId('quick-search-select-type').click({ force: true });
    cy.interceptCrmRequest<ElementRegistries>({
      path: 'element_registries/gdocu',
      trigger: () => cy.findByTestId('quick-search-search-confirm').click({ force: true }),
      callback: (body, status) => {
        expect(status).eq(200);
        body.items.forEach(file => {
          const mimeProperty = file.values.find(value => value.property.name == 'mime');
          if (!mimeProperty) throw Error('property mime is undefined');
          const mimeValue = mimeProperty.value;
          const fileType = mimeValue.split('/');
          expect(fileType).include('pdf');
        });
      },
    });
  });

  it('should filter by title', () => {
    const fileTitle = 'EXPEDIENTES';
    cy.findByTestId('globalQuickSearch').clear().type(fileTitle);
    cy.interceptCrmRequest<ElementRegistries>({
      path: 'element_registries/gdocu',
      trigger: () => cy.wait(1000).findByTestId('globalQuickSearch'),
      callback: (body, status) => {
        body.items.forEach(file => {
          const property = file.values.find(value => {
            return value.property.name === 'nombrefinal';
          });
          if (!property) throw Error('property is undefined');
          const title = new RegExp(fileTitle, 'i').test(property.value);
          expect(title).true;
        });
      },
    });
  });

  it.skip('should filter by date', () => {
    let startDate;
    let endDate;
    cy.get('.el-date-editor').click({ force: true });
    cy.get('.el-picker-panel__sidebar').contains('Últimos 7 días').click({ force: true });
    cy.get('.el-date-editor')
      .find('input[placeholder="Fecha inicial"]')
      .invoke('val')
      .then($value => {
        startDate = $value;
      });
    cy.get('.el-date-editor')
      .find('input[placeholder="Fecha final"]')
      .invoke('val')
      .then($value => {
        endDate = $value;
      });
    cy.interceptCrmRequest<ElementRegistries>({
      path: 'element_registries/gdocu',
      trigger: () => cy.findByTestId('quick-search-search-confirm').click({ force: true }),
      callback: (body, status) => {
        const [startDateDate, startDateTime] = startDate.split(' ');
        startDate = startOfDay(getDateFromPicker(startDateDate, startDateTime));
        const [endDateDate, endDateTime] = endDate.split(' ');
        endDate = endOfDay(getDateFromPicker(endDateDate, endDateTime));
        body.items.forEach(file => {
          const fecha_creacion = file.values.find(value => value.property.name == 'fecha_creacion');
          if (!fecha_creacion) throw Error('property is undefined');
          expect(
            isBefore(fecha_creacion.value, endDate) && isAfter(fecha_creacion.value, startDate),
          ).eq(true, 'The date is between range');
        });
      },
    });
  });

  it('should filter by description', () => {
    const description = 'Descripcion de prueba';
    cy.findByTestId('quick-search-description').clear().type(description);
    cy.interceptCrmRequest<ElementRegistries>({
      path: 'element_registries/gdocu',
      trigger: () => cy.findByTestId('quick-search-search-confirm').click({ force: true }),
      callback: (body, status) => {
        body.items.forEach(file => {
          const property = file.values.find(value => value.property.name == 'descripcion');
          if (!property) throw Error('property is undefined');
          const descriptionFile = property.value;
          expect(descriptionFile).eq(description);
        });
      },
    });
  });

  it.skip('should filter by user', () => {
    // todo no se aplica el filtro del usuario seleccionado en la petición, hay que corregirlo
    const user = 'angel';
    cy.findByTestId('quick-search-select-users').click({ force: true });
    cy.get('.el-popper[aria-hidden="false"]')
      .find('.el-select-dropdown__item')
      .contains(user)
      .click({ force: true });
    cy.findByTestId('quick-search-select-users').click({ force: true });
    cy.interceptCrmRequest<ElementRegistries>({
      path: 'element_registries/gdocu',
      trigger: () => cy.findByTestId('quick-search-search-confirm').click({ force: true }),
      callback: (body, status) => {
        expect(status).eq(200);
        cy.get('.el-table-v2__row')
          .should('be.visible')
          .each(($item, index, $list) => {
            cy.wrap($item).find('.document-checkbox').click({ force: true });
            cy.findByTestId('colapse-button-metadata').click({ force: true });
            cy.get('.el-collapse-item__header')
              .contains(/permisos/i)
              .click({ force: true });
            cy.get('.fill-space .el-tag').contains(user).should('exist');
            cy.findByTestId('colapse-button-metadata').click({ force: true });
            cy.wrap($item).find('.document-checkbox').click({ force: true });
          });
      },
    });
  });

  it.skip('should filter by group', () => {
    // todo no se aplica el filtro del grupo seleccionado en la petición, hay que corregirlo
    const group = 'IBERLEY';
    cy.findByTestId('quick-search-select-groups').click({ force: true });
    cy.get('.el-popper[aria-hidden="false"]').contains(group).click({ force: true });
    cy.findByTestId('quick-search-select-groups').click({ force: true });
    cy.interceptCrmRequest<ElementRegistries>({
      path: 'element_registries/gdocu',
      trigger: () => cy.findByTestId('quick-search-search-confirm').click({ force: true }),
      callback: (body, status) => {
        expect(status).eq(200);
        cy.get('.el-table-v2__row')
          .should('be.visible')
          .each(($item, index, $list) => {
            cy.wrap($item).find('.document-checkbox').click({ force: true });
            cy.findByTestId('colapse-button-metadata').click({ force: true });
            cy.get('.el-collapse-item__header')
              .contains(/permisos/i)
              .click({ force: true });
            cy.get('.fill-space .el-tag').contains(group).should('exist');
            cy.findByTestId('colapse-button-metadata').click({ force: true });
            cy.wrap($item).find('.document-checkbox').click({ force: true });
          });
      },
    });
  });
});
