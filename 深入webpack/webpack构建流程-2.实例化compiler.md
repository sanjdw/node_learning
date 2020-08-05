## 实例化compiler
```js
compiler = new Compiler(options.context)
```

`compiler`模块是webpack的支柱引擎，它继承自`Tapable`类，以便注册和调用插件。大多数面向用户的插件，会先在`Compiler`上注册。`compiler`对象上记录了完整的webpack环境信息，在webpack从启动到结束，`compiler`只会生成一次。

#### Compiler
```js
class Compiler extends Tapable {
  constructor () {
    super()
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
    this._pluginCompat.tap("Compiler", options => {
      switch (options.name) {
        case "additional-pass":
        case "before-run":
        case "run":
        case "emit":
        case "after-emit":
        case "before-compile":
        case "make":
        case "after-compile":
        case "watch-run":
          options.async = true;
          break;
      }
    });
    this.outputFileSystem = null
    this.inputFileSystem = null
    // ...
    this.resolvers = {
      normal,
      loader,
      context
    }
  }

  watch(watchOptions, handler) {
    if (this.running) return handler(new ConcurrentCompilationError());

    this.running = true;
    this.watchMode = true;
    this.fileTimestamps = new Map();
    this.contextTimestamps = new Map();
    this.removedFiles = new Set();
    return new Watching(this, watchOptions, handler);
  }
}
```

#### Tapable
```js
function Tapable () {
	// 存储compiler的plugins
  this._plugins = {}
}

// 触发顺序触发
Tapable.prototype.applyPluginsWaterfall = function applyPluginsWaterfall(name, init) {}

// 并行执行，在所有插件执行结束之后再执行回调
Tapable.prototype.applyPluginsParallel = function applyPluginsParallel(name) {}

// ...
// 在plugin的apply方法内调用，将plugins收集到compiler的_plugins中
Tapable.prototype.plugin = function plugin(name, fn) {
  if(Array.isArray(name)) {
    name.forEach(function(name) {
      this.plugin(name, fn);
    }, this);
    return;
  }
  if(!this._plugins[name]) this._plugins[name] = [fn];
  else this._plugins[name].push(fn);
}

Tapable.prototype.apply = function apply() {
  for(var i = 0; i < arguments.length; i++) {
    arguments[i].apply(this);
  }
}
```

Tapable原型的`plugin`方法，在第三方plugin的apply实现内使用，

#### Hook
