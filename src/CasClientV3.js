'use strict';

const url = require('url');
const parseXML = require('xml2js').parseString;
const XMLprocessors = require('xml2js/lib/processors');
const AbstractCasClient = require('./AbstractCasClient');
const DefaultLoginUrl = '/login';
const DefaultValidateUrl = '/p3/serviceValidate';
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
    return {
      method: 'GET',
      url: url.format({
        host: this.validateUrl.host,
        pathname: this.validateUrl.pathname,
        protocol: this.validateUrl.protocol,
        query: {
          service: this._buildService(req),
          ticket: req.query.ticket
        }
      })
    };
  }

  _parseCasResponse(body, cb) {
    parseXML(body, {
      trim: true,
      normalize: true,
      explicitArray: false,
      tagNameProcessors: [XMLprocessors.normalize, XMLprocessors.stripPrefix]
    }, (err, result) => {
      if (err) { return cb(new Error(`invalid CAS server response, ${err}`)); }
      if (!result) {
        return cb(new Error(`invalid CAS server response, empty result`));
      }
      var res = result.serviceresponse;
      var failure = res ? res.authenticationfailure : null;
      var success = res ? res.authenticationsuccess : null;
      if (!failure && !success) {
        return cb(new Error(`invalid CAS server response, invalid format`));
      }
      if (failure) {
        return cb(new Error(
          `CAS authentication failed (${failure.$.code}), ${failure._}`));
      }
      var data = {};
      for (var prop in success) {
        if (success.hasOwnProperty(prop)) {
          data[prop] = success[prop];
        }
      }
      return cb(null, data);
    });
  }

}

module.exports = CasClient;