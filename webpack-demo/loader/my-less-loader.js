const less = require('less');

const loaderUtil = require('loader-utils')

module.exports = function (source) {
  console.log('开始处理less模块')
  console.log('-------source-------')
  console.log(source)

  const options = loaderUtil.getOptions(this)
  console.log('-------options------')
  console.log(options)

  const callback = this.async()
  
  less
    .render(source, options)
    .then(({ css, map, imports }) => {
      console.log('--------css--------')
      console.log(css)
      callback(null, css, typeof map === 'string' ? JSON.parse(map) : map);
    })
}
