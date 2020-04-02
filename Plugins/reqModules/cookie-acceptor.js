'use strict';

const debugCookie = require('debug')('cookieAcceptor');

function init(){
  let action = global.actionCreators.registerFunctorsHandle(
    'getRequestParallelHandle',
    handler,
  );
  global.store.dispatch(action);
}

const handler = () => async(ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  var dao = await global.getResource('db://sites/' + host);

  // If request has cookie update the saved cookie
  var cookie = ctx.clientToProxyRequest.headers.cookie;
  if (cookie){
    dao.siteTable.getValue('cookie')
      .then((a) => {
        if (a){
          if (a.value !== cookie){
            debugCookie('Updating cookie:' + host);
            dao.siteTable.update('cookie', cookie);
          }
        } else {
          debugCookie('Set cookie:' + host);
          dao.siteTable.create('cookie', cookie);
        }
      });
  }
  next();
};

module.exports = {
  requires: ['proxy-module', 'global:getResource'],
  init,
};
