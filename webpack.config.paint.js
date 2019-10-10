const path = require('path');

module.exports = {
  mode: 'development',
  entry: './examples/paint/index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: "ts-loader"
    }]
  },
  resolve: {
    extensions: [
      '.ts'
    ]
  },
  devServer: {
    port: 3000,
    progress: true,
    contentBase: path.resolve(__dirname, 'dist'),
  }
};