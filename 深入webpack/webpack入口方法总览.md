<!-- ## webapck方法总览 -->
![webpack构建流程](https://pic.downk.cc/item/5f2a98fe14195aa594f3cd3f.png)

## webpack入口方法总览
`/webpack/lib/webpack.js`中定义了webpack方法：
```js
function webpack (options, callback) {
  /**
   *  1. options的校验以及规范化
	 */
  const webpackOptionsValidationErrors = validateSchema(webpackOptionsSchema, options)
  if (webpackOptionsValidationErrors.length) throw new WebpackOptionsValidationError(webpackOptionsValidationErrors)

  let compiler
  if (Array.isArray(options)) {
    compiler = new MultiCompiler(
      Array.from(options).map(options => webpack(options))
    )
  } else if (typeof options === "object") {
    options = new WebpackOptionsDefaulter().process(options)

    /**
     * 2. 实例化compiler
     */
    compiler = new Compiler(options.context)
    compiler.options = options

    /**
     * 3. 初始化complier的文件系统：输入输出、缓存以及监听
     */
    new NodeEnvironmentPlugin({
      infrastructureLogging: options.infrastructureLogging
    }).apply(compiler)

    /**
     * 4. 注册开发者配置的plugin
     */
    if (options.plugins && Array.isArray(options.plugins)) {
      for (const plugin of options.plugins) {
        if (typeof plugin === "function") plugin.call(compiler, compiler)
        else plugin.apply(compiler)
      }
    }

    /**
     * 5. 根据option配置注册大量内置插件
     */
    compiler.options = new WebpackOptionsApply().process(options, compiler)
  }

  /**
   * 6. 如果传入callback，通过compiler.run(callback)开启构建工作
   */
  if (callback) {
    if (options.watch === true || (Array.isArray(options) && options.some(o => o.watch))) {
      const watchOptions = Array.isArray(options)
        ? options.map(o => o.watchOptions || {})
        : options.watchOptions || {}
      return compiler.watch(watchOptions, callback)
    }
    compiler.run(callback)
  }
  return compiler
}
```

### 1. 校验以及初始化默认参数配置options
```js
validateSchema(webpackOptionsSchema, options)
options = new WebpackOptionsDefaulter().process(options)
```

规范化后的options：

![options](https://pic.downk.cc/item/5f58f555160a154a674438c3.jpg)

### 2. 实例化compiler
`compiler`负责文件监听和启动编译，这一步通过`Compiler`构造函数初步实例化`compiler`：
```js
compiler = new Compiler(options.context)
```

### 3. 初始化complier的文件系统输入、输出、缓存以及监视文件系统
```js
new NodeEnvironmentPlugin({
  infrastructureLogging: options.infrastructureLogging
}).apply(compiler)
```

这一步赋予了`compiler`对象文件读写的能力。

### 4. 注册开发者配置的plugin

### 5. 根据option配置注册各种插件
```js
compiler.options = new WebpackOptionsApply().process(options, compiler)
```

这一步根据`options`注册大量webpack内置插件，本质是在`compiler`的钩子上注册任务。

### 6. 如果有callback传入则通过run方法开启构建任务，否则返回compiler对象
```js
if (callback) {
  if (options.watch === true || (Array.isArray(options) && options.some(o => o.watch))) {
    const watchOptions = Array.isArray(options)
      ? options.map(o => o.watchOptions || {})
      : options.watchOptions || {}
    return compiler.watch(watchOptions, callback)
  }
  compiler.run(callback)
}
```
