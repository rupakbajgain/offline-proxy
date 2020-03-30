'use strict';

const Promise = require('bluebird');

const AppDAO = require('./dao');
const FilenameTable = require('../models/filenameTable');
const RequestsTable = require('../models/requestsTable');
const SiteTable = require('../models/siteTable');
const SiteSwitchesTable = require('../models/siteSwitches');

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

var dbs2 = {};
async function _getMainDatabase(host){
  if (dbs2[host]){
    return dbs2[host];
  } else {
    var dao = new AppDAO('./.db/' + host + '.sqlite3');

    dao.siteSwitchesTable = new SiteSwitchesTable(dao);

    await Promise.all([
      dao.siteSwitchesTable.createTable(),
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
  getMainDatabase: function(name){
    return new Promise((resolve, reject) => {
      if (dbs2[name]){
        resolve(dbs2[name]);
      }

      // Lock for one access only
      sem.take(() => {
        var dao = _getMainDatabase(name);
        dbs2[name] = dao;
        resolve(dao);
        sem.leave();
      });
    });
  },
};
