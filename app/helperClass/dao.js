'use strict';

const sqlite3 = require('sqlite3');
const Promise = require('bluebird');
const debug = require('debug')('proxyapp:database')

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        debug('Could not connect to database', err);
      } else {
        debug('Connected to database:' + dbFilePath);
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          debug('Error running sql ' + sql);
          debug(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          debug('Error running sql: ' + sql);
          debug(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          debug('Error running sql: ' + sql);
          debug(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close(){
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
}

module.exports = AppDAO;
