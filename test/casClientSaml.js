'use strict';

const assert = require('assert');
const colors = require('colors/safe');
const CasClientSaml = require('../src/CasClientSaml');

console.log('##### Test Cas Client Saml');

console.log('\t no cas service url');
assert.throws(
  () => new CasClientSaml({ cas: {} }), /missing cas service url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\t valid options');
assert.doesNotThrow(
  () => new CasClientSaml({
    cas: {
      serviceUrl: 'https://cas-service'
    }
  }), `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);