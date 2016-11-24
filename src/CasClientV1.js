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
    var service = url.parse(this.serviceUrl);
    service.pathname = url.parse(req.originalUrl).pathname;
    service.query = {};
    for (var key in req.query) {
      if (req.query.hasOwnProperty(key) && key !== 'ticket') {
        service.query[key] = req.query[key];
      }
    }
    service = url.format(service);
    return {
      method: 'GET',
      url : url.format({ 
        host: this.validateUrl.host,
        pathname: this.validateUrl.pathname,
        protocol: this.validateUrl.protocol,
        query: { service, ticket: req.query.ticket }
      })
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