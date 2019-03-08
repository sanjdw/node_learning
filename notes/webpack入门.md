在项目下初始化npm环境

        npm init

安装webpack

	    npm install webpack --save-dev

建立文件

	    mkdir src/...., dist/...

基本打包命令

	    webpack src/main.js dist/bundle.js

通过webpack配置文件代替命令行打包

        vim webpack.config.js

        module.exports = {
            entry: './src/main.js',
            output: {
                path: './dist/js',
                filename: 'bundle.js',
            }
        }

在package.json中配置webpack：

        "script": {
            "webpack": "webpack --config webpack.config.js --watch"
        }

        npm run webpack

webpack的entry和output：

        多入口多出口：
        entry: {
            main: './src/script/main.js',
            a: './src/script/a.js'
        },
        output: {
            filename: '[name]-[hash].js',//[chunkhash]chunk的hash值，[hash]本次打包的hash值
            path：'/dist/js'
        }

借助webpack插件html-webpack-plugin动态打包：

        npm install html-webpack-plugin --save-dev

        //webpack.config.js
        var htmlWebpackPlugin = require('html-webpack-plugin');
        module.exports = {
            //context: '',
            entry: {
                .....
            },
            output:{
                path:'./dist',
                filename: 'js/[name]-[chunkhash].js' //js与html分开
            },
            plugins: [
                new htmlWebpackPlugin({
                    filename: 'index-[hash].html',
                    template: 'index.html',
                    inject: 'head'//脚本的位置
                })
            ]
        }





