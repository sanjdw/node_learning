## 实例化compiler
```js
compiler = new Compiler(options.context)
```

`compiler`模块是webpack的支柱引擎，它继承自`Tapable`类，以便注册和调用插件。大多数面向用户的插件，会先在`Compiler`上注册。`compiler`对象上记录了完整的webpack环境信息，在webpack从启动到结束，`compiler`只会生成一次。

#### Compiler
```js
class Compiler extends Tapable {
  constructor () {
    super()
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

  watch(watchOptions, handler) {}
  run(callback) {}
  purgeInputFileSystem() {}
  emitAssets(compilation, callback) {}
  compile() {}
  // 其他方法
}
```

从上面的`Compiler`定义，可以看到`compiler`的实例化的几个关键点：
1. 定义了`complier.hooks`，用它维护了非常多钩子，关于这些钩子后面将会讲到；
2. 为`compiler._pluginCompat`注册了`Compiler`钩子，这个用来兼容老版webpack的`plugin`的钩子，在新版的`Compiler`中已经移除
3. 定义了`compiler.resolvers`，`resolvers`负责在文件系统中寻找指定路径的文件
4. 定义了`run`、`watch`、`emitAssets`、`compile`等一系列构建流程中使用的方法，这些方法的具体定义暂时先不讨论会在后面分析它们。


#### Tapable
```js
function Tapable () {
	// 存储compiler的plugins
  this._plugins = {}
}

// 触发顺序触发
Tapable.prototype.applyPluginsWaterfall = function applyPluginsWaterfall(name, init) {}

// 并行执行，在所有插件执行结束之后再执行回调
Tapable.prototype.applyPluginsParallel = function applyPluginsParallel(name) {}

// ...
// 在plugin的apply方法内调用，将plugins收集到compiler的_plugins中
Tapable.prototype.plugin = function plugin(name, fn) {
  if(Array.isArray(name)) {
    name.forEach(function(name) {
      this.plugin(name, fn)
    }, this)
    return
  }
  if(!this._plugins[name]) this._plugins[name] = [fn]
  else this._plugins[name].push(fn)
}

Tapable.prototype.apply = function apply() {
  for(var i = 0 i < arguments.length i++) {
    arguments[i].apply(this)
  }
}
```

其中，Tapable原型的`plugin`方法，供第三方插件使用，用于将插件收集到`compiler`的`_plugins`中，这一点将在挂载`plugin`中讲到。

#### Hook
上面已经提到，在实例化`compile`时，`compiler`的`hooks`上维护了非常多不同类的`hooks`实例，这些钩子都继承自`Hook`：
```js
class Hook {
	constructor(args) {
		this._args = args
		this.taps = []
		this.interceptors = []

		this.call = this._call
		this.promise = this._promise
		this.callAsync = this._callAsync
		this._x = undefined
	}
  tap(options, fn) {
    if (typeof options === "string") options = { name: options }
    if (typeof options !== "object" || options === null)
      throw new Error(
        "Invalid arguments to tap(options: Object, fn: function)"
      )
    options = Object.assign({ type: "sync", fn: fn }, options)
    if (typeof options.name !== "string" || options.name === "")
      throw new Error("Missing name for tap")
    options = this._runRegisterInterceptors(options)
    this._insert(options)
  }

  tapAsync() {}
  tapPromise()) {}
  _insert(item) {
    this._resetCompilation()
    let before
    if (typeof item.before === "string") before = new Set([item.before])
    else if (Array.isArray(item.before)) {
      before = new Set(item.before)
    }
    let stage = 0
    if (typeof item.stage === "number") stage = item.stage
    let i = this.taps.length
    while (i > 0) {
      i--
      const x = this.taps[i]
      this.taps[i + 1] = x
      const xStage = x.stage || 0
      if (before) {
        if (before.has(x.name)) {
          before.delete(x.name)
          continue
        }
        if (before.size > 0) {
          continue
        }
      }
      if (xStage > stage) {
        continue
      }
      i++
      break
    }
    this.taps[i] = item
  }
}

Object.defineProperties(Hook.prototype, {
	_call: {
		value: createCompileDelegate("call", "sync"),
		configurable: true,
		writable: true
	},
	_promise: {
		value: createCompileDelegate("promise", "promise"),
		configurable: true,
		writable: true
	},
	_callAsync: {
		value: createCompileDelegate("callAsync", "async"),
		configurable: true,
		writable: true
	}
})
```
