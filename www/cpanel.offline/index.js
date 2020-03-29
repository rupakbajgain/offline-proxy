'use strict';

const express = require('express');
const path = require('path');

const app = express();

app.get('*', function(req, res){
  res.sendFile(path.resolve(process.cwd(),'public/index.html'));
});

module.exports = app;
