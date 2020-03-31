'use strict';

// Import libraries
const Proxy = require('./app/modifiedLibs/proxy');
const debug = require('debug')('proxyapp:index');
const chalk = require('chalk');


// Config at first
const config = require('./app/config/config');
config.store = require('./app/redux/configureStore')();
config.actionCreators = require('./app/redux/actionCreators');

// Import custom modules
const proxy_unzip_module = require('./app/proxyModules/unzip');
const proxy_errorHandler_module = require('./app/proxyModules/errorHandler');
const proxy_reqHandler_module = require('./app/proxyModules/requestHandler');

// Import sites
const staticApp = require('./www/static.offline');
const controlPanelApp = require('./www/control-panel.offline');
const cPanelApp = require('./www/cpanel.offline');
const helperApp = require('./www/helper');

// Define new proxy application
var proxy = Proxy();
proxy.use(proxy_unzip_module);
proxy.use(proxy_errorHandler_module);
proxy.use(proxy_reqHandler_module);

// Set virtual hosts
config.setVirtualApp('static.offline', staticApp);
config.setVirtualApp('control-panel.offline', controlPanelApp);
config.setVirtualApp('cpanel.offline', cPanelApp);
config.helperApp = helperApp;

// Start listening for connections
proxy.listen({port: config.PORT});
console.log(
  chalk.cyan('Server started on'),
  chalk.cyanBright(config.getProxyUrl()),
);
debug('Server started on ' + config.getProxyUrl());
