## compiler的方法
在掌握了初始化`compiler`上的各种钩子及其机制之后，接下来的任务是学习与webpack构建流程相关的方法。

开始之前，应该关心如下几点：
1. webpack的编译过程主要有哪些阶段
2. webpack是如何从entry开始解析出整个依赖树的
3. `loaders`是在何时被调用的
4. 最终是如何知道要生成几个文件，以及每个文件的内容的

`compiler`上的方法有两处来源：
1. `Compiler`中，构建流程相关
2. `Tapable`原型——`plugin`和`apply`，提供给插件使用

重点分析`Compiler`中定义的构建流程相关的方法。

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
  }

  watch(watchOptions, handler) {}
  run(callback) {}
  purgeInputFileSystem() {}
  emitAssets(compilation, callback) {}
  compile() {}
}
```

![webpack构建流程](https://pic.downk.cc/item/5f33cb4d14195aa594ffd8b3.png)

接下来我们来看一下`compiler`在构建的不同阶段用到的这些方法。

### run方法
```js
run(callback) {
  if (this.running) return callback(new ConcurrentCompilationError())

  const finalCallback = (stats) => {
    this.running = false
    if (callback !== undefined) return callback(stats)
  }

  const startTime = Date.now()
  this.running = true

  const onCompiled = (compilation) => {
    if (this.hooks.shouldEmit.call(compilation) === false) {
      // stats包含了本次构建过程中的一些数据信息
      const stats = new Stats(compilation)
      stats.startTime = startTime
      stats.endTime = Date.now()
      this.hooks.done.callAsync(stats, ()) => {
        return finalCallback(stats)
      })
      return
    }

    // 调用compiler.emitAssets输出资源
    this.emitAssets(compilation, ()) => {
      if (compilation.hooks.needAdditionalPass.call()) {
        compilation.needAdditionalPass = true

        const stats = new Stats(compilation)
        stats.startTime = startTime
        stats.endTime = Date.now()
        this.hooks.done.callAsync(stats, ()) => {
          this.hooks.additionalPass.callAsync(()) => {
            this.compile(onCompiled)
          })
        })
        return
      }
      // 输出records
      this.emitRecords(()) => {
        const stats = new Stats(compilation);
        stats.startTime = startTime
        stats.endTime = Date.now()
        this.hooks.done.callAsync(stats, ()) => {
          return finalCallback(stats)
        })
      })
    })
  }

  this.hooks.beforeRun.callAsync(this, ()) => {
    this.hooks.run.callAsync(this, ()) => {
      this.readRecords(() => {
        this.compile(onCompiled)
      })
    })
  })
}
```
### readRecords方法
用于读取之前的records的方法，这里的records指的是一些数据片段，用于储存多次构建过程中的`module`的标识：
```js
readRecords(callback) {
  // recordsInputPath是webpack配置中指定的读取上一组records的文件路径
  if (!this.recordsInputPath) {
    this.records = {}
    return callback()
  }
  // inputFileSystem是一个封装过的文件系统，扩展了fs的功能
  // 主要是判断一下recordsInputPath的文件是否存在 存在则读取并解析，存到this.records中
  // 最后执行callback
  this.inputFileSystem.stat(this.recordsInputPath, ()) => {
    this.inputFileSystem.readFile(this.recordsInputPath, content => {
      this.records = parseJson(content.toString("utf-8"))
      return callback()
    })
  })
}
```

### compile方法
`compile`是真正进行编译的过程，创建了一个`compilation`，并将`compilation`作为触发`compiler.make`钩子上的注册的回调方法的参数，注册在这些钩子上的函数方法将调用`compilation`上的方法，执行构建。在`compilation`结束（`finish`）和封装（`seal`）完成后，执行传入的回调得以执行，也就是在`compiler.run`中定义的`onCompiled`函数。
```js
compile(callback) {
  // 创建compilation的参数
  const params = this.newCompilationParams()
  this.hooks.beforeCompile.callAsync(params, ()) => {
    this.hooks.compile.call(params)
    const compilation = this.newCompilation(params)

    this.hooks.make.callAsync(compilation, ()) => {
      compilation.finish(()) => {
        compilation.seal(()) => {
          // seal完成即编译过程完成
          this.hooks.afterCompile.callAsync(compilation, ()) => {
            return callback(null, compilation)
          })
        })
      })
    })
  })
}
```

这里创建了

`compiler.compile`钩子上有三个插件注册了回调：`DelegatedPlugin`、`DllReferencePlugin`、`ExternalsPlugin`。

### 创建compilation相关的方法
```js
newCompilationParams() {
  const params = {
    normalModuleFactory: this.createNormalModuleFactory(),
    contextModuleFactory: this.createContextModuleFactory(),
    compilationDependencies: new Set()
  }
  return params
}

