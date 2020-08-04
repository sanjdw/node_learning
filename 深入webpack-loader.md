> loader是webpack容纳各类资源的一个重要手段，它用于对模块的源代码进行转换，允许你在import或加载模块时预处理文件，利用loader，我们可以将各种类型的资源转换成webpack本质接受的资源类型，如javascript。

如何在webpack中配置loader在这里就不再多讲了，今天以less-loader为例学习loader是如何工作的。

#### 前期准备
首先，创建一个简单的demo项目（demo代码在[这里](https://github.com/grain0217/note/tree/master/webpack-demo)），并为它配置`webpack.config.js`：
```js
const path = require('path')
console.log('进入webpack.config.js配置')

module.exports = {
  mode: 'development',
  // 设置 src/index为打包入口
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
            loader: 'less-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
}
```

在入口文件`src/index`中引入一个less模块：
```js
import './public/index.less'

console.log('hello world')
```

less模块如下：
```less
.body {
  background-color: blanchedalmond;
  .title {
    color: green;
    font-size: 25px;
  }
}
```

在`index.html`中使用引入打包文件`bundle.js`并使用`index.less`中定义过的类：
```html
<html>
<head></head>
<body>
  <div class="body">
    <div class="title">学习webpack-loader</div>
  </div>
  <script src="../dist/bundle.js"></script>
</body>
</html>
```

在bash中敲下webpack指令（或在通过`package.json`配置script脚本）启动webpack构建任务，在浏览器中访问`index.html`即可看到less-loader将`index.less`转为css后的打包的效果：

![less-loader打包效果](https://pic.downk.cc/item/5f20012314195aa594e2c9be.jpg)

#### less-loader做了什么
那么less-loader都做了什么呢？我们到[less-loader源码](https://github.com/webpack-contrib/less-loader/blob/master/src/index.js)中去看一看，这里仅贴出主要代码：
```js
import { getOptions } from 'loader-utils'
import {
  getLessOptions,
  getLessImplementation,
} from './utils';

function lessLoader(source) {
  const options = getOptions(this);

  // async 是webpack提供的返回转换后的content的异步方法
  const callback = this.async();
  const lessOptions = getLessOptions(this, options);

  let data = source;

  getLessImplementation(options.implementation)
    .render(data, lessOptions)
    .then(({ css, map, imports }) => {
      imports.forEach((item) => {
        this.addDependency(path.normalize(item));
      });

      callback(null, css, typeof map === 'string' ? JSON.parse(map) : map);
    })
}

export default lessLoader;
```

可以看到，less-loader内定义了一个`lessLoader`方法，在该方法内读取了为less-loader配置的参数、以及由less-loader处理的模块，由`getLessImplementation`处理模块并返回css。在这里，`getLessImplementation`是什么？
```js
// utils.js
import less from 'less';

function getLessImplementation(implementation) {
  if (typeof implementation !== 'undefined') {
    return implementation;
  }

  return less;
}
```

其实它对less-loader的配置参数做了一个校验，如果没有为less-loader设置`implementation`方法，则默认使用`less`编译器来转换处理模块。

### 用自定义的my-less-loader处理less文件
为了验证上述推断，我们把less-loader拷出来重新命名为`my-less-loader`，并告诉webpack使用`my-less-loader`处理less模块。此外，我们还需要告诉webpack到哪里去找`my-less-loader`：
```js
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'my-less-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  // 配置查找loader的路径
  resolveLoader: {
    modules: ['node_modules', './loader']
  }
```

另外，在`my-less-loader`中我们打印这些变量：
```js
// my-less-loader.js
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
```

重新启动webpack任务：

![my-less-loader](https://pic.downk.cc/item/5f200c8a14195aa594ee2c17.jpg)

终端打印出来的正是我们所预期的。

回头再看less-loader的源码，可以发现less-loader还做了一些配置参数校验、调整的工作，至此，我们知道了loader是如何实现的，有需要的话我们可以针对项目编写自己的loader。

#### 参考
1. [手把手教你写webpack loader](https://wecteam.io/2019/09/17/%E6%89%8B%E6%8A%8A%E6%89%8B%E6%95%99%E4%BD%A0%E5%86%99webpack-loader/)
2. [从使用loader到实现loader](https://github.com/lefex/FE/tree/master/webpack)
