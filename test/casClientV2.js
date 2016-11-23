'use strict';

const assert = require('assert');
const colors = require('colors/safe');
const CasClientV2 = require('../src/CasClientV2');

console.log('##### Test Cas Client V2');

console.log('\t no cas service url');
assert.throws(
  () => new CasClientV2({ cas: {} }), /missing cas service url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\t valid options');
assert.doesNotThrow(
  () => new CasClientV2({
    cas: {
      serviceUrl: 'https://cas-service'
    }
  }), `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);