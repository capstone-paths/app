const { expect } = require('chai');
const mocha = require('mocha');

const { describe, it } = mocha;

describe('Hello Test', () => {
  it('can run', () => {
    expect(true).to.equal(true);
  });
});
