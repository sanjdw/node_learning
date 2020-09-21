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
      addEntry: new SyncHook(["entry", "name"]),
      normalModuleLoader: new SyncHook(["loaderContext", "module"]),
      // ...
    }
    this.compiler = compiler
    this.resolverFactory = compiler.resolverFactory
    this.inputFileSystem = compiler.inputFileSystem
    this.options = compiler.options

    // template 用于渲染 chunk 对象，得到最终代码的模板
    this.mainTemplate = new MainTemplate(this.outputOptions)
    this.chunkTemplate = new ChunkTemplate(this.outputOptions)
    this.runtimeTemplate = new RuntimeTemplate(this.outputOptions, this.requestShortener)

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

在实例化`compilation`过程中，`Compilation`做了以下工作：
1. `compilation.hooks`上维护了大量编译阶段相关的钩子
2. 定义了`entries`、`chunks`、`dependencyFactories`等模块相关的变量
3. 定义了`addModule`、`buildModule`等处理模块相关的方法

在`compiler`章节中讲到过，`compiler.compile`方法执行时会创建`compilation`对象并它触发`compiler.hooks.make`钩子上注册的任务。对于单入口配置，`compiler.hooks.make`钩子上有如下任务被注册：
```js
compiler.hooks.make.tapAsync("SingleEntryPlugin", (compilation, callback) => {
  const { entry, name, context } = this;
  const dep = SingleEntryPlugin.createDependency(entry, name);
  compilation.addEntry(context, dep, name, callback);
})
```

通过`addEntry`方法进入正式的模块编译阶段：
```js
addEntry(context, entry, name, callback) {
  this.hooks.addEntry.call(entry, name)

  this._addModuleChain(
    context,
    entry,
    module => { this.entries.push(module) },
    module => {
      this.hooks.succeedEntry.call(entry, name, module)
      return callback(null, module)
    }
  )
}
```

- 触发`compilation.hooks.addEntry`钩子
- 用`_addModuleChain`方法从入口文件开始进行模块的创建、构建
- 将根据入口文件创建的模块推入`compilation.entries`

### _addModuleChain
`_addModuleChain`的作用是从入口文件开始进行模块的创建、构建工作：
```js
_addModuleChain(context, dependency, onModule, callback) {
  // 获取模块工厂实例
  const Dep = dependency.constructor
  const moduleFactory = this.dependencyFactories.get(Dep)

  // 并行任务队列 Semaphore
  this.semaphore.acquire(() => {
    // 使用模块工厂对象创建模块对象
    moduleFactory.create(
      {
        contextInfo: { issuer: "", compiler: this.compiler.name },
        context: context,
        dependencies: [dependency]
      },
      module => {
        const addModuleResult = this.addModule(module)
        module = addModuleResult.module

        onModule(module)
        dependency.module = module

        const afterBuild = () => {
          // 递归处理依赖
          this.processModuleDependencies(module, () => { callback(null, module) })
        }

        this.buildModule(module, false, null, null, () => {
          this.semaphore.release()
          // module build完成，依赖收集完毕，开始处理依赖的module
          afterBuild()
        })
      })
  })
}
```

- 读出`compilation.dependencyFactories`记录的`Dependency`对应的模块工厂实例`moduleFactory`，通过`moduleFactory.create`方法**创建**模块`module`
- 调用`addModule`缓存`module`到`compilation.modules`、`compilation._modules`，推入`compilation.entries`
- 通过`buildModule(module)`进行模块的**构建**
- 另外模块的解析构建工作是通过编译队列`Semaphore`进行并发的控制

### addModule 缓存模块
```js
addModule (module, cacheGroup) {
  const identifier = module.identifier()
  const alreadyAddedModule = this._modules.get(identifier)
  if (alreadyAddedModule) return { module: alreadyAddedModule, issuer: false, build: false, dependencies: false }

  const cacheName = (cacheGroup || "m") + identifier
  if (this.cache) this.cache[cacheName] = module

  // 对于normalModule来说identifier是module.request，即文件的绝对路径
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

主要工作是缓存`module`，将`module`推入`compilation.modules`队列和`compilations._modules`Map中，对于上一步创建的`module`经过`addModule`后：
![addModule](https://pic.downk.cc/item/5f5b2d0f160a154a676599ad.jpg)

### buildModule 构建模块
下面的操作是对`module`对象进行构建，包括调用`loader`处理源文件，使用`acorn`生成`AST`：
```js
buildModule(module, optional, origin, dependencies, thisCallback) {
  let callbackList = this._buildingModules.get(module)
  if (callbackList) return callbackList.push(thisCallback)

  this._buildingModules.set(module, (callbackList = [thisCallback]))

  const callback = () => {
    this._buildingModules.delete(module);
  }

  this.hooks.buildModule.call(module)
  // 调用模块对象的build方法
  module.build(this.options, this, this.resolverFactory.get("normal", module.resolveOptions), this.inputFileSystem, () => {
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

通过`module`的`build`方法：


### seal
webpack通过`seal`钩子对构建后的结果进行封装，逐次对每个`module`和`chunk`进行整理，生成编译后的源码、合并、拆分、生成 hash。这是我们在开发时进行代码优化和功能添加的关键环节。
