'use strict';

// Dispach middleware
// ctx = context {}
// stack = Array of middlewares []
// done = fn ,
// to call after stack
// or to tell about error

function dispacher(ctx, stack, done){
  var idx = 0;
  if (stack.length === 0){
    return done();
  }
  next();
  function next(err){
    if (err){
      return done(err);
    }
    if (stack.length === idx){
      return done('NOT HANDLED');
    }
    var fn = stack[idx++];
    fn(ctx, next);
  }
}

module.exports = dispacher;
