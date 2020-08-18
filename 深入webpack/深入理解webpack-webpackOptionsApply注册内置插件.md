## WebpackOptionsApply

在`WebpackOptionsApply`的实现中可以发现这个继承了`OptionsApply`的子类内只提供了一个`process`方法：
```js
class WebpackOptionsApply extends OptionsApply {
	constructor() {
		super()
	}
  process(options, compiler) {
		compiler.outputPath = options.output.path
		compiler.recordsInputPath = options.recordsInputPath || options.recordsPath
		compiler.recordsOutputPath = options.recordsOutputPath || options.recordsPath
		compiler.name = options.name
		compiler.dependencies = options.dependencies

    switch (options.target) {
      case "web":
        JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin")
        FetchCompileWasmTemplatePlugin = require("./web/FetchCompileWasmTemplatePlugin")
        NodeSourcePlugin = require("./node/NodeSourcePlugin")
        new JsonpTemplatePlugin().apply(compiler)
        new FetchCompileWasmTemplatePlugin({
          mangleImports: options.optimization.mangleWasmImports
        }).apply(compiler)
        new FunctionModulePlugin().apply(compiler)
        new NodeSourcePlugin(options.node).apply(compiler)
        new LoaderTargetPlugin(options.target).apply(compiler)
        break
      // ... 其他case： webworker、node、async-node...
      default:
        throw new Error("Unsupported target '" + options.target + "'.")
    }

    // 加载模块并触发entry-option事件流
    new EntryOptionPlugin().apply(compiler)
    compiler.hooks.entryOption.call(options.context, options.entry)

    new CommonJsPlugin(options.module).apply(compiler)
		new LoaderPlugin().apply(compiler)
    // ...在compiler上挂载了其他plugin

    compiler.hooks.afterPlugins.call(compiler)
    // ...
    compiler.resolverFactory.hooks.resolveOptions.for("context")
			.tap("WebpackOptionsApply", resolveOptions => {
				return Object.assign({ fileSystem: compiler.inputFileSystem, resolveToContext: true }, cachedCleverMerge(options.resolve, resolveOptions))
			})
		compiler.resolverFactory.hooks.resolveOptions.for("loader")
      .tap("WebpackOptionsApply", resolveOptions => {
        return Object.assign({ fileSystem: compiler.inputFileSystem }, cachedCleverMerge(options.resolveLoader, resolveOptions))
			})
    compiler.hooks.afterResolvers.call(compiler)
		return options
  }
}
```

`WebpackOptionsApply.process`主要工作可以分为两类：注册一系列内置插件、触发某些钩子。

这里拎出两处插件分析：`EntryOptionPlugin`和`LoaderPlugin`。

### EntryOptionPlugin
在`EntryOptionPlugin`内可以发现它在`entryOption`钩子上注册了回调：
```js
const itemToPlugin = (context, item, name) => {
	if (Array.isArray(item)) {
		return new MultiEntryPlugin(context, item, name)
	}
	return new SingleEntryPlugin(context, item, name)
}
class EntryOptionPlugin {
  apply(compiler) {
		compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
			if (typeof entry === "string" || Array.isArray(entry)) {
				itemToPlugin(context, entry, "main").apply(compiler)
			} else if (typeof entry === "object") {
				for (const name of Object.keys(entry)) {
					itemToPlugin(context, entry[name], name).apply(compiler)
				}
			} else if (typeof entry === "function") {
				new DynamicEntryPlugin(context, entry).apply(compiler)
			}
			return true
		})
	}
}
```

当`entryOption`钩子被触发时，会有入口插件将被注册，入口插件的类型取决于构建入口配置，若其为单入口时，有：
```js
new SingleEntryPlugin(context, entry, 'main').apply(compiler)
```

继续看`SingleEntryPlugin`：
```js
class SingleEntryPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("SingleEntryPlugin",
			(compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					SingleEntryDependency,
					normalModuleFactory
				)
			}
		)

		compiler.hooks.make.tapAsync("SingleEntryPlugin",
			(compilation, callback) => {
				const { entry, name, context } = this
				const dep = SingleEntryPlugin.createDependency(entry, name)
				compilation.addEntry(context, dep, name, callback)
			}
		)
	}
}
```

`SingleEntryPlugin`又在`compilation`和`make`钩子上注册回调，接收`compilation`参数，分别调用`compilation.dependencyFactories.set`和`compilation.addEntry`。关于`compilation`的这两个方法，将在webpack的构建流程中分析。

### LoaderPlugin
```js
class LoaderPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("LoaderPlugin", (compilation, { normalModuleFactory }) => {
			compilation.dependencyFactories.set(
				LoaderDependency,
				normalModuleFactory
			)
		})

		compiler.hooks.compilation.tap("LoaderPlugin", compilation => {
			compilation.hooks.normalModuleLoader.tap("LoaderPlugin", (loaderContext, module) => {
				loaderContext.loadModule = (request, callback) => {
					const dep = new LoaderDependency(request)
					dep.loc = { name: request }
					const factory = compilation.dependencyFactories.get(dep.constructor)
					compilation.semaphore.release()
					compilation.addModuleDependencies(module, [ { factory, dependencies: [dep] } ], true, "lm", true, () => {
						compilation.semaphore.acquire(() => {
							let source, map
							const moduleSource = dep.module._source
							if (moduleSource.sourceAndMap) {
								const sourceAndMap = moduleSource.sourceAndMap()
								map = sourceAndMap.map
								source = sourceAndMap.source
							} else {
								map = moduleSource.map()
								source = moduleSource.source()
							}
							if (dep.module.buildInfo.fileDependencies) {
								for (const d of dep.module.buildInfo.fileDependencies) {
									loaderContext.addDependency(d)
								}
							}
							if (dep.module.buildInfo.contextDependencies) {
								for (const d of dep.module.buildInfo.contextDependencies) {
									loaderContext.addContextDependency(d)
								}
							}
							return callback(null, source, map, dep.module)
						})
						}
					)
				}
			})
		})
	}
}
```

与`SingleEntryPlugin`中类似，`LoaderPlugin`在`compilation`钩子上注册了两个回调，且都接收`compilation`作为参数。两个回调方法中一个调用了`compilation.dependencyFactories`，另一个在`compilation.hooks.normalModuleLoader`钩子上继续注册了回调，同样的，`compilation`的方法会在webpack的构建流程中分析。

### 总结
`process`方法除了把`options`配置里的一些属性添加到`compiler`对象下，更主要的是根据`options`配置的不同，注册激活一些默认自带的插件和`resolverFactory.hooks`，其中大部分插件的作用是往 `compiler.hooks.compilation`,`compiler.hooks.thisCompilation`钩子上了回调，等待后续编译过程中钩子的触发来唤起这些回调。
