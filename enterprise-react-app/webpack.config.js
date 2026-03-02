// ── Enterprise React App — Webpack Configuration ───────────────────────────
// React HOST that consumes disputes-mfe (Angular Elements) via Module Federation.
// Proves the MFE is framework-agnostic: Angular Elements = plain Web Components.

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  mode: 'development',
  entry: './src/index.jsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:4203/',
    clean: true
  },

  resolve: {
    extensions: ['.jsx', '.js']
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  plugins: [
    new ModuleFederationPlugin({
      // React app is a HOST — no name/filename/exposes.
      remotes: {
        // Same remote the Angular hosts consume.
        disputes_mfe: 'disputes_mfe@http://localhost:4201/remoteEntry.js'
      },
      shared: {
        // Share React so only one copy runs even if the MFE bundled it (it won't).
        react:     { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
      }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ],

  devServer: {
    port: 4203,
    historyApiFallback: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
};
