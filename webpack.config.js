const path = require('path');
const rootDir = path.resolve(__dirname);
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const output = {
  path: path.join(rootDir, 'web/js'),
  filename: 'bundle.js'
};

const modules_path = path.join(__dirname, 'node_modules');

module.exports = (env = 'dev') => {

  return {
    output,
    mode: 'development',
    context: path.join(rootDir, 'src'),
    entry: './app.js',
    resolveLoader: {
      modules: [modules_path],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  'targets': {
                    'esmodules': true
                  }
                }]
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-transform-async-to-generator',
                '@babel/plugin-syntax-top-level-await'
              ]
            }
          }
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
    resolve: {
      modules: [modules_path, 'src']
    },
    devServer: {
      contentBase: path.join(__dirname, 'web'),
      compress: true,
      port: 9000,
    },
  };
};
