'use strict';
const asyncLib = require('async');

function createSeriesDispacher(arr){
  var series = arr;
  return (ctx, err) =>
    asyncLib.series(
      series.map((fn) => {
        return (callback) => {
          fn(ctx, callback);
        };
      }),
      (e) => {
        err(e);
      },
    );
}

function createParallelDispacher(arr){
  var series = arr;
  return (ctx, err) =>
    asyncLib.parallel(
      series.map((fn) => {
        return (callback) => {
          fn(ctx, callback);
        };
      }),
      (e) => {
        err(e);
      },
    );
}

module.exports = { createSeriesDispacher, createParallelDispacher };