createCompilation() {
  return new Compilation(this)
}

newCompilation(params) {
  const compilation = this.createCompilation()
  compilation.fileTimestamps = this.fileTimestamps
  compilation.contextTimestamps = this.contextTimestamps
  compilation.name = this.name
  compilation.records = this.records
  compilation.compilationDependencies = params.compilationDependencies
  this.hooks.thisCompilation.call(compilation, params)
  this.hooks.compilation.call(compilation, params)
  return compilation
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

createContextModuleFactory() {
  const contextModuleFactory = new ContextModuleFactory(this.resolverFactory)
  this.hooks.contextModuleFactory.call(contextModuleFactory)
  return contextModuleFactory
}
```

### emitAssets方法
`emitAssets`负责构建资源的输出，其中`emitFiles`是具体输出文件的方法。
```js
emitAssets(compilation, callback) {
  let outputPath
  const emitFiles = () => {
    asyncLib.forEachLimit(
      compilation.getAssets(),
      15,
      ({ name: file, source }, callback) => {
        let targetFile = file
        const queryStringIdx = targetFile.indexOf("?");
        if (queryStringIdx >= 0) {
          targetFile = targetFile.substr(0, queryStringIdx)
        }

        const writeOut = () => {
          const targetPath = this.outputFileSystem.join(
            outputPath,
            targetFile
          )
          if (this.options.output.futureEmitAssets) {
            const targetFileGeneration = this._assetEmittingWrittenFiles.get(targetPath)

            let cacheEntry = this._assetEmittingSourceCache.get(source)
            if (cacheEntry === undefined) {
              cacheEntry = { sizeOnlySource: undefined, writtenTo: new Map() }
              this._assetEmittingSourceCache.set(source, cacheEntry)
            }

            if (targetFileGeneration !== undefined) {
              const writtenGeneration = cacheEntry.writtenTo.get(targetPath)
              if (writtenGeneration === targetFileGeneration) {
                compilation.updateAsset(file, cacheEntry.sizeOnlySource, {
                  size: cacheEntry.sizeOnlySource.size()
                })
                return callback()
              }
            }

            let content
            if (typeof source.buffer === "function") {
              content = source.buffer()
            } else {
              const bufferOrString = source.source()
              if (Buffer.isBuffer(bufferOrString)) {
                content = bufferOrString
              } else {
                content = Buffer.from(bufferOrString, "utf8")
              }
            }

            cacheEntry.sizeOnlySource = new SizeOnlySource(content.length)
            compilation.updateAsset(file, cacheEntry.sizeOnlySource, { size: content.length })

            this.outputFileSystem.writeFile(targetPath, content, () => {
              compilation.emittedAssets.add(file)
              const newGeneration =
                targetFileGeneration === undefined
                  ? 1
                  : targetFileGeneration + 1
              cacheEntry.writtenTo.set(targetPath, newGeneration)
              this._assetEmittingWrittenFiles.set(targetPath, newGeneration)
              this.hooks.assetEmitted.callAsync(file, content, callback)
            })
          } else {
            if (source.existsAt === targetPath) {
              source.emitted = false
              return callback()
            }
            let content = source.source()

            if (!Buffer.isBuffer(content)) {
              content = Buffer.from(content, "utf8")
            }

            source.existsAt = targetPath
            source.emitted = true
            this.outputFileSystem.writeFile(targetPath, content, () => {
              this.hooks.assetEmitted.callAsync(file, content, callback)
            })
          }
        }

        if (targetFile.match(/\/|\\/)) {
          const dir = path.dirname(targetFile)
          this.outputFileSystem.mkdirp(this.outputFileSystem.join(outputPath, dir), writeOut)
        } else {
          writeOut()
        }
      },
      () => {
        this.hooks.afterEmit.callAsync(compilation, () => {
          return callback()
        })
      }
    );
  };

  this.hooks.emit.callAsync(compilation, () => {
    // 获取资源输出的路径
    outputPath = compilation.getPath(this.outputPath)
    // 递归创建输出目录，并输出资源
    this.outputFileSystem.mkdirp(outputPath, emitFiles)
  })
}
```
