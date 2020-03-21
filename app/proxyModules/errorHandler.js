var config = require('../config/config')

module.exports = {
	onError: function(ctx, err, errorKind) {
		// ctx may be null
		if (!ctx){
			console.log(err);
			return;
		};
		var url = ctx.clientToProxyRequest ? ctx.clientToProxyRequest.url : '';
		var res = ctx.proxyToClientResponse;
		if(errorKind=='PROXY_TO_SERVER_REQUEST_ERROR'){
			config.getVirtualApp('control-panel.offline').handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
			return
		}else{
			res.writeHead(504, 'Proxy Error');
			res.write("Error on proxy <br/><pre>");
			console.log(err);
			res.write(errorKind + ' on ' + url + ':', err)
			res.write("</pre>");
		}
		res.end();
	}
};