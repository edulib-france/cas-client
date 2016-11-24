'use strict';

module.exports.CasClientV1 = require('./src/CasClientV1');
module.exports.CasClientV2 = require('./src/CasClientV2');
module.exports.CasClientV3 = require('./src/CasClientV3');
module.exports.CasClientSaml = require('./src/CasClientSaml');

module.exports.build = function(version, options) {
  if (version === 1 || version === '1.0') {
    return new module.exports.CasClientV1(options);
  }
  if (version === 2 || version === '2.0') {
    return new module.exports.CasClientV2(options);
  }
  if (version === 3 || version === '3.0') {
    return new module.exports.CasClientV3(options);
  }
  if (version === 'saml') {
    return new module.exports.CasClientSaml(options);
  }
  throw new Error(`unknown CAS client version [${version}]`);
};