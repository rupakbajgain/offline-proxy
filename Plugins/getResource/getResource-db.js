'use strict';

const getDB = require('../../app/helperClass/getDatabase');
const SiteSwitchesTable = require('../../app/models/siteSwitches');

function init(){
  let action = global.actionCreators.registerFunctorsHandle(
    'getResourceHandle',
    databaseHandler,
  );
  global.store.dispatch(action);
}

async function databaseHandler({query, resolve}, next){
  if (query.protocol !== 'db:')
    return next();
  if (query.host === 'root' && query.pathname == '/site'){
    var dao = await getDB('./.db/site.sqlite3');
    
    dao.siteSwitchesTable = new SiteSwitchesTable(dao);
    await Promise.all([
      dao.siteSwitchesTable.createTable(),
    ]);
    
    return resolve(dao);
  }
  next();
};

module.exports = {
  requires: ['global:actionCreators', 'global:store', 'global:getResource'],
  init,
};
