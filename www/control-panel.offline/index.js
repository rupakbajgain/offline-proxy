'use strict';

const express = require('express');
const fs = require('fs');

var config = require('../../app/config/config');
const getDB = require('../../app/helperClass/getDatabase');

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '\\templates');

app.get('/', function(req, res){
  var options = {};
  options.config = config;
  options.serverPath = process.cwd();
  options.vhosts = [];
  var i;
  for (i in config.virtualHosts){
    options.vhosts.push(i);
  }
  fs.readdir('./.db/sites', (err, files) => {
    if (err){
      console.error(err);
    } else {
      options.sites = files;
    }
    res.render('index', options);
  });
});

app.get('/switches/:key/:value/', function(req, res){
  config.options[req.params.key] = req.params.value;
  var options = {};
  options[req.params.key] = req.params.value;
  res.redirect('/');
});

app.get('/requests', async function(req, res){
  var options = {};
  options.host = req.query.host;
  var dao = await getDB.getDatabase(options.host.replace(':', '@'));
  dao.requestsTable.getAll()
    .then((a) => {
      options.requests = a;
      res.render('requests', options);
    });
});

app.get('/getAllLinks', async function(req, res){
  var options = {};
  options.host = req.query.host;
  var dao = await getDB.getDatabase(options.host.replace(':', '@'));
  dao.filenameTable.getAll()
    .then((a) => {
      options.links = a;
      res.render('getAllLinks', options);
    });
});

app.get('/addRequest/:host/:id/', async function(req, res){
  var dao = await getDB.getDatabase(req.params.host.replace(':', '@'));
  dao.requestsTable.setUserRequest(req.params.id)
    .then((a) => dao.requestsTable.getById(a.id))
    .then((a) => {
      var options = {};
      if (a){
        options.url = a.url;
        options.host = req.params.host;
        options.ulink = 'http://' + options.host + options.url;
      }
      res.render('addRequest', options);
    });
});

module.exports = app;
