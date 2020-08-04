## 实例化compiler

compiler = new Compiler(options.context)

`Compiler`模块是webpack的支柱引擎，它通过CLI或Node API传递的所有选项，创建出一个compilation实例。它继承自`Tapable`类，以便注册和调用插件。大多数面向用户的插件首，会先在`Compiler`上注册。

#### Compiler
```js
class Compiler extends Tapable {
  constructor () {
    super()
    this.hooks = {
      done: new AsyncSeriesHook(["stats"]),
      beforeRun: new AsyncSeriesHook(["compiler"]),
      run: new AsyncSeriesHook(["compiler"]),
      emit: new AsyncSeriesHook(["compilation"]),
      compile: new SyncHook(["params"]),
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
