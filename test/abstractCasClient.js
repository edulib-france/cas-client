'use strict';

const assert = require('assert');
const colors = require('colors/safe');
const AbstractCasClient = require('../src/AbstractCasClient');

console.log('##### Test Abstract Cas Client');

console.log('\tno options');
assert.throws(
  () => new AbstractCasClient(), /missing or invalid options/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\tno options cas');
assert.throws(
  () => new AbstractCasClient({}), /missing or invalid options/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\tno cas server url');
assert.throws(
  () => new AbstractCasClient({ cas: {} }), /missing cas server url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\tno cas login url');
assert.throws(
  () => new AbstractCasClient({
    cas: { serverUrl: 'https://cas-server' }
  }), /missing cas login url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\tno cas validate url');
assert.throws(
  () => new AbstractCasClient({
    cas: {
      serverUrl: 'https://cas-server',
      loginUrl: '/login'
    }
  }), /missing cas validate url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\tno cas logout url');
assert.throws(
  () => new AbstractCasClient({
    cas: {
      serverUrl: 'https://cas-server',
      loginUrl: '/login',
      validateUrl: '/validate'
    }
  }), /missing cas logout url/,
  `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);
console.log('\tvalid options');
assert.doesNotThrow(
  () => new AbstractCasClient({
    cas: {
      serverUrl: 'https://cas-server',
      loginUrl: '/login',
      validateUrl: '/validate',
      logoutUrl: '/logout'
    }
  }), `\t\t${colors.red('ko')}`);
console.log(`\t\t${colors.green('ok')}`);