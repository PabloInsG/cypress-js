/// <reference types="cypress" />

import { format } from 'date-fns';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { nameGeneratorConfig } from '../../lib/utils';

const randomName: string = uniqueNamesGenerator({
  dictionaries: [adjectives, colors, animals],
});

describe('Test Calendar', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.testDefaultCalendar();
  });
  context('Test Calendar', () => {
    it('Should go to calendar and see custom widgets', () => {
      cy.get('.event-filter.state-filter').should('be.visible');
      cy.get('.event-filter.type-filter').should('be.visible');
      cy.get('.b-widget[data-ref="myCalendarsFilters"]').should('exist');
      cy.get('.b-widget[data-ref="teamCalendarsFilters"]').should('exist');
    });
    it('Should go to calendar and see events', () => {
      cy.interceptCalendarRequest<CalendarEventsResponse>({
        path: 'events(.+)',
        trigger: () => cy.reload(),
        callback: (body, status) => {
          cy.closeDefaultCalendarDialog();
          expect(status).to.eq(200);
          expect(body).to.have.property('hydra:member');
          body['hydra:member'].forEach(event => {
            cy.findEventInCalendar(event);
          });
        },
      });
    });
    it('Should open an event and see a form with its data', () => {
      cy.interceptCalendarRequest<CalendarEventsResponse>({
        path: 'events(.+)',
        trigger: () => cy.reload(),
        callback: (body, status) => {
          cy.closeDefaultCalendarDialog();
          expect(status).to.eq(200);
          expect(body).to.have.property('hydra:member');
          const firstEvent: Maybe<CalendarEvent> = body['hydra:member'].find(
            event => !event.readonly,
          );
          if (!firstEvent) return;
          cy.interceptCalendarRequest<CalendarEvent>({
            path: 'events/' + firstEvent.id,
            trigger: () =>
              cy.get(`.b-cal-event-wrap[data-event-id="${firstEvent.id}"]`).first().dblclick(),
            callback: (event, status) => {
              expect(status).to.eq(200);
              //titulo
              if (!event.title) {
                cy.get('.el-form-item input[name="title"]').should('be.empty');
              } else {
                cy.get('.el-form-item input[name="title"]').should('have.value', event.title);
              }
              //tipo de evento
              cy.get('#event-type-select .el-select__selected-item.el-select__placeholder').should(
                'have.text',
                event.eventType,
              );
              const dateFormat = event.isAllDayEvent ? 'dd-MM-yyyy' : 'dd-MM-yyyy HH:mm';
              //fecha inicio
              cy.get('.el-input__inner[name="startDate"]').should(
                'have.value',
                format(new Date(event.start || ''), dateFormat),
              );
              //fecha fin
              //todo end date comes with a day more from api when event is all day
              /*cy.get('.el-input__inner[name="endDate"]').should(
                'have.value',
                format(new Date(event.end || ''), dateFormat),
              );*/
              //Recordatorios
              cy.get('.el-collapse-item').findByText('Recordatorios').click();
              if (event.reminders) {
                cy.findAllByTestId('event-reminder').should('have.length', event.reminders.length);
              }

              //Invitados
              cy.get('.el-collapse-item .el-collapse-item__header').contains('Invitados').click();
              if (event.eventGuests) {
                cy.findAllByTestId('guests-tags').should('have.length', event.eventGuests.length);
              }
              //notas Privadas
              cy.get('.el-collapse-item .el-collapse-item__header')
                .contains('notas privadas')
                .click();
              if (event.description) {
                cy.get('.el-textarea__inner[name="privateNotes"]').should(
                  'have.value',
                  event.description,
                );
              } else {
                cy.get('.el-textarea__inner[name="privateNotes"]').should('be.empty');
              }
              //calendars
              cy.get('.el-collapse-item .el-collapse-item__header').contains('Calendarios').click();
              if (event.readonly) {
                cy.findByText(
                  'Este evento es recurrente, para borrarlo o modificarlo debe ir al calendario donde lo ha creado.',
                ).should('exist');
              }
              //asociaciones
              cy.get('.el-collapse-item .el-collapse-item__header')
                .contains('Relacionado con')
                .click();
              event.eventAssociations.forEach(association => {
                cy.findByTestId('association_' + association.label).should('exist');
              });

              if (event.readonly) {
                cy.findByText(
                  'Este evento es recurrente, para borrarlo o modificarlo debe ir al calendario donde lo ha creado.',
                ).should('exist');
              }
            },
          });
        },
      });
    });
    it('Should go to settings and see saved settings', () => {
      cy.interceptCalendarRequest<ConfigurationResource>({
        path: 'configurations/me',
        trigger: () => cy.findByTestId('calendar-settings-button').click(),
        callback: (configuration, status) => {
          expect(status).to.eq(200);
          cy.findByTestId('calendar-settings-tabs').findByText('Configuración general').click();
        },
      });
    });
    it('Should have team calendars', () => {
      cy.interceptCalendarRequest<CalendarsResponse>({
        path: 'calendars',
        trigger: () => cy.reload(),
        callback: (body, status) => {
          expect(status).to.eq(200);
          expect(body).to.have.property('hydra:member');

          const teamCalendars = body['hydra:member'].filter(v => !v.owner);
          cy.get('[data-ref="teamCalendarsFilters"]').click({ force: true });
          teamCalendars.forEach(calendar => {
            cy.get(`[data-ref="${calendar.uuid}"]`).should('exist');
          });
        },
      });
    });
    it.skip('Filters by state should work', () => {
      const eventTitle: string = uniqueNamesGenerator(nameGeneratorConfig);
      const event = { title: eventTitle };
      // todo asignar cualquier estado al evento
      cy.createEvent(event.title);
      cy.findEventInCalendar(event).should('exist');
      //tipo y estado
      // todo hacer el filtro por estado y comprobar que el evento aparece
      // todo hacer el filtro por un estado que no tenga el evento y comprobar que no aparece
      /* cy.get('div[name="priority"]').click({ force: true });
       cy.get('.el-popper[aria-hidden="false"]')
         .find('.el-select-dropdown__option-item')
         .first()
         .click({ force: true });
       cy.get('button[type="submit"]').click();*/

      // delete created event
      cy.findEventInCalendar(event).rightclick();
      cy.get('.b-float-root').findByText('Borrar evento').click();
      cy.get('div.el-overlay-message-box[aria-label="Borrar evento"]')
        .findByText('Borrar')
        .click({ force: true });
      cy.findEventInCalendar(event).should('not.exist');
    });
    it.skip('Filters by type should work', () => {
      const eventTitle: string = uniqueNamesGenerator(nameGeneratorConfig);
      const event = { title: eventTitle };
      // todo asignar cualquier tipo al evento
      cy.createEvent(eventTitle);
      cy.findEventInCalendar(event).should('exist');
      //tipo y estado
      // todo hacer el filtro por tipo y comprobar que el evento aparece
      // todo hacer el filtro por un tipo que no tenga el evento y comprobar que no aparece
      /* cy.get('div[name="priority"]').click({ force: true });
       cy.get('.el-popper[aria-hidden="false"]')
         .find('.el-select-dropdown__option-item')
         .first()
         .click({ force: true });
       cy.get('button[type="submit"]').click();*/

      // delete created event
      cy.findEventInCalendar(event).rightclick();
      cy.get('.b-float-root').findByText('Borrar evento').click();
      cy.get('div.el-overlay-message-box[aria-label="Borrar evento"]')
        .findByText('Borrar')
        .click({ force: true });
      cy.findEventInCalendar(event).should('not.exist');
    });
    it('Should send public calendar link', () => {});
  });
});
