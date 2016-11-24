'use strict';

const url = require('url');
const request = require('request');
const Logger = require('./Logger');
const urljoin = require('url-join');
const DefaultSessionName = 'cas';

class AbstractCasClient {

  constructor(options) {
    if (!options || !options.cas) {
      throw new Error('missing or invalid options');
    }
    if (!options.cas.serviceUrl) { throw new Error('missing cas service url'); }
    if (!options.cas.serverUrl) { throw new Error('missing cas server url'); }
    if (!options.cas.loginUrl) { throw new Error('missing cas login url'); }
    if (!options.cas.validateUrl) {
      throw new Error('missing cas validate url');
    }
    if (!options.cas.logoutUrl) { throw new Error('missing cas logout url'); }
    this.options = options;
    this.logger = new Logger(options.logger);
    if (options.debug === true) { this.logger.setLvl('debug'); }
    this.cas = {
      serviceUrl: options.cas.serviceUrl,
      serverUrl: options.cas.serverUrl,
      loginUrl: options.cas.loginUrl.startsWith('/') ?
        options.cas.loginUrl : `/${options.cas.loginUrl}`,
      validateUrl: options.cas.validateUrl.startsWith('/') ?
        options.cas.validateUrl : `/${options.cas.validateUrl}`,
      logoutUrl: options.cas.logoutUrl.startsWith('/') ?
        options.cas.logoutUrl : `/${options.cas.logoutUrl}`,
      renew: options.cas.renew === true
    };
    this.sessionName = options.sessionName || DefaultSessionName;
    this.serviceUrl = this.cas.serviceUrl;
    this.serverUrl = this.cas.serverUrl;
    this.loginUrl = urljoin(this.cas.serverUrl, this.cas.loginUrl);
    this.validateUrl =
      url.parse(urljoin(this.cas.serverUrl, this.cas.validateUrl));
    this.logoutUrl = urljoin(this.cas.serverUrl, this.cas.logoutUrl);
    this.logger.debug({
      cas: this.cas,
      sessionName: this.sessionName,
      loginUrl: this.loginUrl,
      validateUrl: this.validateUrl,
      logoutUrl: this.logoutUrl
    });
  }

  login(req, res, next) {
    if (req.session && req.session[this.sessionName]) { return next(); }
    if (req.query && req.query.ticket) { return next(); }
    res.redirect(this.loginUrl);
  }

  validate(req, res, next) {
    if (req.session && req.session[this.sessionName]) { next(); }
    if (!req.query || !req.query.ticket) {
      next(new Error('missing cas ticket'));
    }
    var options = this._buildValidateReqOptions(req);
    request(options, (err, res, body) => {
      if (err) { return next(err); }
      if (res.statusCode !== 200) {
        return next(new Error(
          `cas ticket validation failed, http error code ${res.statusCode}`));
      }
      this._parseCasResponse(body, (err, data) => {
        if (err) { return next(err); }
        req.session[this.sessionName] = data;
        next();
      });
    });
  }

  logout(req, res) {
    if (req.session && req.session[this.sessionName]) {
      delete req.session[this.sessionName];
    }
    res.redirect(this.logoutUrl);
  }

  _buildValidateReqOptions() {
    throw new Error('missing build validate request options');
  }

  _parseCasResponse() {
    throw new Error('missing parse cas response method');
  }

}

module.exports = AbstractCasClient;