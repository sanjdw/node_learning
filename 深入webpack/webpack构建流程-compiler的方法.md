## compiler的方法
在掌握了初始化`compiler`上的各种钩子及其机制之后，接下来的任务是学习webpack的构建。

开始之前，应该关心如下几点：
1. webpack的编译过程主要有哪些阶段
2. webpack是如何从entry开始解析出整个依赖树的
3. `loaders`是在何时被调用的
4. 最终是如何知道要生成几个文件，以及每个文件的内容的

`compiler`上的方法有两处来源：
1. `Compiler`中，构建流程相关
2. `Tapable`中，

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

接下来我们来看一下`compiler`在构建的不同阶段用到的这些方法。

#### run方法
```js
run(callback) {
  if (this.running) return callback(new ConcurrentCompilationError())

  const finalCallback = (err, stats) => {
    this.running = false

    if (err) {
      this.hooks.failed.call(err)
    }

    if (callback !== undefined) return callback(err, stats)
  }

  const startTime = Date.now()

  this.running = true

  const onCompiled = (err, compilation) => {
    if (this.hooks.shouldEmit.call(compilation) === false) {
      const stats = new Stats(compilation)
      stats.startTime = startTime
      stats.endTime = Date.now()
      this.hooks.done.callAsync(stats, err => {
        return finalCallback(null, stats)
      })
      return
    }

    this.emitAssets(compilation, err => {
      if (compilation.hooks.needAdditionalPass.call()) {
        compilation.needAdditionalPass = true

        const stats = new Stats(compilation)
        stats.startTime = startTime
        stats.endTime = Date.now()
        this.hooks.done.callAsync(stats, err => {
          this.hooks.additionalPass.callAsync(err => {
            this.compile(onCompiled)
          })
        })
        return
      }

      this.emitRecords(err => {
        const stats = new Stats(compilation);
        stats.startTime = startTime
        stats.endTime = Date.now()
        this.hooks.done.callAsync(stats, err => {
          return finalCallback(null, stats)
        })
      })
    })
  }

  this.hooks.beforeRun.callAsync(this, err => {
    this.hooks.run.callAsync(this, err => {
      this.readRecords(err => {
        this.compile(onCompiled)
      })
    })
  })
}
```



#### emitAssets方法

#### compile方法
