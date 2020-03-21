'use strict';
var port = 8080;
var online = true;
var Proxy = require('http-mitm-proxy');
var proxy = Proxy();
proxy.use(require('./unzip'));
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:');

const express = require('express')
const app = express();
app.get('/', function (req, res) {
  res.send('Hello World');
})

var virtualHosts = [['test.com',app],['test2.com',app]];

const offlineApp = express();
offlineApp.get('/', function (req, res) {
  res.send('Currently running in offline mode');
})


proxy.onError(function(ctx, err, errorKind) {
  // ctx may be null
  if (!ctx) return;
  var url = ctx.clientToProxyRequest ? ctx.clientToProxyRequest.url : '';
  var res = ctx.proxyToClientResponse;
	if(errorKind=='PROXY_TO_SERVER_REQUEST_ERROR'){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write("You may be offline. <a href='https://rpks.rpks/gooffline/"+ctx.clientToProxyRequest.headers.host+url+"'>Click here for to go to offline mode</a>");
	}else{
		res.writeHead(504, 'Proxy Error');
		res.write("Error on proxy <br/><pre>");
		console.log(err);
		res.write(errorKind + ' on ' + url + ':', err)
		res.write("</pre>");
	}
	res.end();
});

proxy.onRequest(function(ctx, callback) {
  console.log('REQUEST: http://' + ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url);
  for(var i in virtualHosts){
	  if(virtualHosts[i][0]==ctx.clientToProxyRequest.headers.host){
		virtualHosts[i][1].handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
		return;
	  }
  };
  if(online){
	  if (ctx.clientToProxyRequest.headers.host == 'www.google.com'
		&& ctx.clientToProxyRequest.url.indexOf('/search') == 0) {
		ctx.onResponseData(function(ctx, chunk, callback) {
		  //console.log(console.log(ctx.serverToProxyResponse.headers));
		  chunk = new Buffer(chunk.toString().replace(/<h3.*?<\/h3>/g, '<h3>Pwned!</h3>'));
		  return callback(null, chunk);
		});
	  }
	  return callback();
  }else{
	  offlineApp.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
  }
});

proxy.listen({ port: port , app: app});
console.log('listening on ' + port);
