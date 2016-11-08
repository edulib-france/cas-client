'use strict';

const assert = require('assert');
const colors = require('colors/safe');
const CasClientSaml = require('../src/CasClientSaml');

console.log('##### Test Cas Client Saml');

console.log('\t no cas server url');
assert.throws(
  () => new CasClientSaml({ cas: {} }), /missing cas server url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\t valid options');
assert.doesNotThrow(
  () => new CasClientSaml({
    cas: {
      serverUrl: 'https://cas-server'
    }
  }), `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);