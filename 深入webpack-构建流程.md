## options 处理
options = new WebpackOptionsDefaulter().process(options)

## 实例化compiler
#### 1. compiler = new Compiler(options.context)
```js
class Compiler extends Tapable {
  constructor () {
    super()
    this.hooks = {
      run,
      compile,
      ...
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
    this.resolvers = {
      normal,
      loader,
      context
    }
  }

}

function Tapable () {
  this._pluginCompat = new SyncBailHook(["options"])
  this._pluginCompat.tap({}, op => {})
  this._pluginCompat.tap(...)
}
Tapable.prototype.plugin = ...
Tapable.prototype.apply = ...


class SyncBailHook extends Hook {
	compile(options) {
		factory.setup(this, options);
		return factory.create(options);
	}
}

class Hook {
  constructor(args) {
		if (!Array.isArray(args)) args = [];
		this._args = args;
		this.taps = [];
		this.interceptors = [];
		this.call = this._call;
		this.promise = this._promise;
		this.callAsync = this._callAsync;
		this._x = undefined;
	}

  tap(options, fn) {
		options = Object.assign({ type: "sync", fn: fn }, options);

		options = this._runRegisterInterceptors(options);
    // 插入taps队列
		this._insert(options);
  }

  tapAsync () {}
  tapPromise () {}
  intercept () {}
  _runRegisterInterceptors(options) {
		for (const interceptor of this.interceptors) {
			if (interceptor.register) {
				const newOptions = interceptor.register(options);
				if (newOptions !== undefined) options = newOptions;
			}
		}
		return options;
	}
  _insert () {}
  ....
}
```

## new NodeEnvironmentPlugin().apply(compiler)
```js
class NodeEnvironmentPlugin {
	apply(compiler) {
		compiler.infrastructureLogger = createConsoleLogger(
			Object.assign(
				{
					level: "info",
					debug: false,
					console: nodeConsole
				},
				this.options.infrastructureLogging
			)
		);
		compiler.inputFileSystem = new CachedInputFileSystem(
			new NodeJsInputFileSystem(),
			60000
		);
		const inputFileSystem = compiler.inputFileSystem;
		compiler.outputFileSystem = new NodeOutputFileSystem();
		compiler.watchFileSystem = new NodeWatchFileSystem(
			compiler.inputFileSystem
		);
		compiler.hooks.beforeRun.tap("NodeEnvironmentPlugin", compiler => {
			if (compiler.inputFileSystem === inputFileSystem) inputFileSystem.purge();
		});
	}
}
```

## plugin处理
```js
if (options.plugins && Array.isArray(options.plugins)) {
  for (const plugin of options.plugins) {
    if (typeof plugin === "function") {
      plugin.call(compiler, compiler);
    } else {
      plugin.apply(compiler);
    }
  }
}
```

## 	compiler.hooks.environment.call()

## compiler.hooks.afterEnvironment.call()

## compiler.options = new WebpackOptionsApply().process(options, compiler)
