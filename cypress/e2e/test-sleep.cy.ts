it('Should sleep for 10 min', () => {
  cy.wait(1000 * 60 * 10);
  expect(true).to.be.true;
});
