const config = require('../config/config');
const random = require('../utils/random');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

module.exports = {
	onRequest: function(ctx, callback) {
		console.log('REQUEST: http://' + ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url);
		//Check virtual app
		var vapp = config.getVirtualApp(ctx.clientToProxyRequest.headers.host);
		if(vapp){
			vapp.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
			return;
		}
		if(config.options.apponline=='true'){
			//Online so save it
			ctx.onResponse(function(ctx, callback){
				var extension = mime.extension(ctx.serverToProxyResponse.headers['content-type']);
				var filename=random.randomFileName(extension);
				filename=path.resolve(process.cwd(), config.options.offlineFilesDir + filename);//Changing to absolute
				var file=fs.createWriteStream(filename);
				ctx.file=file;
				return callback(null);
			});
			ctx.onResponseData(function(ctx, chunk, callback) {
					ctx.file.write(chunk);
					return callback(null, chunk);
			});
			ctx.onResponseEnd(function(ctx, callback) {
					ctx.file.close();
					return callback(null);
			});
			return callback();
		} else {
			config.getVirtualApp('control-panel.offline').handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
		}
	}
};