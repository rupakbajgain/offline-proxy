'use strict';

const debug = require('debug')('proxyapp:proxy');
const chalk = require('chalk');

module.exports = {
  requires: ['global:proxy', 'global:config'],
  init: () => {
    global.proxy.listen({port: global.config.PORT});
    console.log(
      chalk.cyan('Server started on'),
      chalk.cyanBright(global.config.getProxyUrl()),
    );
    debug('Server started on ' + global.config.getProxyUrl());
  },
};
