var webpack = require("webpack");
var path = require("path");
var WebpackCleanupPlugin = require("webpack-cleanup-plugin");

function isExternal(module) {
  var userRequest = module.userRequest;

  if (typeof userRequest !== 'string') {
    return false;
  }

  return userRequest.indexOf('bower_components') >= 0 ||
         userRequest.indexOf('node_modules') >= 0 ||
         userRequest.indexOf('libraries') >= 0;
}

module.exports = {
  context: __dirname + '/src',
  entry: {
    'application': './index',
  },
  output: {
    // filename: '[name].[chunkhash].js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
     name: 'vendors',
     minChunks: function(module) {
       return isExternal(module);
     }
    })
    // new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query:{
          presets: ['es2015']
        }
      }
    ]
  }
};
