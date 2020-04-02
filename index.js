'use strict';

const chalk = require('chalk');
const debug = require('debug')('proxyapp:index');
const loader = require('./loader');

// To show new added objects in debug
var initialObjects = [];
for (let i in global)
  initialObjects.push(i)

loader('./Plugins', () => {
  debug(chalk.blueBright('global'), ' {');
  for (let i in global)
    if (!initialObjects.includes(i))
      debug('\t' ,chalk.green(i), ',');
  debug('}')
});
