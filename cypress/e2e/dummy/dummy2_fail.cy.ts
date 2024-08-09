/// <reference types="cypress" />

context('Dummy test 2 (should fail)', () => {
  it(`Should just fail`, () => {
    expect(true).to.equal(false);
  });
});
