'use strict';

const express = require('express');

// const config = global.config;
// const getDB = require('../../app/helperClass/getDatabase');
// Feature to be provided by addon

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '\\templates');

app.all('*', async function(req, res) {
  // If file requestes send it
  if (req.fileToSend){
    res.sendFile(req.fileToSend);
    return;
  }

  var options = {};
  // Create failed page
  //  var host = req.headers.host;
  //  var url = req.url;
  //  var dao = await getDB.getDatabase(host.replace(':', '@'));

  function handlePage(a){
    //    var get_url = 'http://control-panel.offline/addRequest/';
    //    if (!a.userdefined)
    //      options.responseUrl = get_url + host + '/' + a.id;
    //    options.apponline = config.options.apponline;
    res.render('index', options);
  }
  handlePage(/* a*/);
/*
  dao.requestsTable.getByUrl(url)
    .then((a) => {
      if (a){
        handlePage(a);
      } else {
        dao.requestsTable.create(url, false)
          .then((a) => {
            handlePage(a);
          });
      }
    });*/
});

module.exports = {
  requires: ['global:config'],
  gives: ['global:helperApp'],
  init: () => {
    global.helperApp = app;
  },
};