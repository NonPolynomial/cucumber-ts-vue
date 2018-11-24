import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import Vue from 'vue';

import Test from '../../src/Test.vue';

Given('a Vue Instance', function () {
  this.vueInstance = new Test();
  expect(this.vueInstance).to.exist;
});

When('I click', function () {
  this.vueInstance.click();
});

Then('click is {int}', function (int) {
  expect(this.vueInstance.clicked).to.equal(1);
});
