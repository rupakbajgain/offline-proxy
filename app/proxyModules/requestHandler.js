'use strict';

const config = require('../config/config');
const random = require('../utils/random');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

const AppDAO = require('../helperClass/dao');
const FilenameTable = require('../models/filenameTable');
/*
function sendFileToRes(movie,req, res){
fs.stat(movie, function (err, stats) {
var range = req.headers.range;
if (!range) {
return res.sendStatus(416);
}
//Chunk logic here
var positions = range.replace(/bytes=/, "").split("-");
var start = parseInt(positions[0], 10);
var total = stats.size;
var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
var chunksize = (end - start) + 1;
res.writeHead(206, {
'Transfer-Encoding': 'chunked',
"Content-Range": "bytes " + start + "-" + end + "/" + total,
"Accept-Ranges": "bytes",
"Content-Length": chunksize,
"Content-Type": mime.lookup(req.params.filename)
});
var stream = fs.createReadStream(movie, { start: start, end: end, autoClose: true
})
.on('end', function () {
console.log('Stream Done');
})
.on("error", function (err) {
res.end(err);

})
.pipe(res, { end: true });
});
};
*/

var dbs = {};

module.exports = {
  onRequest: function(ctx, callback) {
    var host = ctx.clientToProxyRequest.headers.host;
    var url = ctx.clientToProxyRequest.url;
    var ulink = host + url;
    console.log('REQUEST: http://' + ulink);
    // Check virtual app
    var vapp = config.getVirtualApp(ctx.clientToProxyRequest.headers.host);
    if (vapp){
      vapp.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
      return;
    }
    if (config.options.apponline === 'true'){
      // Online so save it
      ctx.onResponse(function(ctx, callback){
        var contentType = ctx.serverToProxyResponse.headers['content-type'];
        var extension = mime.extension(contentType);
        var filename = random.randomFileName(extension);
        var relpath = config.options.offlineFilesDir + filename;
        // Changing to absolute
        filename = path.resolve(process.cwd(), relpath);
        
        var file = fs.createWriteStream(filename);
        ctx.file = file; // Need to fix later
        
        if(dbs[host]){
          var dao = dbs[host];
        }else{
          var dao = new AppDAO('./.db/'+host+'.sqlite3');
        }
        
        var filenameTable = new FilenameTable(dao);
filenameTable.createTable()
  .then(()=>filenameTable.getFilename(url))
  .then((a)=>{
      //if(a.length){
      //  return dao.close();
      //}else{
        return filenameTable.create(filename,url);    
      //}
  });
        
        return callback(null);
      });
      ctx.onResponseData(function(ctx, chunk, callback) {
        if(ctx.file)
          ctx.file.write(chunk);
        return callback(null, chunk);
      });
      ctx.onResponseEnd(function(ctx, callback) {
        if(ctx.file)
          ctx.file.close();
        return callback(null);
      });
      return callback();
    } else {
        var dao = new AppDAO('./.db/'+host+'.sqlite3');
        var filenameTable = new FilenameTable(dao);

filenameTable.createTable()
  .then(()=>filenameTable.getFilename(url))
  .then((a)=>{
    console.log({url, a});
    if(a.length){
      var filename = a[a.length-1].file;
      console.log(filename);//Send first
      ctx.clientToProxyRequest.fileToSend = filename;
    }
      //Send file back
      var app = config.getVirtualApp('control-panel.offline');
      app.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
    return dao.close();
  })
    }
  },
};
