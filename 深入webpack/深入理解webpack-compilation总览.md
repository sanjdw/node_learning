## compilation总览
`compiler`对象包含了webpack环境所有的的配置信息，包含`loaders`，`plugins`这些信息，这个对象在`Webpack`启动时候被实例化，它是全局唯一的。在webpack的每个进程中只会创建一个`compiler`对象，它会创建构建对象`compilation`。

而`compilation`对象包含了当前的模块资源、编译生成资源、变化的文件等。当webpack以开发模式运行时，每当检测到一个文件变化，一次新的`compilation`对象将被创建。

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

    // template
    this.mainTemplate = new MainTemplate(this.outputOptions)
    this.chunkTemplate = new ChunkTemplate(this.outputOptions)
    this.hotUpdateChunkTemplate = new HotUpdateChunkTemplate(this.outputOptions)
    this.runtimeTemplate = new RuntimeTemplate(this.outputOptions, this.requestShortener)
    this.moduleTemplates = {
      javascript: new ModuleTemplate(this.runtimeTemplate, "javascript"),
      webassembly: new ModuleTemplate(this.runtimeTemplate, "webassembly")
    }

    this.entries = []
    this.entrypoints = new Map()
    this.chunks = []
    this.modules = []
    this.records = null
    this.assets = {}
    this.dependencyFactories = new Map()
    this.dependencyTemplates = new Map()
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
  // ...其他方法
}
```

可以看到，在实例化`compilation`过程中，`Compilation`做了以下工作：
1. `hooks`对象上维护了大量`compilation`的生命周期钩子
2. 定义了`entries`、`chunks`、`dependencyFactories`等模块相关的属性
3. 定义了`addModule`、`buildModule`等模块处理相关的方法

`compilation`上的`mainTemplate`、`chunkTemplate`等几个template属性需要注意，篇幅有限，这里仅分析`mainTemplate`。

### MainTemplate
```js
class MainTemplate extends Tapable {
  constructor(outputOptions) {
		super();
		this.outputOptions = outputOptions || {};
		this.hooks = {
			renderManifest: new SyncWaterfallHook(["result", "options"]),
			modules: new SyncWaterfallHook(["modules", "chunk", "hash", "moduleTemplate", "dependencyTemplates"]),
			moduleObj: new SyncWaterfallHook(["source", "chunk", "hash", "moduleIdExpression"]),
			requireEnsure: new SyncWaterfallHook(["source", "chunk", "hash", "chunkIdExpression"]),
      // ...其他钩子
    }
    this.hooks.startup.tap("MainTemplate", () => {})
    this.hooks.render.tap("MainTemplate", () => {})
    // ...
    getRenderManifest(options) {}
    render () {}
  }
}
```

可以看到，`MaintTemplate`也继承自`Tapable`，它创建的对象与`compiler`、`compilation`非常相像，它也有很多钩子和方法，钩子上被注册了回调。

`compilation`对象上的这些template、template上的钩子、方法又有什么作用，同样的，这个问题也要到构建流程中去解答。
