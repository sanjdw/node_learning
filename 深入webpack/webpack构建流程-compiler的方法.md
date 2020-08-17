## compiler的方法
在前文已经提到，webpack的核心功能是事件流的控制。在了解了`Tapable`的钩子机制以及通过大量插件在`compiler`上的相应钩子上注册回调后，你可能会问——每个插件应该监听哪些钩子、这些回调都是什么时候随着钩子触发的？

要完全解答这个问题很难，因为webpack的构建过程中，会涉及到非常多的任务点。我们可以挑选完整构建流程中涉及到的几个核心对象和任务点，把webpack的构建流程讲清楚，当我们需要实现某个特定内容的时候，再去阅读对应的模块源码。

回顾前文，我们已经知道`compiler`上的方法有两处来源：
1. `Compiler`中，构建流程相关
2. `Tapable`原型——`plugin`和`apply`，提供给插件使用

这里需要分析的自然是在`Compiler`中定义的构建流程相关的方法，开始之前应该先思考如下几个问题：
1. webpack的编译过程主要有哪些阶段
2. webpack是如何从entry开始解析出整个依赖树的
3. `loaders`是在何时被调用的
4. 最终是如何知道要生成几个文件，以及每个文件的内容的

带着这些问题来看：
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
  // ...
}
```

这里有几个关键步骤：
1. `make`编译模块
从入口文件出发，调用所有配置的`Loader`对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
2. `build module`完成模块编译
经过上面一步使用`Loade` 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系
3. `seal`输出资源
根据入口和模块之间的依赖关系，组装成一个个包含多个模块的`Chunk`，再把每个`Chunk`M转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会
4. `emit`输出完成
在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

![webpack构建流程](https://pic.downk.cc/item/5f33cb4d14195aa594ffd8b3.png)

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
      this.hooks.done.callAsync(stats, () => {
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
        this.hooks.done.callAsync(stats, () => {
          this.hooks.additionalPass.callAsync(() => {
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
        this.hooks.done.callAsync(stats, () => {
          return finalCallback(stats)
        })
      })
    })
  }

  this.hooks.beforeRun.callAsync(this, () => {
    this.hooks.run.callAsync(this, () => {
      this.readRecords(() => {
        this.compile(onCompiled)
      })
    })
  })
}
```

先忽略`onCompiled`方法，`compiler.run`做了以下工作：
1. 触发`beforeRun`钩子，在这之前`NodeEnvironmentPlugin`在此钩子上注册回调：
```js
compiler.hooks.beforeRun.tap("NodeEnvironmentPlugin", compiler => {
	if (compiler.inputFileSystem === inputFileSystem) inputFileSystem.purge()
})
```

2. `beforeRun`钩子之后是`run`钩子，`CachePlugin`在此钩子上注册了两个回调：
```js
compiler.hooks.watchRun.tap("CachePlugin", () => {
  this.watching = true
})
compiler.hooks.run.tapAsync("CachePlugin", (compiler, callback) => {
  const fs = compiler.inputFileSystem
  const fileTs = (compiler.fileTimestamps = new Map())
  asyncLib.forEach(
    compiler._lastCompilationFileDependencies,
    (file, callback) => {
      fs.stat(file, (stat) => {
        if (stat.mtime) this.applyMtime(+stat.mtime)
        fileTs.set(file, +stat.mtime || Infinity)
        callback()
      })
    },
    () => {
      for (const [file, ts] of fileTs) {
        fileTs.set(file, ts + this.FS_ACCURACY)
      }
      callback()
    }
  )
})
```

3. 接着是`readRecords`方法，该方法用于读取之前的records，这里的records指的是一些数据片段，用于储存多次构建过程中的`module`的标识：
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
  this.inputFileSystem.stat(this.recordsInputPath, () => {
    this.inputFileSystem.readFile(this.recordsInputPath, content => {
      this.records = parseJson(content.toString("utf-8"))
      return callback()
    })
  })
}
```

4. 最后就是关键的`compile`方法了，下面做展开分析。

### compile方法
`compile`是真正进行编译的过程，创建了一个`compilation`，并在触发`compiler.make`钩子上的注册的回调时将`compilation`作为参数传入，在这些回调中将调用`compilation`上的方法，执行构建。在`compilation`结束（`finish`）和封装（`seal`）完成后，执行传入的回调得以执行，也就是在`compiler.run`中定义的`onCompiled`函数。
```js
compile(callback) {
  // 创建compilation的参数
  const params = this.newCompilationParams()
  this.hooks.beforeCompile.callAsync(params, () => {
    this.hooks.compile.call(params)
    const compilation = this.newCompilation(params)
    this.hooks.make.callAsync(compilation, () => {
      compilation.finish(() => {
        compilation.seal(() => {
          // seal完成即编译过程完成
          this.hooks.afterCompile.callAsync(compilation, () => {
            return callback(null, compilation)
          })
        })
      })
    })
  })
}
```

这里的主要工作：
1. 触发`beforeCompile`钩子
2. 创建`compilation`的参数，并触发`compile`钩子
3. 生成`compilation`，并作为触发`make`钩子的参数传给钩子上的回调
4. `make`钩子之后调用`compilation`的`finish`、`seal`方法。

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

### 总结

