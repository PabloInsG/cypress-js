/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test Resource Item and Relations', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  context('Test Resource Item and Relations', () => {
    beforeEach(() => {
      cy.interceptCrmRequest<UserMenuResponse>({
        path: 'menus/me',
        trigger: () => cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword),
        callback: (body, status) => {
          expect(status).eq(200);
          modules = body.items;
        },
      });
    });

    officeModules.forEach(item => {
      it('Should check a resource item and its relations', () => {
        cy.interceptCrmRequest<RelationViewBody>({
          path: `view/relation/${item.element}`,
          trigger: () => cy.clickOnModuleElement(item.section, item.elementLabel),
          callback: relationBody => {
            cy.interceptCrmRequest<ElementRegistry[]>({
              path: `element_registries/${item.element}?(.+)&properties%5B1%5D`,
              callback: (elementRegistriesBody, status) => {
                const count = elementRegistriesBody.length;
                if (!count) return;
                cy.findByTestId('rowDetailLink').first().click({ force: true });
                cy.findByTestId('complete-view').should('exist');
                expect(status).to.eq(200);
                cy.recursionLoop(sectionIndex => {
                  const sect: Section = relationBody.sections[sectionIndex] as Section;
                  // todo corregir variables
                  if (!crmApplicationTypes[sect.section]) {
                    return sectionIndex > 0;
                  }
                  cy.findByTestId('detail_view_tabs')
                    .findByTestId(`detail_view_section_tab__${sect.section}`)
                    .click({ force: true });
                  cy.recursionLoop(index => {
                    const elem: RelationView = sect.relationsViews[index];
                    cy.findByTestId('main-table').should('exist');
                    cy.interceptCrmRequest<ListViewBody>({
                      path: `view/quick_creation/${elem.element}`,
                      trigger: () =>
                        cy
                          .findByTestId(`relation_tab__${elem.element}`)
                          .parent('div:not(.is-disabled)')
                          .click({ force: true }),
                      callback: (quickCreationBody, status) => {
                        if (status !== 200) {
                          cy.findByTestId('addElementDrawerButton').should('not.exist');
                        } else {
                          cy.findByTestId(`relation_tab__${elem.element}`)
                            .parent()
                            .should('have.class', 'is-active');
                        }
                      },
                    });
                    cy.get('.el-pagination__total').then(el => {
                      cy.get('.el-notification__content').should('not.exist');
                      const htmlValue = el[0].innerHTML;
                      const regExExec = /\d+/.exec(htmlValue);
                      const total = regExExec && regExExec[0];
                      if (Number(total) > 0) {
                        cy.get('.el-table__row').should('have.length.gt', 0);
                      } else {
                        cy.get('.no-results').should('exist');
                      }
                    });
                    // let's wait here because prev .then will run synchronous and next iteration will come before
                    // resolving table total checks. 1 sec should be enough as it only needs to find existing elements
                    // in DOM
                    cy.wait(1000);
                    return index > 0;
                  }, sect.relationsViews.length);
                  return sectionIndex > 0;
                }, relationBody.sections.length || 0);
              },
            });
          },
        });
      });
    });
  });
});
