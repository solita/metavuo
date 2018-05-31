const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: [
    './src/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    contentBase: './dist',
    historyApiFallback: true,
    port: '9000',
    proxy: { '/api': { target: 'http://localhost:8080' }}
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: { presets: ['env', 'react'] }
          },
          {
            loader: 'eslint-loader',
            options: {
              plugins: ['react', 'jsx-a11y', 'import']
            }
          }
        ]
      },
      {
        test: /\.(css|scss)$/,
        exclude: /node_modules/,
        use: [ 'style-loader', 'css-loader', 'sass-loader' ]
      },
      {
        test: /\.(png)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          },
        ],
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
          ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html', favicon: './src/favicon.png' }),
    new UglifyJsPlugin()
  ]
};
