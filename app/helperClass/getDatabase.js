'use strict';

const AppDAO = require('./dao');
const FilenameTable = require('../models/filenameTable');

// Store previously used
var dbs = {};

module.exports = {
  getDatabase: function(host){
    // Load database
    if (dbs[host]){
      return dbs[host];
    } else {
      var dao = new AppDAO('./.db/' + host + '.sqlite3');
      // Create all necessary tables also
      var filenameTable = new FilenameTable(dao);
      filenameTable.createTable();
      dao.filenameTable = filenameTable;

      dbs[host] = dao;
      return dao;
    }
  },
};
