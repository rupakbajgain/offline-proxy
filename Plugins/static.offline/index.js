'use strict';

const express = require('express');

const app = express();
app.use(express.static('./public'));

function init(){
  let action = global.actionCreators.registerFunctorsHandle(
    'getRequestSeriesHandle',
    handler,
  );
  global.store.dispatch(action);
}

const handler = () => async(ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  // Check if static.offline is requested
  if (host === 'static.offline'){
    app.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
    return;
  }
  return next();
};

module.exports = {
  gives: ['static.offline'],
  init,
};
