'use strict';

const Promise = require('bluebird');

const AppDAO = require('./dao');
const FilenameTable = require('../models/filenameTable');
const RequestsTable = require('../models/requestsTable');
const SiteTable = require('../models/siteTable');

// Store previously used
var dbs = {};

async function _getDatabase(host){
  if (dbs[host]){
    return dbs[host];
  } else {
    var dao = new AppDAO('./.db/sites/' + host + '.sqlite3');

    // Create all necessary tables also
    dao.filenameTable = new FilenameTable(dao);
    dao.requestsTable = new RequestsTable(dao);
    dao.siteTable = new SiteTable(dao);

    await Promise.all([
      dao.filenameTable.createTable(),
      dao.requestsTable.createTable(),
      dao.siteTable.createTable(),
    ]);

    return dao;
  }
};

var sem = require('semaphore')(1);

module.exports = {
  getDatabase: function(host){
    return new Promise((resolve, reject) => {
      if (dbs[host]){
        resolve(dbs[host]);
      }

      // Lock for one access only
      sem.take(() => {
        var dao = _getDatabase(host);
        dbs[host] = dao;
        resolve(dao);
        sem.leave();
      });
    });
  },
};
