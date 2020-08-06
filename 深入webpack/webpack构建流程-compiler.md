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

  watch(watchOptions, handler) {}
  run(callback) {}
  purgeInputFileSystem() {}
  emitAssets(compilation, callback) {}
  compile() {}
  // 其他方法
}
```

从上面的`Compiler`定义中，可以看到`compiler`的实例化的几个关键点：
1. 定义了`complier.hooks`，用它维护了`compiler`生命周期相关的钩子，关于这些钩子后面将会讲到
2. 为`compiler._pluginCompat`订阅了`Compiler`钩子，`compiler._pluginCompat`是在`Tapable`中定义的
3. 定义了`compiler.resolvers`，`resolvers`负责在文件系统中寻找指定路径的文件
4. 定义了`run`、`watch`、`emitAssets`、`compile`等一系列构建流程中使用的方法，这些方法的具体定义暂时先不讨论会在后面分析它们

#### Tapable
```js
function Tapable () {
  this._pluginCompat = new SyncBailHook(["options"])

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

其中，Tapable原型的`plugin`方法，供第三方插件使用，用于将插件收集到`compiler`的`_plugins`中，这一点将在挂载`plugin`中讲到。
