var config = require('../config/config')

module.exports = {
	onRequest: function(ctx, callback) {
		console.log('REQUEST: http://' + ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url);
		//Check virtual app
		var vapp = config.getVirtualApp(ctx.clientToProxyRequest.headers.host);
		if(vapp){
			vapp.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
			return;
		}
		if(config.apponline){
			//Online
			if (ctx.clientToProxyRequest.headers.host == 'www.google.com'
			&& ctx.clientToProxyRequest.url.indexOf('/search') == 0) {
				ctx.onResponseData(function(ctx, chunk, callback) {
					chunk = new Buffer(chunk.toString().replace(/<h3.*?<\/h3>/g, '<h3>Pwned!</h3>'));
					return callback(null, chunk);
				});
			}
			return callback();
		} else {
			config.getVirtualApp('control-panel.offline').handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
		}
	}
};