//Import libraries
var Proxy = require('http-mitm-proxy');
const express = require('express');

//Import custom modules
var proxy_unzip_module = require('./app/proxyModules/unzip');
var proxy_errorHandler_module = require('./app/proxyModules/errorHandler');
var proxy_requestHandler_module = require('./app/proxyModules/requestHandler');
var config = require('./app/config/config');

//Import sites
var staticApp = require('./www/static.offline');
var controlPanelApp = require('./www/control-panel.offline');

//Define new proxy application
var proxy = Proxy();
proxy.use(proxy_unzip_module);
proxy.use(proxy_errorHandler_module);
proxy.use(proxy_requestHandler_module);

//Set virtual hosts
config.setVirtualApp('static.offline', staticApp);
config.setVirtualApp('control-panel.offline', controlPanelApp);

//Start listening for connections
proxy.listen({port: config.PORT});
console.log("Sever started on " + config.getProxyUrl());
