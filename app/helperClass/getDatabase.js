'use strict';

const AppDAO = require('./dao');
const FilenameTable = require('../models/filenameTable');
const RequestsTable = require('../models/requestsTable');
const SiteTable = require('../models/siteTable');

// Store previously used
var dbs = {};

module.exports = {
  getDatabase: async function(host){
    // Load database
    if (dbs[host]){
      return dbs[host];
    } else {
      var promises = [];
      var dao = new AppDAO('./.db/sites/' + host + '.sqlite3');
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
  },
};
