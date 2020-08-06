## compiler的hook
在分析`compiler`的实例化过程后，我们知道，`compiler`实例上有两类`hook`：生命周期相关钩子和`compiler._pluginCompat`。

#### Hook类
上面提到的这些钩子都继承自`Hook`：
```js
class Hook {
  constructor(args) {
    this._args = args
    this.taps = []
    this.interceptors = []

    this.call = this._call
    this.promise = this._promise
    this.callAsync = this._callAsync
    this._x = undefined
  }

  // 抽象方法
  compile(options) {
    throw new Error("Abstract: should be overriden");
  }

  _createCall(type) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type: type
    });
  }

  tap(options, fn) {
    if (typeof options === "string") options = { name: options }
    options = Object.assign({ type: "sync", fn: fn }, options)
    options = this._runRegisterInterceptors(options)
    this._insert(options)
  }

  tapAsync(options, fn) {
  	if (typeof options === "string") options = { name: options };
  	options = Object.assign({ type: "async", fn: fn }, options)
  	options = this._runRegisterInterceptors(options)
  	this._insert(options)
  }

  tapPromise(options, fn) {
  	if (typeof options === "string") options = { name: options }
  	options = Object.assign({ type: "promise", fn: fn }, options)
  	options = this._runRegisterInterceptors(options)
  	this._insert(options)
  }

  _runRegisterInterceptors(options) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        const newOptions = interceptor.register(options)
        if (newOptions !== undefined) options = newOptions
      }
    }
    return options
  }

  _insert(item) {
    this._resetCompilation()
    let before
    if (typeof item.before === "string") before = new Set([item.before])
    else if (Array.isArray(item.before)) {
      before = new Set(item.before)
    }
    let stage = 0
    if (typeof item.stage === "number") stage = item.stage
    let i = this.taps.length
    while (i > 0) {
      i--
      const x = this.taps[i]
      this.taps[i + 1] = x
      const xStage = x.stage || 0
      if (before) {
        if (before.has(x.name)) {
          before.delete(x.name)
          continue
        }
        if (before.size > 0) {
          continue
        }
      }
      if (xStage > stage) {
        continue
      }
      i++
      break
    }
    this.taps[i] = item
  }
}

Object.defineProperties(Hook.prototype, {
  _call: {
    value: createCompileDelegate("call", "sync"),
    configurable: true,
    writable: true
  },
  _promise: {
    value: createCompileDelegate("promise", "promise"),
    configurable: true,
    writable: true
  },
  _callAsync: {
    value: createCompileDelegate("callAsync", "async"),
    configurable: true,
    writable: true
  }
})
```

`Hook`类中定义了抽象方法`compile`，需要由子类实现它。

#### 以SyncBailHook为例
```js
class SyncBailHookCodeFactory extends HookCodeFactory {
  content({ onError, onResult, resultReturns, onDone, rethrowIfPossible }) {
    return this.callTapsSeries({
      onError: (i, err) => onError(err),
      onResult: (i, result, next) =>
        `if(${result} !== undefined) {\n${onResult(
          result
        )};\n} else {\n${next()}}\n`,
      resultReturns,
      onDone,
      rethrowIfPossible
    })
  }
}

const factory = new SyncBailHookCodeFactory();

class SyncBailHook extends Hook {
  tapAsync() {
    throw new Error("tapAsync is not supported on a SyncBailHook");
  }

  tapPromise() {
    throw new Error("tapPromise is not supported on a SyncBailHook");
  }

  compile(options) {
    factory.setup(this, options)
    return factory.create(options)
  }
}
```
