'use strict';

const assert = require('assert');
const colors = require('colors/safe');
const CasClientV1 = require('../src/CasClientV1');

console.log('##### Test Cas Client V1');

console.log('\t no cas service url');
assert.throws(
  () => new CasClientV1({ cas: {} }), /missing cas service url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\t valid options');
assert.doesNotThrow(
  () => new CasClientV1({
    cas: {
      serviceUrl: 'https://cas-service',
      serverUrl: 'https://server'
    }
  }), `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);