const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './src/index.ts',
    output: {
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      library: {
        name: 'StandardNotesEnhancedEditor',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@editor': path.resolve(__dirname, 'src/editor'),
        '@plugins': path.resolve(__dirname, 'src/plugins'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: 'body'
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'async',
        cacheGroups: {
          mermaid: {
            test: /[\\/]node_modules[\\/]mermaid/,
            name: 'mermaid',
            chunks: 'async',
            priority: 10
          },
          excalidraw: {
            test: /[\\/]node_modules[\\/]@excalidraw/,
            name: 'excalidraw',
            chunks: 'async',
            priority: 10
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'async',
            priority: 5
          }
        }
      },
      runtimeChunk: 'single'
    },
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      compress: true,
      port: 8080,
      hot: true,
      open: true
    }
  };
};