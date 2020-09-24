`Compiler`模块是webpack的支柱引擎，它继承自`Tapable`类，`compiler`对象作为构建入口对象，负责解析的webpack配置，再将配置应用到`compilation`对象中：
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
    this.outputFileSystem = null
    this.inputFileSystem = null
    // 其他属性
    this.resolvers = {
      normal,
      loader,
      context
    }
  }

  // 构建流程中相关的方法
  watch(watchOptions, handler) {}
  run(callback) {}
  purgeInputFileSystem() {}
  emitAssets(compilation, callback) {}
  compile() {}
  // 其他方法
}
```

从上面的`Compiler`定义中，可以看到`compiler`在实例化时的几个关键点：
1. 定义了`complier.hooks`，用它维护了`compiler`生命周期相关的钩子，它们会在构建工作的不同阶段通过`compiler`的`run`、`emitAssets`、`compile`等方法触发
3. 定义了`compiler.resolvers`，`resolvers`负责在文件系统中寻找指定路径的文件
4. 定义了`run`、`watch`、`emitAssets`、`compile`等一系列构建流程中使用的方法

#### 0. Tapable
```js
function Tapable () {
  this._pluginCompat = new SyncBailHook(["options"])

  this._pluginCompat.tap({ name: "Tapable camelCase", stage: 100 }, options => {
    options.names.add(
      options.name.replace(/[- ]([a-z])/g, (str, ch) => ch.toUpperCase())
    )
  })
  this._pluginCompat.tap({ name: "Tapable this.hooks", stage: 200 }, options => {
    let hook
    for (const name of options.names) {
      hook = this.hooks[name]
    }
    if (hook !== undefined) {
      const tapOpt = { name: options.fn.name || "unnamed compat plugin", stage: options.stage || 0 }
      if (options.async) hook.tapAsync(tapOpt, options.fn)
      else hook.tap(tapOpt, options.fn)
      return true
    }
  })
}

// 在plugin的apply方法内调用
Tapable.prototype.plugin = util.deprecate(function plugin(name, fn) {
  // 如果name是数组
  if (Array.isArray(name)) {
    name.forEach(function(name) {
      this.plugin(name, fn)
    }, this)
    return
  }
  this._pluginCompat.call({ name: name, fn: fn, names: new Set([name]) })
}, "Tapable.plugin is deprecated. Use new API on `.hooks` instead")

Tapable.prototype.apply = util.deprecate(function apply() {
  for (var i = 0; i < arguments.length; i++) {
    arguments[i].apply(this)
  }
}, "Tapable.apply is deprecated. Call apply on the plugin directly instead")
```

`Tapable`在实例化`compiler`时定义了一个`_pluginCompat`，这是一个同步保险钩子，并且注册了两个任务，在执行`compiler.plugin`的时候触发了钩子从而执行这两个任务：
1. 将传入的插件名`camelize`化
2. 然后在`compiler.hooks`上寻找对应的钩子实例，并且调用`tap`方法真正注册的任务

老版本webpack的插件的注册与现在有所不同，不是通过`compiler.hooks.**`注册任务的，这种方式兼容了老的webpack插件，将它们的任务注册到`compiler`对应的钩子上。

___
`compiler`对象上暴露的方法涉及到webpack构建流程的几个关键步骤：
1. `run`
1. `make`编译模块：从入口文件出发，调用所有配置的`Loader`对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
2. `build module`完成模块编译：经过上面一步使用`Loade`翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系
3. `seal`输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的`Chunk`，再把每个`Chunk`M转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会
4. `emit`输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

![webpack构建流程](https://pic.downk.cc/item/5f33cb4d14195aa594ffd8b3.png)

### 1. run 方法
```js
run(callback) {
  if (this.running) return callback(new ConcurrentCompilationError())
  this.running = true

  const onCompiled = compilation => {
    this.emitAssets(compilation, () => {
      this.emitRecords(() => {
        this.hooks.done.callAsync()
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

`compiler.run`做了以下工作：
1. 定义`onCompiled`回调，处理模块解析完成后的工作
2. 触发`beforeRun`钩子、`run`钩子
3. 最后就是关键的`compile`方法了，进入正式的模块编译阶段，接收`onCompiled`回调，在模块解析完成后执行`onCompiled`。

### 2. compile方法
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
            return callback(compilation)
          })
        })
      })
    })
  })
}
```

这里的主要工作：
1. 创建用于构造`compilation`的参数`parmas`
2. 用`parmas`作为参数触发`beforeCompile`钩子
3. 用`parmas`作为参数触发`compile`钩子
3. 创建`compilation`对象
4. 用`compilation`作为参数触发`make`钩子
4. 触发`make`钩子

通过触发在`make`钩子上注册的任务，开启进行真正的编译流程，这块内容在`compilation`模块中分析。

创建`params`参数涉及的模块工厂会在模块的创建、构建中一同分析。

### 3. emitAssets
```js
emitAssets(compilation, callback) {
  let outputPath
  const emitFiles = () => {
    asyncLib.forEachLimit(
      compilation.getAssets(),
      15,
      ({ name: file, source }, callback) => {
        let targetFile = file
        const writeOut = () => {}

        if (targetFile.match(/\/|\\/)) {
          const dir = path.dirname(targetFile);
          this.outputFileSystem.mkdirp(
            this.outputFileSystem.join(outputPath, dir),
            writeOut
          );
        } else {
          writeOut()
        }
      },
      () => {
        this.hooks.afterEmit.callAsync(compilation, () => {
          return callback()
        });
      }
    );
  };

  this.hooks.emit.callAsync(compilation, () => {
    outputPath = compilation.getPath(this.outputPath)
    this.outputFileSystem.mkdirp(outputPath, emitFiles)
  })
}
```
