'use strict';

const types = require('../../app/types');
const debug = require('debug')('sendSaved');

function init(){
  let action = global.actionCreators.registerFunctorsHandle(
    'getRequestSeriesHandle',
    handler,
  );
  global.store.dispatch(action);
}

const handler = (mode) => {
  if (mode <= types.SOFFLINE)
    return async(ctx, next) => {
      var host = ctx.clientToProxyRequest.headers.host;
      var url = ctx.clientToProxyRequest.url;
      var ulink = host + url;// -----

      var dao = await global.getResource('db://sites/' + host);
      // Now try to send saved file
      await dao.filenameTable.getFilename(url)
        .then((a) => {
          if (a.length){
            var randomFile = Math.floor(Math.random() * a.length);
            var filename = a[randomFile].file; // Send one file randomly
            var uinfo = '';
            if (a.length > 1)
              uinfo = '[' + randomFile + ']';
            debug('Sending saved file:' + ulink + uinfo);
            ctx.clientToProxyRequest.fileToSend = filename;
            global.helperApp
              .handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
          }
        });

      if (ctx.clientToProxyRequest.fileToSend)
        return;

      return next();
    };
};

module.exports = {
  requires: ['proxy-module', 'global:getResource', 'global:helperApp'],
  gives: ['proxy-default-modules.2'],
  init,
};
