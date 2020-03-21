'use strict';

var zlib = require('zlib');

module.exports = {
  onResponse: function(ctx, callback) {
		if (ctx.serverToProxyResponse.headers['content-encoding']) {
			switch (ctx.serverToProxyResponse.headers['content-encoding']) {
				case 'br':
					ctx.addResponseFilter(zlib.createBrotliDecompress());
				break;
				// Or, just use zlib.createUnzip() to handle both of the following cases:
				case 'gzip':
					ctx.addResponseFilter(zlib.createGunzip());
				break;
				case 'deflate':
					ctx.addResponseFilter(zlib.createInflate());
				break;
				default:
					//New encoding?? or merged
					console.log(ctx.serverToProxyResponse.headers['content-encoding']);
				break;
			}
		delete ctx.serverToProxyResponse.headers['content-encoding'];
		}
    return callback();
	},
	onRequest: function(ctx, callback) {
		if(!ctx.proxyToServerRequestOptions.headers['accept-encoding']){
			ctx.proxyToServerRequestOptions.headers['accept-encoding'] = 'gzip, deflate, br';
		}
		return callback();
	}
};

