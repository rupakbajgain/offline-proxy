'use strict';
const asyncLib = require('async');

function createSeriesDispacher(fn){
  var series = fn();
  return (ctx, err) =>
    asyncLib.series(
      series.map((fn) => {
        return (callback) => {
          fn(ctx, callback);
        };
      }),
      (e) => {
        err(e);
      }
    );
}

module.exports = { createSeriesDispacher }