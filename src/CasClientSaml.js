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
      var service = url.parse(this.serverUrl);
      service.pathname = url.parse(req.originalUrl).pathname;
      service.query = {};
      for (var key in req.query) {
        if (req.query.hasOwnProperty(key) && key !== 'ticket') {
          service.query[key] = req.query[key];
        }
      }
      service = url.format(service);
      var now = new Date();
      var data = `<?xml version="1.0" encoding="utf-8"?>
      <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Header/>
        <SOAP-ENV:Body>
          <samlp:Request xmlns:samlp="urn:oasis:names:tc:SAML:1.0:protocol" MajorVersion="1"
            MinorVersion="1" RequestID="_${req.get(`host`)}.${now.getTime()}"
            IssueInstant="${now.toISOString()}">
            <samlp:AssertionArtifact>${req.query.ticket}</samlp:AssertionArtifact>
          </samlp:Request>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`;
    return {
      host: this.validateUrl.host,
      method: this.validateUrl.method,
      port: 'POST',
      pathname: this.validateUrl.pathname,
      query: { TARGET: service, ticket: '' },
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(data)
      },
      body: data
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