const express = require('express')

var config = require('../../app/config/config');

const app = express();

app.get('/switches/:key/:value/', function(req,res){
	config.options[req.params.key] = req.params.value;
	res.end();//req.params.key+'='+req.params.value);
});

app.all('*', function (req, res) {
	if(config.options.apponline=='true'){
	res.send('<center>You are running in online mode<br>\
	<img src="http://static.offline/doug.jpg"><br/>\
	but there is problem in connection<br/>\
	<a href="http://control-panal.offline/switches/apponline/false">Click here to go offline.</a>\
	</center>');
	}else{
	res.send('<center>You are running in offline mode<br>\
	<img src="http://static.offline/doug.jpg"><br/>\
	but no saved datas available<br/>\
	<a href="http://control-panal.offline/switches/apponline/true">Click here to go online.</a>\
	</center>');
	}
});

module.exports = app;