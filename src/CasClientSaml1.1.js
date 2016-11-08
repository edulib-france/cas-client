'use strict';

const url = require('url');
const parseXML = require('xml2js').parseString;
const XMLprocessors = require('xml2js/lib/processors');
const AbstractCasClient = require('./AbstractCasClient');
const DefaultLoginUrl = '/login';
const DefaultValidateUrl = '/samlValidate';
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
      var samlResponse = result.envelope && result.envelope.body ?
        result.envelope.body.response : null;
      if (!samlResponse) {
        return cb(new Error(`invalid CAS server response, invalid format`));
      }
      var success = samlResponse.status && samlResponse.status.statuscode &&
        samlResponse.status.statuscode.$ &&
        samlResponse.status.statuscode.$.Value ?
        samlResponse.status.statuscode.$.Value.split(':')[1] : null;
      if (success !== 'Success') {
        // TODO - add error msg
        return cb(new Error(`CAS authentication failed (${success})`));
      }
      var user = samlResponse.assertion &&
        samlResponse.assertion.authenticationstatement &&
        samlResponse.assertion.authenticationstatement.subject ?
        samlResponse.assertion.authenticationstatement.subject.nameidentifier :
        null;
      if (!user) {
        return cb(new Error(`invalid CAS server response, missing user`));
      }
      var attrs = samlResponse.assertion.attributestatement ?
        samlResponse.assertion.attributestatement.attribute : [];
      var data = { user };
      if (!(attrs instanceof Array)) { attrs = [attrs]; }
      attrs.forEach((attr) => {
        var thisAttrValue;
        if (attr.attributevalue instanceof Array) {
          thisAttrValue = [];
          attr.attributevalue.forEach((v) => thisAttrValue.push(v._));
        } else { thisAttrValue = attr.attributevalue._; }
        data[attr.$.AttributeName] = thisAttrValue;
      });
      return cb(null, data);
    });
  }

}

module.exports = CasClient;