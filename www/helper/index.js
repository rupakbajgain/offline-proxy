'use strict';

const express = require('express');

var config = require('../../app/config/config');
const getDB = require('../../app/helperClass/getDatabase');

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '\\templates');

app.all('*', async function(req, res) {
  // If file requestes send it
  if (req.fileToSend){
    res.sendFile(req.fileToSend);
    return;
  }

  // Create failed page
  var host = req.headers.host;
  var url = req.url;
  var dao = await getDB.getDatabase(host.replace(':', '@'));
  dao.requestsTable.create(url, false)
    .then((a) => {
      var options = {};
      var get_url = 'http://control-panel.offline/addRequest/';
      options.responseUrl = get_url + host + '/' + a.id;
      options.apponline = config.options.apponline;
      res.render('index', options);
    });
});

module.exports = app;
