## webapck构建流程

![webpack构建流程](https://pic.downk.cc/item/5f2a98fe14195aa594f3cd3f.png)

#### 入口文件
在`/webpack/lib/webpack.js`中定义了webpack方法：
```js
function webpack (options, callback) {
  /**
   *  1. options的校验以及规范化
	 */
  const webpackOptionsValidationErrors = validateSchema(
    webpackOptionsSchema,
    options
  )
  if (webpackOptionsValidationErrors.length) {
    throw new WebpackOptionsValidationError(webpackOptionsValidationErrors)
  }
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
     * 4. 挂载plugin
     */
    if (options.plugins && Array.isArray(options.plugins)) {
      for (const plugin of options.plugins) {
        if (typeof plugin === "function") {
          plugin.call(compiler, compiler);
        } else {
          plugin.apply(compiler);
        }
      }
    }

    /**
     * 5.
     */
    compiler.hooks.environment.call()

    /**
     * 6.
     */
    compiler.hooks.afterEnvironment.call()

    /**
     * 7. options中其他的配置进行初始化处理
     */
    compiler.options = new WebpackOptionsApply().process(options, compiler)
  } else {
    throw new Error("Invalid argument: options")
  }

  /**
   * 如果传入callback，compiler.run(callback)
   */
  if (callback) {
    if (typeof callback !== "function") {
      throw new Error("Invalid argument: callback");
    }
    if (
      options.watch === true ||
      (Array.isArray(options) && options.some(o => o.watch))
    ) {
      const watchOptions = Array.isArray(options)
        ? options.map(o => o.watchOptions || {})
        : options.watchOptions || {};
      return compiler.watch(watchOptions, callback);
    }
    compiler.run(callback);
  }
  return compiler;
}
```

#### 1. 校验以及初始化默认参数配置options
```js
options = new WebpackOptionsDefaulter().process(options)
```

#### 2. 实例化compiler
```js
compiler = new Compiler(options.context);
```

Compiler负责文件监听和启动编译

#### 3. 初始化complier的文件系统输入、输出、缓存以及监视文件系统
```js
new NodeEnvironmentPlugin().apply(compiler)
```

#### 4. 挂载plugin
将`compiler`作为参数传入插件实现的`apply`方法，使插件可以监听`compiler`后续的所有事件

#### 钩子
compiler.hooks.environment.call()

#### 钩子
compiler.hooks.afterEnvironment.call()

## options
compiler.options = new WebpackOptionsApply().process(options, compiler)

## run传入的callback
```js
if (callback) {
  if (
  options.watch === true ||
      (Array.isArray(options) && options.some(o => o.watch))
    ) {
      const watchOptions = Array.isArray(options)
        ? options.map(o => o.watchOptions || {})
        : options.watchOptions || {};
      return compiler.watch(watchOptions, callback);
    }
  compiler.run(callback);
}
```
