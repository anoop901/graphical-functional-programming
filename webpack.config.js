const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.tsx',
  plugins: [
    new HTMLWebpackPlugin({
      title: 'Graphical Functional Programming',
      meta: {viewport: 'width=device-width, initial-scale=1'}
    })
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};