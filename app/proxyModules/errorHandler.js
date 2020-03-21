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
			res.writeHead(200, {"Content-Type": "text/html"});
			res.write("You may be offline. <a href='https://control-panal.offline/switches/appoffline/true'>Click here for to go to offline mode</a>");
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