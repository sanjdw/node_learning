const webpack = require('webpack')  // 直接使用源码中的webpack函数
const config = require('./webpack.config.js')
const compiler = webpack(config)
compiler.run((err, stats)=>{
    if (err) {
        console.error(err)
    } else {
        console.log(stats)
    }
})