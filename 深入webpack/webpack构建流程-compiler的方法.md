## compiler的方法
在掌握了`compiler`上的各种钩子及其机制之后，接下来的任务是了解webpack的流程：因为我们需要知道将回调注册在哪些钩子上，就需要知道这些钩子都在哪些阶段触发。

开始之前，应该关心如下几点：
1. webpack的编译过程主要有哪些阶段
2. webpack是如何从entry开始解析出整个依赖树的
3. `loaders`是在何时被调用的
4. 最终是如何知道要生成几个文件，以及每个文件的内容的


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

接下来我们来看一下`compiler`在构建不同阶段调用的这些方法。

#### run方法

#### emitAssets方法

#### compile方法
