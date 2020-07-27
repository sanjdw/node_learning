const path = require('path')

console.log('进入webpack.config.js配置')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist')
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            // loader: 'less-loader',
            loader: 'lesss-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  // 配置自定义loader路径
  resolveLoader: {
    modules: ['node_modules', './loader']
  }
}
