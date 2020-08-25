## compiler总览
```js
compiler = new Compiler(options.context)
```

`compiler`对象作为构建入口对象，负责解析的webpack配置，再将配置应用到`compilation`对象中。

### Compiler类
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
3. 定义了`compiler.resolvers`，`resolvers`负责在文件系统中寻找指定路径的文件
4. 定义了`run`、`watch`、`emitAssets`、`compile`等一系列构建流程中使用的方法，这些方法的具体实现在这里暂时不做讨论，会在后面分析它们

### Tapable类
```js
function Tapable () {
  this._pluginCompat = new SyncBailHook(["options"])

  this._pluginCompat.tap({ name: "Tapable camelCase", stage: 100 }, options => {
    options.names.add(
      options.name.replace(/[- ]([a-z])/g, (str, ch) => ch.toUpperCase())
    )
  })
  this._pluginCompat.tap({ name: "Tapable this.hooks", stage: 200 }, options => {
    let hook
    for (const name of options.names) {
      hook = this.hooks[name]
    }
    if (hook !== undefined) {
      const tapOpt = { name: options.fn.name || "unnamed compat plugin", stage: options.stage || 0 }
      if (options.async) hook.tapAsync(tapOpt, options.fn)
      else hook.tap(tapOpt, options.fn)
      return true
    }
  })
}

// 在plugin的apply方法内调用
Tapable.prototype.plugin = util.deprecate(function plugin(name, fn) {
  // 如果name是数组
  if (Array.isArray(name)) {
    name.forEach(function(name) {
      this.plugin(name, fn)
    }, this)
    return
  }
  this._pluginCompat.call({ name: name, fn: fn, names: new Set([name]) })
}, "Tapable.plugin is deprecated. Use new API on `.hooks` instead")

Tapable.prototype.apply = util.deprecate(function apply() {
  for (var i = 0; i < arguments.length; i++) {
    arguments[i].apply(this)
  }
}, "Tapable.apply is deprecated. Call apply on the plugin directly instead")
```

`Tapable`在实例化`compiler`时定义了一个`_pluginCompat`，这是一个同步保险钩子，并且注册了两个回调，在执行`compiler.plugin`的时候触发了钩子从而执行这两个回调：
1. 将传入的插件名`camelize`化
2. 然后在`compiler.hooks`上寻找对应的钩子实例，并且调用`tap`方法真正注册的回调

这样操作的原因是，老版本webpack的插件的注册与现在有所不同，不是通过`compiler.hooks.**`注册回调的，这种方式兼容了老的webpack插件，将它们的回调注册到`compiler`对应的钩子上。

### run 方法
### compiler方法

### watch方法
```js
watch(watchOptions, handler) {
  this.running = true
  this.watchMode = true
  this.fileTimestamps = new Map()
  this.contextTimestamps = new Map()
  this.removedFiles = new Set()
  return new Watching(this, watchOptions, handler)
}
```

### Watching
```js
class Watching {
  constructor(compiler, watchOptions, handler) {
    this.startTime = null
    this.invalid = false
    this.handler = handler
    this.callbacks = []
    this.closed = false
    this.suspended = false
    this.watchOptions = Object.assign({}, watchOptions)
    this.watchOptions.aggregateTimeout = this.watchOptions.aggregateTimeout || 200
    this.compiler = compiler
    this.running = true
    this.compiler.readRecords(() => {
      this._go()
    })
  }

  _go() {
    this.startTime = Date.now()
    this.running = true
    this.invalid = false
    this.compiler.hooks.watchRun.callAsync(this.compiler, () => {
      const onCompiled = compilation => {
        this.compiler.emitAssets(compilation, () => {
          this.compiler.emitRecords(() => {
            if (compilation.hooks.needAdditionalPass.call()) {
              compilation.needAdditionalPass = true

              const stats = new Stats(compilation)
              stats.startTime = this.startTime
              stats.endTime = Date.now()
              this.compiler.hooks.done.callAsync(stats, () => {
                this.compiler.hooks.additionalPass.callAsync(() => {
                  this.compiler.compile(onCompiled)
                })
              });
              return
            }
            return this._done(null, compilation)
          })
        })
      }
      this.compiler.compile(onCompiled)
    })
  }

  _getStats(compilation) {}

  _done(err, compilation) {
    this.running = false
    const stats = compilation ? this._getStats(compilation) : null
    this.compiler.hooks.done.callAsync(stats, () => {
      this.handler(null, stats)
      if (!this.closed) this.watch(Array.from(compilation.fileDependencies), Array.from(compilation.contextDependencies), Array.from(compilation.missingDependencies))
      for (const cb of this.callbacks) cb()
      this.callbacks.length = 0
    })
  }

  watch(files, dirs, missing) {
    this.pausedWatcher = null;
    this.watcher = this.compiler.watchFileSystem.watch(
      files,
      dirs,
      missing,
      this.startTime,
      this.watchOptions,
      (fileTimestamps, contextTimestamps, removedFiles) => {
        this.pausedWatcher = this.watcher
        this.watcher = null
        this.compiler.fileTimestamps = fileTimestamps
        this.compiler.contextTimestamps = contextTimestamps
        this.compiler.removedFiles = removedFiles
        if (!this.suspended) this._invalidate()
      },
      (fileName, changeTime) => {
        this.compiler.hooks.invalid.call(fileName, changeTime)
      }
    )
  }

  invalidate(callback) {}

  _invalidate() {}

  suspend() {}

  resume() {}

  close(callback) {}
}
```
