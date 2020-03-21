const express = require('express')

const app = express();
app.get('/', function (req, res) {
	res.send('You are running in offline mode');
});

module.exports = app;