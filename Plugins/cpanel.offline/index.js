'use strict';

const express = require('express');
const path = require('path');

const app = express();
app.get('*', function(req, res){
  res.sendFile(path.resolve(process.cwd(), 'public/index.html'));
});

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
  if (host === 'cpanel.offline'){
    app.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
    return;
  }
  return next();
};

module.exports = {
  gives: ['cpanel.offline'],
  init,
};
