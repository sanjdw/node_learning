## webpack的构建流程
在前文已经提到，webpack的核心功能是事件流的控制。在了解了webpack的`hook`机制以及`webpackOptionsApply`注册的大量插件之后，你可能会问——各个插件是如何确定应该监听哪些钩子、这些注册的任务都是什么时候随着钩子触发的？

要完全解答这个问题，就需要知道webpack的构建流程，这其中涉及了非常多的任务点。我们可以挑选完整构建流程中涉及到的几个核心对象和任务点，把webpack的构建流程讲清楚，当我们需要实现某个特定内容的时候，再去阅读对应的模块源码。开始之前应该先思考如下几个问题：
1. webpack的编译过程主要有哪些阶段
2. webpack是如何从`entry`开始解析出整个依赖树的
3. `loaders`是在何时被调用的
4. 最终是如何知道要生成几个文件，以及每个文件的内容的

带着这些问题先回顾一下`compiler`：
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



### compiler.run
```js
run(callback) {
  if (this.running) return callback(new ConcurrentCompilationError())
  this.running = true

  const onCompiled = compilation => {}

  this.hooks.beforeRun.callAsync(this, () => {
    this.hooks.run.callAsync(this, () => {
      this.readRecords(() => {
        this.compile(onCompiled)
      })
    })
  })
}
```

`compiler.run`做了以下工作：
1. 触发`beforeRun`钩子，在这之前`NodeEnvironmentPlugin`已经在此钩子上注册任务。
2. `beforeRun`钩子之后是`run`钩子，`CachePlugin`在此钩子上注册过个任务。这里对钩子上的`compiler`钩子上注册的任务暂不展开分析。
3. 接着是`readRecords`方法，该方法用于读取之前的records，这里的records指的是一些数据片段，用于储存多次构建过程中的`module`的标识。
4. 最后就是关键的`compile`方法了，进入正式的编译阶段。

### compiler.compile
`compile`方法内创建了一个`compilation`对象，由`compilation`负责具体的编译过程：
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
2. 创建`compilation`的参数，并将其作为触发`compile`钩子的参数
3. 创建`compilation`对象，并作为触发`make`钩子的参数
4. `make`钩子之后依次调用`compilation`的`finish`、`seal`方法
5. 在`compilation.seal()`完成构建结果的封装后，执行run方法中传入的`onCompiled`方法，主要用于构建资源的输出

### compilation的创建
`compilation`对象是后续构建流程中最重要的对象，它包含了一次构建过程中所有的数据，通过`createCompilation`方法创建：
```js
const params = this.newCompilationParams()
const compilation = this.newCompilation(params)
```

`createCompilation`内部：
1. 接收`compiler`作为参数，调用了构造函数`Compilation`来初始化`compilation`对象
2. 将`compiler`的一些属性赋给`compilation`对象
3. 依次触发了`compiler`的`thisCompilation`、`compilation`钩子

当`compilation`实例创建完成之后，webpack的准备阶段已经完成，下一步是`modules`和`chunks`的生成阶段。

在这里，我们先暂停总结一下`run`方法从开始执行到目前为止，`compiler`上几个钩子的触发顺序：
1. `beforeRun`
2. `run`
3. `normalModuleFactory`
4. `contextModuleFactory`
5. `beforeCompile`
6. `compile`
7. `thisCompilation`、`compilation`
8. `make`

在之前我们已经提到过，`webpackOptionsApply.process`方法会根据`options`配置的不同，向`compiler`对象上注册大量内置插件，其中大部分插件是在`compiler.hooks.thisCompilation`、`compiler.hooks.compilation`、`compiler.hooks.make`钩子上注册任务。现在，我们就来分析这几个关键钩子上的任务都做了哪些事情。

### compiler.hooks.thisCompilation钩子的任务
全局搜索`thisCompilation.tap`：

