'use strict';

const types = require('../../app/types');
const debug = require('debug')('registerCallbacks');
const mime = require('mime-types');
const random = require('../../app/utils/random');
const path = require('path');
const fs = require('fs');
const liburl = require('url');

function init(){
  let action = global.actionCreators.registerFunctorsHandle(
    'getRequestSeriesHandle',
    handler,
  );
  global.store.dispatch(action);
}

const handler = (mode) => {
  if (mode >= types.SOFFLINE)
    return async(ctx, next) => {
      var host = ctx.clientToProxyRequest.headers.host;
      var url = ctx.clientToProxyRequest.url;
      var ulink = host + url;

      var dao = await global.getResource('db://sites/' + host);

      // --- --- ---
      ctx.onResponse(function(ctx, callback){
        debug('Feteching ' + ulink);
        var contentType = ctx.serverToProxyResponse.headers['content-type'];
        if (!contentType) // Try guessing
          contentType = mime.lookup(liburl.parse(url).pathname);
        var extension = mime.extension(contentType);
        var filename = random.randomFileName(extension);
        var relpath = './.file/' + filename;
        // Changing to absolute
        filename = path.resolve(process.cwd(), relpath);

        var file = fs.createWriteStream(filename);
        ctx.file = file; // Need to fix later
        dao.filenameTable.create(filename, url);
        // Continue processes
        return callback(null);
      });
      // --- --- ----
      ctx.onResponseData(function(ctx, chunk, callback) {
        if (ctx.file)
          ctx.file.write(chunk);
        return callback(null, chunk);
      });
      // --- --- ---
      ctx.onResponseEnd(function(ctx, callback) {
        if (ctx.file){
          dao.requestsTable.deleteUrl(url);
          ctx.file.close();
        }
        return callback(null);
      });
      // --- --- ---
      return next();
    };
};

module.exports = {
  requires: ['proxy-module', 'global:getResource'],
  gives: ['proxy-default-modules.3'],
  init,
};
