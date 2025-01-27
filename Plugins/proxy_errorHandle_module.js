'use strict';

const chalk = require('chalk');
const debug = require('debug')('proxyapp:onError');

const mod = {
  onError: function(ctx, err, errorKind) {
    // ctx may be null
    if (!ctx){
      // console.log(err);
      // Not interested on connect errors
      return;
    }
    var url = ctx.clientToProxyRequest ? ctx.clientToProxyRequest.url : '';
    var res = ctx.proxyToClientResponse;
    if (errorKind === 'PROXY_TO_SERVER_REQUEST_ERROR'){
      global.helperApp
        .handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
      return;
    } else {
      res.writeHead(504, 'Proxy Error');
      res.write('Error on proxy <br/><pre>');
      debug(err);
      console.log(chalk.red('Error on proxy:'), chalk.redBright(err));
      res.write(errorKind + ' on ' + url + ':', err);
      res.write('</pre>');
    }
    res.end();
  },
};

module.exports = {
  requires: ['global:proxy', 'global:helperApp'],
  gives: ['proxy-module/2'],
  init: () => {
    global.proxy.use(mod);
  },
};