![thisCompilation钩子的任务](https://pic.downk.cc/item/5f3ca2bb14195aa5947d5060.jpg)

之前已经提到过，与`compiler`一样，`compilation`对象上也有钩子。除了`compilation.hooks`，`compilation`对象还有几个template，而这几个template又和`compiler`、`compilation`类似也有各自的钩子。`thisCompilation`钩子触发时接收`compilation`、`params`作为参数：
```js
this.hooks.thisCompilation.call(compilation, params)
```

如此一来，`thisCompilation`钩子上注册的任务便可以访问到`compilation`，接着在`compilation`上做文章：
1. 继续在`compilation`对象的钩子上注册任务
2. 在`compilation.XXtemplate`的钩子上注册任务

以上两类任务的具体功能，还要等后文解答。

### compiler.hooks.compilation钩子的任务
`compiler.hooks.compilation`钩子上的任务注册来自60余处：

![compiler.hooks.compilation钩子的任务](https://pic.downk.cc/item/5f3eb55f14195aa59456a66e.jpg)

回顾用于创建`compilation`对象所构建的参数`params`：
```js
newCompilationParas() {
  const params = {
    normalModuleFactory: this.createNormalModuleFactory(),
    contextModuleFactory: this.createContextModuleFactory(),
    compilationDependencies: new Set()
  }
  return params
}
```

参数为一个对象，它拥有三个属性：`contextModuleFactory`、`contextModuleFactory`、`compilationDependencies`：

![params](https://pic.downk.cc/item/5f59db20160a154a67a8740a.jpg)

`params`作为触发`compilation`、`make`钩子的参数：
```js
this.hooks.compilation.call(compilation, params)
// ...
this.hooks.compile.call(params)
```

`compilation`钩子上注册的任务做的事情主要分为三类：
1. 继续在`compilation`对象的钩子上注册任务
2. 在`compilation.dependencyFactories`中保存了各种模块工厂
3. 通过`contextModuleFactory.hoos.parser`对象`for`方法创建`parser`阶段（遍历`AST`）的钩子并将它们维护在`contextModuleFactory.hoos.parser._map`属性上

前文谈过`webpackOptionsApply.process`根据`options`为`compiler.hooks`上的各种钩子注册任务，等待构建流程中`compiler`的方法触发它们。同样的，`thisCompilation`、`compilation`钩子做的事情就是在`compilation`对象创建之后，在`compilation`的钩子上注册任务，等待后续编译过程中`compilation`的方法触发去它们。

### compiler.hooks.make钩子上的任务

![make钩子的任务](https://pic.downk.cc/item/5f3eb7f114195aa594579f3f.jpg)

从`make`钩子触发开始，`compilation`对象中定义的方法的得以执行：
1. `compilation.addEntry`
2. `compilation.prefetch`

这两个方法本质上都是通过`_addModuleChain`分析入口文件，创建模块对象。

### emitAssets方法
`emitAssets`负责构建资源的输出，其中`emitFiles`是具体输出文件的方法。
```js
emitAssets(compilation, callback) {
  let outputPath
  const emitFiles = () => {
    asyncLib.forEachLimit(compilation.getAssets(), 15, ({ name: file, source }, callback) => {
      let targetFile = file
      const queryStringIdx = targetFile.indexOf("?");
      if (queryStringIdx >= 0) targetFile = targetFile.substr(0, queryStringIdx)

      const writeOut = () => { }
      if (targetFile.match(/\/|\\/)) this.outputFileSystem.mkdirp(this.outputFileSystem.join(outputPath, path.dirname(targetFile)), writeOut)
      else writeOut()
    }
  }

  this.hooks.emit.callAsync(compilation, () => {
    // 获取资源输出的路径
    outputPath = compilation.getPath(this.outputPath)
    // 递归创建输出目录，并输出资源
    this.outputFileSystem.mkdirp(outputPath, emitFiles)
  })
}
```

### readRecords 读取构建记录
```js
readRecords (callback) {
  this.inputFileSystem.stat(this.recordsInputPath, () => {
    this.inputFileSystem.readFile(this.recordsInputPath, content => {
      this.records = parseJson(content.toString("utf-8"))
      return callback()
    })
  })
}
```

### emitRecords输出构建记录
```js
emitAssets(compilation, callback) {
  const idx1 = this.recordsOutputPath.lastIndexOf("/")
  const idx2 = this.recordsOutputPath.lastIndexOf("\\")
  let recordsOutputPathDirectory = null

  if (idx1 > idx2) recordsOutputPathDirectory = this.recordsOutputPath.substr(0, idx1)
  else if (idx1 < idx2) recordsOutputPathDirectory = this.recordsOutputPath.substr(0, idx2)

  this.outputFileSystem.mkdirp(recordsOutputPathDirectory, () => {

    this.outputFileSystem.writeFile(
      this.recordsOutputPath,
      JSON.stringify(this.records, undefined, 2),
      callback
    )
  })
}
```
