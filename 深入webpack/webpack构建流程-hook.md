## Hook


#### Hook基类的定义
上面已经提到，在实例化`compile`时，`compiler`的`hooks`上维护了非常多不同类的`hooks`实例，这些钩子都继承自`Hook`：
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

  tapAsync() {}
  tapPromise()) {}

  _runRegisterInterceptors(options) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        const newOptions = interceptor.register(options);
        if (newOptions !== undefined) options = newOptions;
      }
    }
    return options;
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
