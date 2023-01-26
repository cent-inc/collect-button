import path from 'path';
import { Configuration } from 'webpack';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const config: Configuration = {
  mode: 'production',
  entry: {
    button: './src/button.ts',
    index: './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    libraryTarget: 'umd',
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
      path: process.env.STAGING ? './.env.staging' : './.env.production',
    }),
    new NodePolyfillPlugin(),
    new HtmlWebpackPlugin({
      template: 'template/custom.html',
      filename: 'custom.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      template: 'template/index.html',
      filename: 'index.html',
      chunks: ['button'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static' }
      ]
    }),
  ],
};

export default config;
