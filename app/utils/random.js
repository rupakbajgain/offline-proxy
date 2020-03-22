const path = require('path');
const fs = require('fs');
const config = require('../config/config');

var functions = {
	randomSerialNumber : function () {
		// generate random 16 bytes hex string
		var sn = '';
		for (var i=0; i<4; i++) {
			sn += ('00000000' + Math.floor(Math.random()*Math.pow(256, 4)).toString(16)).slice(-8);
		}
		return sn;
	},
	randomFileName : function (extension) {
		var file_not_ok = true;
		if(!extension)extension='dat';
		var filename='';
		while(file_not_ok ){
			filename=functions.randomSerialNumber() +'.'+extension;
			file_not_ok = fs.existsSync(path.resolve(process.cwd(), config.options.offlineFilesDir + filename));//Making files relative
		}
		return filename;
	},
}

module.exports = functions;