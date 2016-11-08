'use strict';


const LEVELS = {
  silent: 0,
  error: 10,
  warn: 20,
  info: 30,
  debug: 40
};

const defaultLogger = {
  error: console.error,
  warn: console.log,
  info: console.log,
  debug: console.log
};

class Logger {

  constructor(logger) {
    this.logger = logger || defaultLogger;
    this.lvl = LEVELS.error;
  }

  error() {
    if (this.lvl >= LEVELS.error) {
      this.logger.error.apply(this.logger, arguments);
    }
  }

  warn() {
    if (this.lvl >= LEVELS.warn) {
      this.logger.warn.apply(this.logger, arguments);
    }
  }

  info() {
    if (this.lvl >= LEVELS.info) {
      this.logger.info.apply(this.logger, arguments);
    }
  }

  debug() {
    if (this.lvl >= LEVELS.debug) {
      this.logger.debug.apply(this.logger, arguments);
    }
  }

  setLvl(lvl) { this.lvl = LEVELS[lvl] || this.lvl; }

}

module.exports = Logger;