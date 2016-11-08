'use strict';

const assert = require('assert');
const colors = require('colors/safe');
const CasClientV3 = require('../src/CasClientV3');

console.log('##### Test Cas Client V3');

console.log('\t no cas server url');
assert.throws(
  () => new CasClientV3({ cas: {} }), /missing cas server url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\t valid options');
assert.doesNotThrow(
  () => new CasClientV3({
    cas: {
      serverUrl: 'https://cas-server'
    }
  }), `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);