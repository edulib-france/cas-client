'use strict';

const assert = require('assert');
const colors = require('colors/safe');
const AbstractCasClient = require('../src/AbstractCasClient');

console.log('test abstract cas client no options');
assert.throws(
  () => new AbstractCasClient(), /missing or invalid options/,
  `\t${colors.red('ko')}`);
console.log(`\t${colors.green('ok')}`);
console.log('test abstract cas client no options cas');
assert.throws(
  () => new AbstractCasClient({}), /missing or invalid options/,
  `\t${colors.red('ko')}`);
console.log(`\t${colors.green('ok')}`);
console.log('test abstract cas client no cas server url');
assert.throws(
  () => new AbstractCasClient({ cas: {} }), /missing cas server url/,
  `\t${colors.red('ko')}`);
console.log(`\t${colors.green('ok')}`);
console.log('test abstract cas client no cas login url');
assert.throws(
  () => new AbstractCasClient({
    cas: { serverUrl: 'https://cas-server' }
  }), /missing cas login url/,
  `\t${colors.red('ko')}`);
console.log(`\t${colors.green('ok')}`);
console.log('test abstract cas client no cas validate url');
assert.throws(
  () => new AbstractCasClient({
    cas: {
      serverUrl: 'https://cas-server',
      loginUrl: '/login'
    }
  }), /missing cas validate url/,
  `\t${colors.red('ko')}`);
console.log(`\t${colors.green('ok')}`);
console.log('test abstract cas client no cas logout url');
assert.throws(
  () => new AbstractCasClient({
    cas: {
      serverUrl: 'https://cas-server',
      loginUrl: '/login',
      validateUrl: '/validate'
    }
  }), /missing cas logout url/,
  `\t${colors.red('ko')}`);
console.log(`\t${colors.green('ok')}`);
console.log('test abstract cas client valid options');
assert.doesNotThrow(
  () => new AbstractCasClient({
    debug: true,
    cas: {
      serverUrl: 'https://cas-server',
      loginUrl: '/login',
      validateUrl: '/validate',
      logoutUrl: '/logout'
    }
  }), `\t${colors.red('ko')}`);
console.log(`\t${colors.green('ok')}`);