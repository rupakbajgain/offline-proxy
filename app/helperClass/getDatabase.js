'use strict';

const AppDAO = require('./dao');

// Store previously used
var dbs = {};
async function _getDatabase(name){
  if (dbs[name]){
    return dbs[name];
  } else {
    return new AppDAO(name);
  }
}

var sem = require('semaphore')(1);
module.exports = (name) => {
  return new Promise((resolve, reject) => {
    if (dbs[name]){
      resolve(dbs[name]);
    }

    // Lock for one access only
    sem.take(() => {
      var dao = _getDatabase(name);
      dbs[name] = dao;
      resolve(dao);
      sem.leave();
    });
  });
};