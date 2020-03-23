'use strict';

const path = require('path');

var functions = {
  getDatabaseName: function(host){
    var fname = host + '.db';
    return path.resolve(process.cwd(), './.db/' + fname);
  },
};

module.exports = functions;
