'use strict';

const getDB = require('../../../app/helperClass/getDatabase');
const fs = require('fs');

async function deleteHost(host){
  var dao = await getDB.getDatabase(host.replace(':', '@'));
  dao.requestsTable.deleteAll();
  var files = await dao.filenameTable.getAll();
  var i;
  for (i in files){
    fs.unlink(files[i].file, () => {});
    console.log(files[i].file);
  }
  dao.filenameTable.deleteAll();
}

module.exports = {
  deleteHost,
  disableHost: async(host) => {
    deleteHost(host);
    var dao = await getDB.getMainDatabase('site');
    dao.siteSwitchesTable.create(host, 'disabled');
  },
};
