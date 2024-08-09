/// <reference types="cypress" />

describe("Test email accounts", () => {
    let users: UserCredentialOptions;
    const office = Cypress.env('despacho');
    const plantillaMap = {
        "prueba duplica 5": '326'
    };
    before(() => {
        cy.fixture('users').then(data => { users = data });
    });

    it("should check emails", () => {
        cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
        cy.clickOnUserSettings("userMenu_settings");
        cy.clickOnSubMenuAsideSettings('Cuentas de email');
        cy.get('.el-table__row').eq(0).as('row');
        cy.interceptMailRequest<AccountResponse>({
            path: 'accounts/',
            trigger: () => cy.get('@row').contains('Editar').click(),
            callback: (body, status) => {
                cy.url().should('contain', body.id)
                // cy.get('.el-form-item__label').each(($el, index, $list) => {
                //     const labelText = $el.text();

                // })
                cy.get('.el-form-item__label').each(($el, index, $list) => {
                    const labelText = $el.text();
                    if(labelText == "Contraseña saliente" || labelText == "Contraseña entrante") {
                        cy.wrap($el).next().find('.el-input-group__append').contains(/mostrar/i).click();
                        cy.wrap($el).next().find('input').invoke('attr', 'prop').then((prop) => {
                            if(!prop) throw new Error('Prop is undefined');
                            // cy.wrap($el).click('left');
                            cy.wrap($el).next().find('input').invoke('val').then(value => {
                                expect(value).equal(body[prop])
                            });
                            cy.wrap($el).next().find('.el-input-group__append').contains(/ocultar/i).click();
                        });
                        return;
                    }
                    if(labelText == "Plantilla predefinida") {
                        // TODO plantillas no guarda 
                        // cy.wrap($el).next().find('input').click().invoke('attr', 'prop').then((prop) => {
                        //     if(!prop) throw new Error('Prop is undefined');
                        //     const templateResponse = body[prop];
                        //     // cy.wrap($el).click('left');
                        //     cy.wrap($el).next().find('input').invoke('val').then( value => {
                        //         expect(plantillaMap[value]).equal(templateResponse);
                        //     });
                        // });
                        return;
                    }
                    // Rest of label
                    cy.wrap($el).next().find('input').click().invoke('attr', 'prop').then((prop) => {
                        if(!prop) throw new Error('Prop is undefined');
                        // cy.wrap($el).click('left');
                        cy.wrap($el).next().find('input').invoke('val').then( value => {
                            expect(value).eq(body[prop].toString())
                        });
                    });
                });
            }
        });
    });
});