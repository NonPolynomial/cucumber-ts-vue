import { expect } from 'chai';
import { Given, When, Then } from 'cucumber'

Given('I have {int}', function (int) {
  this.amount = int;
});

When('I add {int}', function (int) {
  this.amount += int;
});

Then('I will have {int}', function (int) {
  expect(this.amount).to.equal(int);
});
