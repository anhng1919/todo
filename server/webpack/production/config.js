const path = require('path');

const webpackMerge = require('webpack-merge');
const webpackNodeExternals = require('webpack-node-externals');


const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const common = require('../common/config.js');

module.exports = webpackMerge.smart(common, {
  entry: [path.join(__dirname, '../../src/index.js')],
  externals: [
    webpackNodeExternals({
      whitelist: ['webpack/hot/poll?1000']
    })
  ],
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin()
  ]
});