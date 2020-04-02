'use strict';

const express = require('express');

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '\\templates');

app.all('*', async function(req, res) {
  // If file requestes send it
  if (req.fileToSend){
    res.sendFile(req.fileToSend);
    return;
  }

  let options = {};
  // Create failed page
  const host = req.headers.host;
  const url = req.url;
  const dao = await global.getResource('db://sites/' + host);

  function handlePage(a){
    var get_url = 'http://control-panel.offline/addRequest/';
    if (!a.userdefined)
      options.responseUrl = get_url + host + '/' + a.id;
    options.apponline = true;
    res.render('index', options);
  }

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
    });
});

module.exports = {
  requires: ['global:config', 'global:getResource'],
  gives: ['global:helperApp'],
  init: () => {
    global.helperApp = app;
  },
};
