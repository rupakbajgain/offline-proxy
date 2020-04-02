'use strict';

const chalk = require('chalk');

function init(){
  let action = global.actionCreators.registerFunctorsHandle(
    'getRequestParallelHandle',
    handler,
  );
  global.store.dispatch(action);
}

const handler = () => (ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  var url = ctx.clientToProxyRequest.url;
  var ulink = host + url;
  console.log(chalk.green('>'), chalk.greenBright(ulink));
  next();
};

module.exports = {
  requires: ['proxy-module'],
  init,
};
