const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = () => ({
  entry: './features/steps',
  output: {
    path: path.resolve(__dirname, 'features', 'step_definitions'),
    filename: 'steps.js',
    libraryTarget: 'commonjs2'
  },
  mode: 'development',
  target: 'node',
  externals: [
    'chai',
    'cucumber',
    'vue-property-decorator'
  ],
  devtool: false,
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.ts',
      '.tsx',
      '.vue'
    ]
  },
  plugins: [new VueLoaderPlugin()],
  module: {
    rules: [
      {
        test: [
          /\.vue$/
        ],
        loader: 'vue-loader'
      },
      {
        test: [
          /\.ts$/
        ],
        exclude: [
          path.resolve(__dirname, 'node_modules')
        ],
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true
        }
      }
    ]
  }
})
