'use strict';

var path = require('path');

var BUILD_DIR = path.resolve(__dirname, './public');

module.exports = {
  entry: './www/cpanel.offline/src/index.jsx',
  mode: 'development',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
