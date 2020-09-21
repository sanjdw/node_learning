`compiler.compile`方法执行时的第一步就是创建用于初始化`compilation`的参数：
```js
const params = this.newCompilationParams()

newCompilationParams() {
  const params = {
    normalModuleFactory: this.createNormalModuleFactory(),
    compilationDependencies: new Set()
  }
  return params
}

createNormalModuleFactory() {
  const normalModuleFactory = new NormalModuleFactory(
    this.options.context,
    this.resolverFactory,
    this.options.module || {}
  )
  this.hooks.normalModuleFactory.call(normalModuleFactory)
  return normalModuleFactory
}
```

这里创建的工厂模块实例`NormalModuleFactory`在`compiler.hooks.compilation`钩子触发时被记录进`compilation.dependencyFactories`中，在`compilation._addModuleChain`方法执行时取出：

![dependency和moduleFactory](https://pic.downk.cc/item/5f448289160a154a67f0862d.png)

## 模块工厂NormalModuleFactory
```js
class NormalModuleFactory extends Tapable {
  constructor(context, resolverFactory, options) {
    super()
    this.hooks = {
      resolver: new SyncWaterfallHook(["resolver"]),
      factory: new SyncWaterfallHook(["factory"]),
      beforeResolve: new AsyncSeriesWaterfallHook(["data"]),
      afterResolve: new AsyncSeriesWaterfallHook(["data"]),
      module: new SyncWaterfallHook(["module", "data"]),
      parser: new HookMap(() => new SyncHook(["parser", "parserOptions"])),
      // ...
    }
    this.ruleSet = new RuleSet(options.defaultRules.concat(options.rules))

    // 返回一个模块工厂实例
    this.hooks.factory.tap("NormalModuleFactory", () => (result, callback) => {
      let resolver = this.hooks.resolver.call(null)
      resolver(result, data => {
        this.hooks.afterResolve.callAsync(data, result => {
          let createdModule = this.hooks.createModule.call(result)
          if (!createdModule) createdModule = new NormalModule(result)
          createdModule = this.hooks.module.call(createdModule, result)
          return callback(null, createdModule)
        })
      })
    })

    // 返回一个resolver函数
    // resolver用于解析构建所有module所需要的loaders的绝对路径、module的相关构建信息(例如获取module的packge.json等。
    this.hooks.resolver.tap("NormalModuleFactory", () => (data, callback) => {
      // ...
    })
  }
  // 创建模块
  create () {}
}
```

#### 模块工厂实例的create方法
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

对应的`factory`实例是通过`factory`钩子上的的回调方法生成的：

![create](https://pic.downk.cc/item/5f6031bb160a154a671742e5.png)

___
## 模块NormalModule
```js
class NormalModule extends Module {
  constructor({type, request, userRequest, rawRequest, loaders, resource, matchResource, parser, generator, resolveOptions}) {
    super(type, getContext(resource));

    this.request = request
    this.userRequest = userRequest
    this.rawRequest = rawRequest
    this.binary = type.startsWith("webassembly")
    this.parser = parser
    this.generator = generator
    this.resource = resource;
    this.matchResource = matchResource
    this.loaders = loaders
    if (resolveOptions !== undefined) this.resolveOptions = resolveOptions

    this._source = null
    this._buildHash = ""
  }

  build () {}
  doBuild () {}
  // ...
}
```

### 1.模块实例的build 方法
```js
build(options, compilation, resolver, fs, callback) {
  this.built = true
  this._source = null
  this._ast = null
  this._buildHash = ""
  this.buildMeta = {}

  return this.doBuild(options, compilation, resolver, fs, () => {
    this._cachedSources.clear()

    const handleParseResult = result => {
      this._lastSuccessfulBuildMeta = this.buildMeta
      this._initBuildHash(compilation)
      return callback()
    }

      // 这里会将source转为 AST，递归分析出所有的依赖
    const result = this.parser.parse(
      this._ast || this._source.source(),
      { current: this, module: this, compilation: compilation, options: options },
      (result) => {
        handleParseResult(result)
      }
    )
    if (result !== undefined) {
      handleParseResult(result)
    }
  })
}
```

#### 2.模块实例的doBuild方法
```js
doBuild(options, compilation, resolver, fs, callback) {
  const loaderContext = this.createLoaderContext(resolver, options, compilation, fs)
  // 运行配置文件中配置的loader，比如babel-loader，然后返回处理完毕后的源码(JS)
  runLoaders(
    { resource: this.resource, loaders: this.loaders, context: loaderContext, readResource: fs.readFile.bind(fs) },
    result => {
      if (result) {
        this.buildInfo.cacheable = result.cacheable
        this.buildInfo.fileDependencies = new Set(result.fileDependencies)
        this.buildInfo.contextDependencies = new Set(result.contextDependencies)
      }

      const resourceBuffer = result.resourceBuffer
      const source = result.result[0]
      const sourceMap = result.result.length >= 1 ? result.result[1] : null
      const extraInfo = result.result.length >= 2 ? result.result[2] : null

			// createSource 会将 runLoader 得到的结果转为字符串以便后续处理
      this._source = this.createSource(
        this.binary ? asBuffer(source) : asString(source),
        resourceBuffer,
        sourceMap
      )
      this._ast =
        typeof extraInfo === "object" &&
        extraInfo !== null &&
        extraInfo.webpackAST !== undefined
          ? extraInfo.webpackAST
          : null
      return callback()
    }
  )
}
```

`doBuild`主要作用是选择合适的`loader`去加载`resource`，转换为js模块，再返回转换后的文件以便后续继续处理
