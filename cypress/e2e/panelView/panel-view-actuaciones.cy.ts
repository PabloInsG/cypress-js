/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('Test - Panel View actuaciones', () => {
    let users: UserCredentialOptions;
    const office = Cypress.env('despacho');

    before(() => {
        cy.fixture('users').then(data => { users = data });
        cy.intercept('*value%5D=To%20do*').as('toDo');
        cy.intercept('*value%5D=In%20Progress*').as('inProgress');
        cy.intercept('*value%5D=Bloqueado*').as('bloqueado');
        cy.intercept('*value%5D=Planificado*').as('planificado');
        cy.intercept('*value%5D=Hecho*').as('hecho')
    });

    it('should confirm the number of items by columns', () => {
        cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
        cy.clickOnModuleElement('Gestión', 'Actuaciones');
        cy.get('.el-tabs__item.is-top').contains('pago').click();
        cy.get('.el-radio-button input').eq(1).parent().click();
        cy.wait('@planificado').then( ({ response, request }) => {
            const itemsPerPage = response!.body.itemsPerPage;
            cy.get('.el-card__body').contains('PENDIENTE').parent().next().find('.el-card__body').then($items => {
                expect($items.length).eq(itemsPerPage);
            });
        });
        cy.wait('@hecho').then( ({ response, request }) => {
            const itemsPerPage = response!.body.itemsPerPage
            ;
            cy.get('.el-card__body').contains('FINALIZADO').parent().next().find('.el-card__body').then($items => {
                expect($items.length).eq(itemsPerPage);
            });
        });
        cy.wait('@inProgress').then( ({ response, request }) => {
            const itemsPerPage = response!.body.itemsPerPage;
            cy.get('.el-card__body').contains('EN PROGRESO').parent().next().find('.el-card__body').then($items => {
                expect($items.length).eq(itemsPerPage);
            });
        });
        cy.wait('@toDo').then( ({ response, request }) => {
            const itemsPerPage = response!.body.itemsPerPage
            ;
            cy.get('.el-card__body').contains('POR HACER').parent().next().find('.el-card__body').then($items => {
                expect($items.length).eq(itemsPerPage);
            });
        });
        cy.wait('@bloqueado').then( ({ response, request }) => {
            const itemsPerPage = response!.body.itemsPerPage
            ;
            cy.get('.el-card__body').contains('CORREGIR').parent().next().find('.el-card__body').then($items => {
                expect($items.length).eq(itemsPerPage);
            });
        });
    });
});
