var exampleApp = require('../../www/example.offline');
var controlPanelApp = require('../../www/control-panel.offline');

var config = {
	URL: 'http://127.0.0.1',
	apponline: false,
	PORT: process.env.PORT || 8080,
	
	getProxyUrl: function(){
		return this.URL+ ':' + this.PORT;
	},
	
	virtualHosts :{
		'example.offline' : exampleApp,
		'control-panel.offline' : controlPanelApp, 
	},
	
	getVirtualApp: function(weblink){
		return config.virtualHosts[weblink];//Direct subtitution for now
	}
}

module.exports = config