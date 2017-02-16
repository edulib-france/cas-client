'use strict';

const url = require('url');
const request = require('request');
const Logger = require('./Logger');
const urljoin = require('url-join');
const DefaultSessionName = 'cas';

class AbstractCasClient {

  constructor(options) {
    this.__validate(options);
    this.options = options;
    this.logger = new Logger(options.logger);
    if (options.debug === true) {
      this.logger.setLvl('debug');
    }
    this.__setupCAS();
    this.sessionName = options.sessionName || DefaultSessionName;
    this.serviceUrl = this.cas.serviceUrl;
    this.serverUrl = this.cas.serverUrl;
    this.loginUrl = url.parse(urljoin(this.cas.serverUrl, this.cas.loginUrl));
    this.validateUrl =
      url.parse(urljoin(this.cas.serverUrl, this.cas.validateUrl));
    this.proxyValidateUrl =
      url.parse(urljoin(this.cas.serverUrl, this.cas.proxyValidateUrl));
    this.logoutUrl = urljoin(this.cas.serverUrl, this.cas.logoutUrl);
    this.renew = this.cas.renew;
    this.proxy = this.cas.proxy;
  }

  __validate(options) {
    if (!options || !options.cas) {
      throw new Error('missing or invalid options');
    }
    if (!options.cas.serviceUrl) {
      throw new Error('missing cas service url');
    }
    if (!options.cas.serverUrl) {
      throw new Error('missing cas server url');
    }
    if (!options.cas.loginUrl) {
      throw new Error('missing cas login url');
    }
    if (!options.cas.validateUrl) {
      throw new Error('missing cas validate url');
    }
    if (!options.cas.logoutUrl) {
      throw new Error('missing cas logout url');
    }
  }

  __setupCAS() {
    this.cas = {
      serviceUrl: this.options.cas.serviceUrl,
      serverUrl: this.options.cas.serverUrl,
      loginUrl: this.options.cas.loginUrl.startsWith('/') ?
        this.options.cas.loginUrl : `/${this.options.cas.loginUrl}`,
      validateUrl: this.options.cas.validateUrl.startsWith('/') ?
        this.options.cas.validateUrl : `/${this.options.cas.validateUrl}`,
      proxyValidateUrl: this.options.cas.proxyValidateUrl &&
        this.options.cas.proxyValidateUrl.startsWith('/') ?
        this.options.cas.proxyValidateUrl :
        `/${this.options.cas.proxyValidateUrl}`,
      logoutUrl: this.options.cas.logoutUrl.startsWith('/') ?
        this.options.cas.logoutUrl : `/${this.options.cas.logoutUrl}`,
      renew: this.options.cas.renew === true,
      proxy: this.options.cas.proxy === true,
    };
  }

  login(req, res, next) {
    if (req.session && req.session[this.sessionName]) {
      return next();
    }
    if (req.query && req.query.ticket) {
      return next();
    }
    var redirect = url.format({
      host: this.loginUrl.host,
      pathname: this.loginUrl.pathname,
      protocol: this.loginUrl.protocol,
      query: {
        service: this._buildService(req)
      }
    });
    this.logger.debug('login redirect', redirect);
    res.redirect(redirect);
  }

  validate(req, res, next) {
    if (req.session && req.session[this.sessionName]) {
      next();
    }
    if (!req.query || !req.query.ticket) {
      next(new Error('missing cas ticket'));
    }
    var options = this._buildValidateReqOptions(req);
    this.logger.debug('validate options', options);
    request(options, (err, res, body) => {
      if (err) {
        return next(err);
      }
      if (res.statusCode !== 200) {
        return next(new Error(
          `cas ticket validation failed, http error code ${res.statusCode}`));
      }
      this._parseCasResponse(body, (err, data) => {
        if (err) {
          return next(err);
        }
        req.session[this.sessionName] = data;
        next();
      });
    });
  }

  logout(req, res) {
    if (req.session && req.session[this.sessionName]) {
      delete req.session[this.sessionName];
    }
    this.logger.debug('logout redirect', this.logoutUrl);
    res.redirect(this.logoutUrl);
  }

  _buildService(req) {
    var service = url.parse(this.serviceUrl);
    service.pathname = url.parse(req.originalUrl).pathname;
    service.query = {};
    for (var key in req.query) {
      if (req.query.hasOwnProperty(key) && key !== 'ticket') {
        service.query[key] = req.query[key];
      }
    }
    return url.format(service);
  }

  _buildValidateReqOptions() {
    throw new Error('missing build validate request options');
  }

  _parseCasResponse() {
    throw new Error('missing parse cas response method');
  }

}

module.exports = AbstractCasClient;