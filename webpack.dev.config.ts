import path from 'path';
import { Configuration as WebpackConfiguration, HotModuleReplacementPlugin } from 'webpack';

import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Dotenv from 'dotenv-webpack';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  mode: 'development',
  output: {
    publicPath: '/',
  },
  entry: {
    client: './src/index.tsx',
    relay: './src/relay/child.ts',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    },
  },
  plugins: [
    new Dotenv({
      path: './.env.local'
    }),
    new NodePolyfillPlugin(),
    new HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'template/relay.html',
      filename: 'relay.html',
      chunks: ['relay'],
    }),
    new HtmlWebpackPlugin({
      template: 'template/index.html',
      filename: 'index.html',
      chunks: ['client'],
    }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    static: path.join(__dirname, 'static'),
    historyApiFallback: true,
    allowedHosts: 'all',
    open: ['/'],
    port: 4000,
  },
};

export default config;
