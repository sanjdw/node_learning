## compilation总览
`compiler`对象包含了webpack环境所有的的配置信息，包含`loaders`，`plugins`这些信息。`compiler`是构建初始化阶段（解析webpack配置）产生的，在webpac构建任务期间只会创建一个`compiler`对象。

而`compilation`是在`compiler`内创建的，它负责具体的编译过程，它包含了每个构建环节及输出环节所对应的方法，存放着所有`module`、`chunk`、`asset`以及用来生成最后打包文件的`template`的信息。

当webpack以开发模式运行时，当检测到文件变化，不会重新初始化产生`compiler`，但是会重新从编译阶段开始创建新的`compilation`。

![compiler和compilation](https://pic.downk.cc/item/5f42926d160a154a677e9b06.png)

`Compilation`类的定义结构与`Compiler`非常相似：
```js
class Compilation extends Tapable {
  constructor(compiler) {
    super()
    this.hooks = {
      buildModule: new SyncHook(["module"]),
      rebuildModule: new SyncHook(["module"]),
      failedModule: new SyncHook(["module", "error"]),
      succeedModule: new SyncHook(["module"]),
      addEntry: new SyncHook(["entry", "name"]),
      failedEntry: new SyncHook(["entry", "name", "error"]),
      succeedEntry: new SyncHook(["entry", "name", "module"]),
      normalModuleLoader: new SyncHook(["loaderContext", "module"]),
      // 其他钩子
    }
    this._pluginCompat.tap("Compilation", options => {})
    // 通过compilation可以访问compiler
    this.compiler = compiler
    this.resolverFactory = compiler.resolverFactory
    this.inputFileSystem = compiler.inputFileSystem
    this.options = compiler.options
    this.outputOptions = options && options.output
    this.bail = options && options.bail
    this.performance = options && options.performance

    // template 用于渲染 chunk 对象，得到最终代码的模板
    this.mainTemplate = new MainTemplate(this.outputOptions)
    this.chunkTemplate = new ChunkTemplate(this.outputOptions)
    this.runtimeTemplate = new RuntimeTemplate(this.outputOptions, this.requestShortener)
    this.moduleTemplates = {
      javascript: new ModuleTemplate(this.runtimeTemplate, "javascript"),
      webassembly: new ModuleTemplate(this.runtimeTemplate, "webassembly")
    }

    this.entries = []
    this.chunks = []  // 记录所有chunk
    this.modules = [] // 记录所有解析后的模块
    this._modules = new Map()
    this.records = null
    this.assets = {}  // 记录所有将要生成的文件
    this.children = []
    this.dependencyFactories = new Map()  // 记录Dependency和ModuleFactory的对应关系，方便创建该依赖对应的Module
    this.dependencyTemplates = new Map()  // 记录Dependency和Template对应关系，方便生成加载此模块的代码
    this.dependencyTemplates.set("hash", "")
    // ...其他属性
  }

  addModule () {}
  buildModule () {}
  processModuleDependencies () {}
  addModuleDependencies () {}
  _addModuleChain () {}
  addEntry () {}
  prefetch () {}
  rebuildModule () {}
  finish () {}
  unseal () {}
  seal () {}
  createHash () {}
  emitAsset () {}
  createChunkAssets () {}
  // ...
}
```

可以看到，在实例化`compilation`过程中，`Compilation`做了以下工作：
1. `compilation.hooks`上维护了大量编译阶段相关的钩子
2. 定义了`entries`、`chunks`、`dependencyFactories`等模块相关的变量
3. 定义了`addModule`、`buildModule`等模块相关的方法

![dependency和module](https://pic.downk.cc/item/5f448289160a154a67f0862d.png)

上面谈到了两个概念，`Dependency`(依赖)和`Module`（模块）。

被依赖的文件首先会被会先作为`Dependency`对象，而后再转为`Module`对象。`dependencyFactories`用来记录不同的`Dependency`应该使用哪一个`ModuleFacotry`去生成`Module`。

### addEntry方法
```js
addEntry(context, entry, name, callback) {
  this.hooks.addEntry.call(entry, name)

  this._addModuleChain(
    context,
    entry,
    module => { this.entries.push(module) },
    (module) => {
      this.hooks.succeedEntry.call(entry, name, module)
      return callback(null, module)
    }
  )
}
```

`addEntry`调用`_addModuleChain`，从入口点分析模块及其依赖的模块，创建这些模块对象，开始编译模块，这之后的工作可以总结为：
1. 选择文件对应的loader加载模块，然后通过`acorn`解析经过loeader处理后的源文件为抽象语法树`AST`，遍历分析出模块所依赖的所有模块
2. 根据文件的依赖关系逐个解析依赖模块并重复上述过程
3. 生成chunk
4. 最后将所有加载模块的语法替换成`webpack_require`来模拟模块化操作

### compilation钩子的触发顺序
1. addEntry
2. this.semaphore.acquire => moduleFactory.create
  - normalModule.hooks.beforeResolve
  - normalModule.hooks.factory生成factory
  - normalModule.hooks.resolver => 生成resolver
  - 调用生成的resolver，normalModule.hooks.afterResolve
  - createdModule = moduleFactory.hooks.createModule.call(result)
  - moduleFactory.hooks.module(createdModule)

### _addModuleChain
`_addModuleChain`的作用将入口文件转化为一个module：
```js
_addModuleChain(context, dependency, onModule, callback) {
  // 获取模块工厂
  const Dep = dependency.constructor
  const moduleFactory = this.dependencyFactories.get(Dep)

  this.semaphore.acquire(() => {
    // 使用模块工厂创建模块对象
    moduleFactory.create(
      {
        contextInfo: { issuer: "", compiler: this.compiler.name },
        context: context,
        dependencies: [dependency]
      },
      // module：由moduleFactory.create创建返回
      module => {
        // 缓存module——addModule内部：
        // 1. this._modules.set(identifier, module); 对于normalModule来说identifier就是 module.request，即文件的绝对路径
        // 2. this.modules.push(module)
        const addModuleResult = this.addModule(module)
        module = addModuleResult.module

        onModule(module)
        dependency.module = module

        const afterBuild = () => {
          // 递归处理依赖
          this.processModuleDependencies(module, () => { callback(null, module) })
        }

        if (addModuleResult.build) {
          this.buildModule(module, false, null, null, () => {
            this.semaphore.release()
            // module build完成，依赖收集完毕，开始处理依赖的module
            afterBuild()
          })
        } else {
          this.semaphore.release()
          this.waitForBuildingFinished(module, afterBuild)
        }
      })
  })
}
```

`compilation.dependencyFactories`在`compilation`创建后触发`thisCompilation`、`compilation`钩子时已经被设置过。`_addModuleChain`方法中取出`Dependency`对应的模块工厂创建模块，

### addModule
```js
addModule (module, cacheGroup) {
  const identifier = module.identifier()
  const alreadyAddedModule = this._modules.get(identifier)
  if (alreadyAddedModule) return { module: alreadyAddedModule, issuer: false, build: false, dependencies: false }

  const cacheName = (cacheGroup || "m") + identifier
  if (this.cache) this.cache[cacheName] = module

  this._modules.set(identifier, module)
  this.modules.push(module)
  return {
    module: module,
    issuer: true,
    build: true,
    dependencies: true
  }
}
```

### buildModule
下面的操作是对module进行build。包括调用`loader`处理源文件，使用`acorn`生成`AST`。
```js
buildModule(module, optional, origin, dependencies, thisCallback) {
  let callbackList = this._buildingModules.get(module)
  if (callbackList) return callbackList.push(thisCallback)

  this._buildingModules.set(module, (callbackList = [thisCallback]))

  const callback = err => {
    this._buildingModules.delete(module);
    for (const cb of callbackList) {
      cb(err)
    }
  }

  this.hooks.buildModule.call(module)
  // 调用模块对象的build方法，在ModuleFactory中定义
  module.build(this.options, this, this.resolverFactory.get("normal", module.resolveOptions), this.inputFileSystem, () => {
    const errors = module.errors
    for (let indexError = 0; indexError < errors.length; indexError++) {
      const err = errors[indexError]
      err.origin = origin
      err.dependencies = dependencies
      if (optional) this.warnings.push(err)
      else this.errors.push(err)
    }

    const warnings = module.warnings
    for (let indexWarning = 0; indexWarning < warnings.length; indexWarning++) {
      const war = warnings[indexWarning]
      war.origin = origin
      war.dependencies = dependencies
      this.warnings.push(war)
    }
    const originalMap = module.dependencies.reduce((map, v, i) => {
      map.set(v, i)
      return map
    }, new Map())
    module.dependencies.sort((a, b) => {
      const cmp = compareLocations(a.loc, b.loc)
      if (cmp) return cmp
      return originalMap.get(a) - originalMap.get(b)
    })
    this.hooks.succeedModule.call(module)
    return callback()
  })
}
```

### 编译队列控制 —— Semaphore
```js
class Semaphore {
  constructor(available) {
    // 最大并发数
    this.available = available
    this.waiters = []
    this._continue = this._continue.bind(this)
  }

  acquire(callback) {
    if (this.available > 0) {
      this.available--
      callback()
    } else {
      this.waiters.push(callback)
    }
  }

  release() {
    this.available++
    if (this.waiters.length > 0) process.nextTick(this._continue)
  }

  _continue() {
    if (this.available > 0) {
      if (this.waiters.length > 0) {
        this.available--
        const callback = this.waiters.pop()
        callback()
      }
    }
  }
}
```

这里借鉴了多线程中使用信号量（Semaphore）对资源进行控制的概念，任务的并发数是在初始化`compilation`时就定义过的：
```js
this.semaphore = new Semaphore(options.parallelism || 100)
```

### seal
webpack通过`seal`钩子对构建后的结果进行封装，逐次对每个`module`和`chunk`进行整理，生成编译后的源码、合并、拆分、生成 hash。这是我们在开发时进行代码优化和功能添加的关键环节。
