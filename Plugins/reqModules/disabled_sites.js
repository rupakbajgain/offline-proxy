'use strict';

const debug = require('debug')('disabledSites');

function init(){
  let action = global.actionCreators.registerFunctorsHandle(
    'getRequestSeriesHandle',
    handler,
  );
  global.store.dispatch(action);
}

const handler = () => async(ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  // get site options
  var dao2 = await global.getResource('db://root/sites');
  var disabledSites = [];
  await dao2.siteSwitchesTable.getAll()
    .then(a => {
      var i;
      for (i in a){
        if (a[i].value === 'disabled')
          disabledSites.push(a[i].site);
      }
    });

  if (disabledSites.includes(host)) {
    debug('disabled site', host);
    return next('DISABLED_SITE');
  }
  return next();
};

module.exports = {
  requires: ['proxy-module', 'global:getResource'],
  gives: ['proxy-default-modules.1'],
  init,
};
