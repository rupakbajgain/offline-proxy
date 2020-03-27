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

    var promises = [];
    // Create all necessary tables also
    dao.filenameTable = new FilenameTable(dao);
    dao.requestsTable = new RequestsTable(dao);
    dao.siteTable = new SiteTable(dao);

    promises.push(dao.filenameTable.createTable());
    promises.push(dao.requestsTable.createTable());
    promises.push(dao.siteTable.createTable());

    // Wait for promises to complete
    var i;
    for (i in promises){
      await promises[i];
    };

    dbs[host] = dao;
    return dao;
  }
};

module.exports = {
  getDatabase: function(host){
    return new Promise((resolve, reject) => {
      // Lock for one access only
      var sem = require('semaphore')(1);
      sem.take(() => {
        var dao = _getDatabase(host);
        sem.leave();
        resolve(dao);
      });
    });
  },
};
