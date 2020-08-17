## compilation
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
      dependencyReference: new SyncWaterfallHook([
        "dependencyReference",
        "dependency",
        "module"
      ]),
      finishModules: new AsyncSeriesHook(["modules"]),
      finishRebuildingModule: new SyncHook(["module"]),
      unseal: new SyncHook([]),
      seal: new SyncHook([]),
      beforeChunks: new SyncHook([]),
      afterChunks: new SyncHook(["chunks"]),
      optimizeDependenciesBasic: new SyncBailHook(["modules"]),
      optimizeDependencies: new SyncBailHook(["modules"]),
      optimizeDependenciesAdvanced: new SyncBailHook(["modules"]),
      afterOptimizeDependencies: new SyncHook(["modules"]),
      optimize: new SyncHook([]),
      optimizeModulesBasic: new SyncBailHook(["modules"]),
      optimizeModules: new SyncBailHook(["modules"]),
      optimizeModulesAdvanced: new SyncBailHook(["modules"]),
      afterOptimizeModules: new SyncHook(["modules"]),

      optimizeChunksBasic: new SyncBailHook(["chunks", "chunkGroups"]),
      optimizeChunks: new SyncBailHook(["chunks", "chunkGroups"]),
      optimizeChunksAdvanced: new SyncBailHook(["chunks", "chunkGroups"]),
      afterOptimizeChunks: new SyncHook(["chunks", "chunkGroups"]),

      optimizeTree: new AsyncSeriesHook(["chunks", "modules"]),
      afterOptimizeTree: new SyncHook(["chunks", "modules"]),

      optimizeChunkModulesBasic: new SyncBailHook(["chunks", "modules"]),
      optimizeChunkModules: new SyncBailHook(["chunks", "modules"]),
      optimizeChunkModulesAdvanced: new SyncBailHook(["chunks", "modules"]),
      afterOptimizeChunkModules: new SyncHook(["chunks", "modules"]),
      shouldRecord: new SyncBailHook([]),

      reviveModules: new SyncHook(["modules", "records"]),
      optimizeModuleOrder: new SyncHook(["modules"]),
      advancedOptimizeModuleOrder: new SyncHook(["modules"]),
      beforeModuleIds: new SyncHook(["modules"]),
      moduleIds: new SyncHook(["modules"]),
      optimizeModuleIds: new SyncHook(["modules"]),
      afterOptimizeModuleIds: new SyncHook(["modules"]),
      reviveChunks: new SyncHook(["chunks", "records"]),
      optimizeChunkOrder: new SyncHook(["chunks"]),
      beforeChunkIds: new SyncHook(["chunks"]),
      optimizeChunkIds: new SyncHook(["chunks"]),
      afterOptimizeChunkIds: new SyncHook(["chunks"]),
      recordModules: new SyncHook(["modules", "records"]),
      recordChunks: new SyncHook(["chunks", "records"]),
      beforeHash: new SyncHook([]),
      contentHash: new SyncHook(["chunk"]),
      afterHash: new SyncHook([]),
      recordHash: new SyncHook(["records"]),
      record: new SyncHook(["compilation", "records"]),
      beforeModuleAssets: new SyncHook([]),
      shouldGenerateChunkAssets: new SyncBailHook([]),
      beforeChunkAssets: new SyncHook([]),
      additionalChunkAssets: new SyncHook(["chunks"]),
      additionalAssets: new AsyncSeriesHook([]),
      optimizeChunkAssets: new AsyncSeriesHook(["chunks"]),
      afterOptimizeChunkAssets: new SyncHook(["chunks"]),
      optimizeAssets: new AsyncSeriesHook(["assets"]),
      afterOptimizeAssets: new SyncHook(["assets"]),
      needAdditionalSeal: new SyncBailHook([]),
      afterSeal: new AsyncSeriesHook([]),
      chunkHash: new SyncHook(["chunk", "chunkHash"]),
      moduleAsset: new SyncHook(["module", "filename"]),
      chunkAsset: new SyncHook(["chunk", "filename"]),
      assetPath: new SyncWaterfallHook(["filename", "data"]), // TODO MainTemplate
      needAdditionalPass: new SyncBailHook([]),
      childCompiler: new SyncHook([
        "childCompiler",
        "compilerName",
        "compilerIndex"
      ]),

      log: new SyncBailHook(["origin", "logEntry"]),
      normalModuleLoader: new SyncHook(["loaderContext", "module"]),
      optimizeExtractedChunksBasic: new SyncBailHook(["chunks"]),
      optimizeExtractedChunks: new SyncBailHook(["chunks"]),
      optimizeExtractedChunksAdvanced: new SyncBailHook(["chunks"]),
      afterOptimizeExtractedChunks: new SyncHook(["chunks"])
    }
    this._pluginCompat.tap("Compilation", options => {})
    this.name = undefined
    this.compiler = compiler
    this.resolverFactory = compiler.resolverFactory;
    this.inputFileSystem = compiler.inputFileSystem;
    this.requestShortener = compiler.requestShortener;

    const options = compiler.options;
    this.options = options;
    this.outputOptions = options && options.output;
    this.bail = options && options.bail;
    this.profile = options && options.profile;
    this.performance = options && options.performance;
    this.mainTemplate = new MainTemplate(this.outputOptions);
    this.chunkTemplate = new ChunkTemplate(this.outputOptions);
    this.hotUpdateChunkTemplate = new HotUpdateChunkTemplate(
      this.outputOptions
    )
    this.runtimeTemplate = new RuntimeTemplate(
      this.outputOptions,
      this.requestShortener
    )
    this.moduleTemplates = {
      javascript: new ModuleTemplate(this.runtimeTemplate, "javascript"),
      webassembly: new ModuleTemplate(this.runtimeTemplate, "webassembly")
    }

    this.semaphore = new Semaphore(options.parallelism || 100)

    this.entries = []
    this._preparedEntrypoints = []
    this.entrypoints = new Map()
    this.chunks = []
    this.chunkGroups = []
    this.namedChunkGroups = new Map()
    this.namedChunks = new Map()
    this.modules = []
    this._modules = new Map()
    this.cache = null
    this.records = null
    this.additionalChunkAssets = []
    this.assets = {}
    this.assetsInfo = new Map()
    this.errors = []
    this.warnings = []
    this.children = []
    this.logging = new Map()
    this.dependencyFactories = new Map()
    this.dependencyTemplates = new Map()
    this.dependencyTemplates.set("hash", "")
    this.childrenCounters = {}
    this.usedChunkIds = null
    this.usedModuleIds = null
    this.fileTimestamps = undefined
    this.contextTimestamps = undefined
    this.compilationDependencies = undefined
    this._buildingModules = new Map()
    this._rebuildingModules = new Map()
    this.emittedAssets = new Set()
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
}
```
