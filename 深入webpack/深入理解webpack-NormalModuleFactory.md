## NormalModuleFactory

```js
class NormalModuleFactory extends Tapable {
  constructor(context, resolverFactory, options) {
    super()
    this.hooks = {
      resolver: new SyncWaterfallHook(["resolver"]),
      factory: new SyncWaterfallHook(["factory"]),
      beforeResolve: new AsyncSeriesWaterfallHook(["data"]),
      afterResolve: new AsyncSeriesWaterfallHook(["data"]),
      createModule: new SyncBailHook(["data"]),
      module: new SyncWaterfallHook(["module", "data"]),
      createParser: new HookMap(() => new SyncBailHook(["parserOptions"])),
      parser: new HookMap(() => new SyncHook(["parser", "parserOptions"])),
      createGenerator: new HookMap(() => new SyncBailHook(["generatorOptions"])),
      generator: new HookMap(() => new SyncHook(["generator", "generatorOptions"]))
    }
    this.ruleSet = new RuleSet(options.defaultRules.concat(options.rules))

    // 返回一个模块工厂
    this.hooks.factory.tap("NormalModuleFactory", () => (result, callback) => {
      let resolver = this.hooks.resolver.call(null)
      resolver(result, (err, data) => {
        this.hooks.afterResolve.callAsync(data, (err, result) => {
          let createdModule = this.hooks.createModule.call(result)
          createdModule = this.hooks.module.call(createdModule, result)
          return callback(null, createdModule)
        })
      })
    })

    this.hooks.resolver.tap("NormalModuleFactory", () => (data, callback) => {
      // ...
    })
  }
  // 创建模块
  create () {}
  getParser () {}
  getResolver () {}
  build () {}
}
```

同样的，一个模块在实例化之后并不意味着构建就结束了，它也有一个内部构建的过程。

### create方法
```js
create (data, callback) {
  const dependencies = data.dependencies
  const context = data.context || this.context
  const resolveOptions = data.resolveOptions || EMPTY_RESOLVE_OPTIONS
  const request = dependencies[0].request
  const contextInfo = data.contextInfo || {}
  this.hooks.beforeResolve.callAsync(
    { contextInfo, resolveOptions, context, request, dependencies },
    result => {
      const factory = this.hooks.factory.call(null)
      factory(result, module => {
        callback(null, module)
      })
    }
  )
}
```

### build 方法
这个方法的作用是开始加载模块源码（并应用loaders），并且通过`js`解析器来完成依赖解析。这里要两个点要注意：
