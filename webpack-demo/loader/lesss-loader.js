const path = require('path')

const loaderUtil = require('loader-utils')

module.exports = function (source) {
  console.log('开始处理less模块')
  console.log(source)
  const options = loaderUtil.getOptions(this)

  console.log('-------options------')
  console.log(options)
  return source
}