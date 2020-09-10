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

    // 注册EntryOptionPlugin并触发entryOption钩子
    new EntryOptionPlugin().apply(compiler)
    compiler.hooks.entryOption.call(options.context, options.entry)

    new HarmonyModulesPlugin(options.module).apply(compiler)
    new CommonJsPlugin(options.module).apply(compiler)
    new LoaderPlugin().apply(compiler)
    // ...注册其他plugin

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
在`EntryOptionPlugin`内可以发现它在`entryOption`钩子上注册了任务：
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

`EntryOptionPlugin`根据配置搭配不同的`EntryPlugin`。通过`entry`配置进入的一共有3种类型——`SingleEntryPlugin`，`MultiEntryPlugin`和`DynamicEntryPlugin`。一般一个`compiler`只会注册一种`EntryPlugin`，这个`EntryPlugin`中有构建模块的入口，也就是`compilation`的入口。

若其为单入口配置时，有：
```js
new SingleEntryPlugin(context, entry, 'main').apply(compiler)
```

继续看`SingleEntryPlugin`：
```js
class SingleEntryPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap("SingleEntryPlugin", (compilation, { normalModuleFactory }) => {
      // SingleEntryDependency 需要使用的 Factory 是 normalModuleFactory
      compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory)
    })

    compiler.hooks.make.tapAsync("SingleEntryPlugin", (compilation, callback) => {
      const { entry, name, context } = this
      const dep = SingleEntryPlugin.createDependency(entry, name)
      compilation.addEntry(context, dep, name, callback)
    })
  }

  static createDependency(entry, name) {
    const dep = new SingleEntryDependency(entry)
    dep.loc = { name }
    return dep
  }
}
```

`SingleEntryPlugin`又在`compilation`和`make`钩子上注册任务：
1. 定义了`SingleEntryPlugin`的模块工厂
2. `make`钩子上的任务`compilation.addEntry`方法，用于进入正式的编译阶段

### LoaderPlugin
```js
class LoaderPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap("LoaderPlugin", (compilation, { normalModuleFactory }) => {
      compilation.dependencyFactories.set(LoaderDependency, normalModuleFactory)
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

与`SingleEntryPlugin`中类似，`LoaderPlugin`在`compilation`钩子上注册了两个任务：
1. 一个定义了`LoaderDependency`的模块工厂
2. 另一个在`compilation.hooks.normalModuleLoader`钩子上继续注册了任务

### 总结
`process`方法除了把`options`配置里的一些属性添加到`compiler`对象下，更主要的是根据`options`配置的不同，注册一些默认自带的插件，其中大部分插件的作用是往`compiler.hooks.thisCompilation`、`compiler.hooks.compilation`、`compiler.hooks.make`钩子上了任务，等待后续编译过程中钩子的触发来唤起这些任务。
