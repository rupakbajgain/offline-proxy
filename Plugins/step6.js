'use strict';

function _init(){
  global.getResource('db://root/site')
  .catch(e=>console.log(e));
  
  global.getResource('db://root/site')
  .catch(e=>console.log(e));
  
  global.getResource('db://sites/localhost:8000')
  .catch(e=>console.log(e));
  
  global.getResource('db://sites/test.com')
  .catch(e=>console.log(e));
};

module.exports.init = _init;