const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const merge = require('webpack-merge');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const base = require('./webpack.base.config');
const isProduction = process.env.NODE_ENV === 'production';
const srcPath = path.resolve(__dirname, 'src');

module.exports = merge(base, {
  entry: {
    app: path.join(srcPath, 'client-entry.js')
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    publicPath: '/',
    filename: isProduction ? '[name].[hash].js' : '[name].js',
    sourceMapFilename: isProduction ? '[name].[hash].js.map' : '[name].js.map',
  },
  resolve: {
    extensions: ['.js'],
  },

  plugins: (isProduction ?
    [
      new VueLoaderPlugin(),
      new VueSSRClientPlugin(),
    ]
    :
    [
      new VueLoaderPlugin(),
      new VueSSRClientPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    ]
  )
});
