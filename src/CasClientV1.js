'use strict';

const url = require('url');
const AbstractCasClient = require('./AbstractCasClient');
const DefaultLoginUrl = '/login';
const DefaultValidateUrl = '/validate';
const DefaultLogoutUrl = '/logout';

class CasClient extends AbstractCasClient {

  constructor(options) {
    options = options || {};
    options.cas = options.cas || {};
    options.cas.loginUrl = options.cas.loginUrl || DefaultLoginUrl;
    options.cas.validateUrl = options.cas.validateUrl || DefaultValidateUrl;
    options.cas.logoutUrl = options.cas.logoutUrl || DefaultLogoutUrl;
    super(options);
  }

  _buildValidateReqOptions(req) {
    var originalUrl = url.parse(req.originalUrl);
    var service = this.serviceUrl ||
      `${req.get('host')}${originalUrl.pathname}`;
    return {
      host: this.validateUrl.host,
      method: this.validateUrl.method,
      port: 'GET',
      pathname: this.validateUrl.pathname,
      query: { service, ticket: req.query.ticket }
    };
  }

  _parseCasResponse(body, cb) {
    if (!body) { return cb(new Error('invalid CAS server response')); }
    var lines = body.split('\n');
    if (lines[0] === 'yes' && lines.length >= 2) {
      return cb(null, lines[1]);
    }
    if (lines[0] === 'no') {
      if (lines.length >= 2) {
        return cb(new Error(`CAS authentication failed, ${lines[1]}`));
      }
      return cb(new Error(`CAS authentication failed`));
    }
    return cb(new Error('Response from CAS server was bad.'));
  }

}

module.exports = CasClient;