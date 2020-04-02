'use strict';

const getDB = require('../../app/helperClass/getDatabase');
const FilenameTable = require('../../app/models/filenameTable');
const RequestsTable = require('../../app/models/requestsTable');
const SiteTable = require('../../app/models/siteTable');

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
  if (query.host === 'sites'){
    let path = query.pathname.replace(':', '@') + '.sqlite3';
    let dao = await getDB('./.db/sites'+path);
    
    // Create all necessary tables also
    dao.filenameTable = new FilenameTable(dao);
    dao.requestsTable = new RequestsTable(dao);
    dao.siteTable = new SiteTable(dao);

    await Promise.all([
      dao.filenameTable.createTable(),
      dao.requestsTable.createTable(),
      dao.siteTable.createTable(),
    ]);
    
    return resolve(dao);
  }
  next();
};

module.exports = {
  requires: ['global:actionCreators', 'global:store', 'global:getResource'],
  init,
};
