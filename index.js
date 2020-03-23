'use strict';

// Import libraries
const Proxy = require('http-mitm-proxy');

// Import custom modules
const proxy_unzip_module = require('./app/proxyModules/unzip');
const proxy_errorHandler_module = require('./app/proxyModules/errorHandler');
const proxy_reqHandler_module = require('./app/proxyModules/requestHandler');
const config = require('./app/config/config');

// Import sites
const staticApp = require('./www/static.offline');
const controlPanelApp = require('./www/control-panel.offline');

// Define new proxy application
var proxy = Proxy();
proxy.use(proxy_unzip_module);
proxy.use(proxy_errorHandler_module);
proxy.use(proxy_reqHandler_module);

// Set virtual hosts
config.setVirtualApp('static.offline', staticApp);
config.setVirtualApp('control-panel.offline', controlPanelApp);

// Start listening for connections
proxy.listen({port: config.PORT});
console.log('Sever started on ' + config.getProxyUrl());
