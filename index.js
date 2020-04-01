'use strict';

const loader = require('./loader');
loader('./Plugins', () => {
  global.proxy.listen({port: global.config.PORT});
});
