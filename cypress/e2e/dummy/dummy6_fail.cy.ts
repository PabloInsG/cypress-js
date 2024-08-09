/// <reference types="cypress" />

context('Dummy test 5 (should fail)', () => {
  it(`Should just pass`, () => {
    expect(true).to.equal(true);
  });
  it(`Should just fail`, () => {
    expect(true).to.equal(false);
  });
});
