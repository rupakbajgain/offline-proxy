'use strict';
// Plugin to disable the disabled sites

const getDB = require('../helperClass/getDatabase');
const debug = require('debug')('proxyapp:requesthandler');
const types = require('../types');
const config = global.config;

const disabledSites = async(ctx, next) => {
  let host = ctx.clientToProxyRequest.headers.host;
  // get site options
  let dao2 = await getDB.getMainDatabase('site');
  let disabledSites = [];
  await dao2.siteSwitchesTable.getAll()
    .then(a => {
      for (let i in a){
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

const action = config.actionCreators.registerRequestHandler(
  types.DEFAULT_APP,
  () => disabledSites,
);

module.exports.init = () => {
  config.store.dispatch(action);
};
