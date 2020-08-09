## 实例化compiler
```js
compiler = new Compiler(options.context)
```

`compiler`对象上记录了完整的webpack环境信息，以便注册和插件调用。在webpack从启动到结束，`compiler`只会生成一次。

#### Compiler类
`Compiler`模块是webpack的支柱引擎，它继承自`Tapable`类：
```js
class Compiler extends Tapable {
  constructor () {
    super()
    // 生命周期钩子
    this.hooks = {
      shouldEmit: new SyncBailHook(["compilation"]),
      done: new AsyncSeriesHook(["stats"]),
      beforeRun: new AsyncSeriesHook(["compiler"]),
      run: new AsyncSeriesHook(["compiler"]),
      emit: new AsyncSeriesHook(["compilation"]),
      assetEmitted: new AsyncSeriesHook(["file", "content"]),
      afterEmit: new AsyncSeriesHook(["compilation"]),
      compilation: new SyncHook(["compilation", "params"]),
      compile: new SyncHook(["params"]),
      environment: new SyncHook([]),
      afterEnvironment: new SyncHook([]),
			// 其他hook
    }
    // _pluginCompat在Tapable中定义
    this._pluginCompat.tap("Compiler", options => {
      switch (options.name) {
        case "additional-pass":
        case "before-run":
        case "run":
        case "emit":
        case "after-emit":
        case "before-compile":
        case "make":
        case "after-compile":
        case "watch-run":
          options.async = true
          break
      }
    })
    this.outputFileSystem = null
    this.inputFileSystem = null
    // 其他属性
    this.resolvers = {
      normal,
      loader,
      context
    }
  }

  // 构建流程中相关的方法
  watch(watchOptions, handler) {}
  run(callback) {}
  purgeInputFileSystem() {}
  emitAssets(compilation, callback) {}
  compile() {}
  // 其他方法
}
```

从上面的`Compiler`定义中，可以看到`compiler`在实例化时的几个关键点：
1. 定义了`complier.hooks`，用它维护了`compiler`生命周期相关的钩子，它们会在构建工作的不同阶段通过`compiler`的`run`、`emitAssets`、`compile`等方法触发
2. 在`compiler._pluginCompat`钩子上注册了`Compiler`回调，`compiler._pluginCompat`是在`Tapable`中定义的，后面会提到`compiler._pluginCompat`钩子的触发时机
3. 定义了`compiler.resolvers`，`resolvers`负责在文件系统中寻找指定路径的文件
4. 定义了`run`、`watch`、`emitAssets`、`compile`等一系列构建流程中使用的方法，这些方法的具体实现在这里暂时不做讨论，会在后面分析它们

接下来是`Compiler`的父类`Tapable`，我们来看一看`compiler`的实例化还有哪些操作。

#### Tapable类
```js
function Tapable () {
  this._pluginCompat = new SyncBailHook(["options"])

  // 注册了两个回调
  this._pluginCompat.tap(
    {
      name: "Tapable camelCase",
      stage: 100
    },
    options => {
      options.names.add(
        options.name.replace(/[- ]([a-z])/g, (str, ch) => ch.toUpperCase())
      )
    }
  )
  this._pluginCompat.tap(
    {
      name: "Tapable this.hooks",
      stage: 200
    },
    options => {
      let hook
      for (const name of options.names) {
        hook = this.hooks[name]
      }
      if (hook !== undefined) {
        const tapOpt = {
          name: options.fn.name || "unnamed compat plugin",
          stage: options.stage || 0
        }
        if (options.async) hook.tapAsync(tapOpt, options.fn)
        else hook.tap(tapOpt, options.fn)
        return true
      }
    }
  )
}

// 在plugin的apply方法内调用，将plugins收集到compiler的_plugins中
Tapable.prototype.plugin = util.deprecate(function plugin(name, fn) {
  // 如果name是数组
  if (Array.isArray(name)) {
    name.forEach(function(name) {
      this.plugin(name, fn)
    }, this)
    return
  }
  this._pluginCompat.call({
    name: name,
    fn: fn,
    names: new Set([name])
  })
}, "Tapable.plugin is deprecated. Use new API on `.hooks` instead")

Tapable.prototype.apply = util.deprecate(function apply() {
  for (var i = 0; i < arguments.length; i++) {
    arguments[i].apply(this)
  }
}, "Tapable.apply is deprecated. Call apply on the plugin directly instead")
```

从上面可以知道，`Tapable`为`compiler`的实例化主要做了两件事：
1. 声明了`compiler._pluginCompat`钩子，且注册了两个回调，注意此外前文也提到过子类`Compiler`在实例化`compiler`时同样在`compiler._pluginCompat`钩子上注册了回调
2. 定义了两个方法:
  - `compiler.plugin`方法：触发了`compiler._pluginCompat`钩子，后面在插件部分会讲到插件的`apply`方法接收`compiler`作为参数从而调用`compiler.plugin`方法
  - `compiler.apply`方法：暂时未知

至此，我们知道了`compiler`的初步初始化过程中，做了以下事情：
1. 定义了两类钩子：生命周期相关的`compiler.hooks`，`compiler._pluginCompat`
2. 定义了两类方法：生命周期相关的`compiler.run`、`compiler.compile`、`compiler.watch`等方法，供插件调用的`compiler.plugin`方法。
