## compiler的hook
<!-- webpack中最核心的负责编译的`compiler`和负责创建`bundles`的`compilation`都是`Tapable`的实例。 -->
webpack本质是事件流机制，类似于发布订阅模式，实现这个的核心就是`Tapable`，而`Tapable`有两个重要组成：
1. hook
2. HookCodeFactory

在分析`compiler`的实例化过程后，我们已经知道，`compiler`实例上有两处`hook`：生命周期相关钩子`compiler.hooks`和`compiler._pluginCompat`。

`Tapable`的核心功能就是控制一系列注册回调之间的执行流控制，比如注册了在一个钩子上注册三个回调，可以控制它们是并发的，或者是同步依次执行的，又或者其中一个出错后，后面的回调就不执行了。为此，`Tapable`实现了以下钩子：

![Tapable Hooks](https://pic.downk.cc/item/5f2fb91814195aa594d2c25b.jpg)

`Tapable`的钩子大致可以分为两类：
#### 同步钩子
1. `SyncHook`：串同步行，不关心回调方法的返回，在触发钩子之后，会按照注册的先后顺序依次执行回调
2. `SyncBailHook`：同步串行，如果当前回调方法有返回值，则跳过剩下未执行的回调方法
3. `SyncWaterfallHook`：同步串行，前一个回调方法的返回值作为参数传递给下一个回调
4. `SyncLoopHook`：同步串行，如果当前回调有返回值，则继续执行这个回调方法，否则执行后续的回调方法

#### 异步钩子
1. `AsyncParallelHook`：异步并行，不关心回调方法的返回
2. `AsyncParallelBailHook`：异步并行，如果当前回调方法有返回值，则跳过剩下未执行的回调方法
3. `AsyncSeriesHook`：异步串行，不关心回调方法的参数
4. `AsyncSeriesBailHook`：异步串行，回调方法的参数不为空，就会直接执行callAsync等触发函数绑定的回调函数
5. `AsyncSeriesLoopHook`：异步串行
6. `AsyncSeriesWaterfallHook`：异步串行，前一个回调方法的返回值作为参数传递给下一个回调

#### Hook类
上面提到的所有钩子都继承自`Hook`：
```js
class Hook {
  constructor(args) {
    // 实例化钩子时参数处理为数组类型
    if (!Array.isArray(args)) args = []
    this._args = args
    // 维护在钩子上注册的回调任务
    this.taps = []

    // 拦截器列表
    this.interceptors = []

    // 触发钩子的方法
    this.call = this._call
    this.promise = this._promise
    this.callAsync = this._callAsync

    this._x = undefined
  }

  // 抽象方法，在子类中重写此方法
  compile(options) {
    throw new Error("Abstract: should be overriden")
  }

  // 调用子类的compiler方法生成各自的call、callAsync、promise方法
  _createCall(type) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type: type
    })
  }

  // 注册回调
  tap(options, fn) {
    if (typeof options === "string") options = { name: options }
    options = Object.assign({ type: "sync", fn: fn }, options)
    options = this._runRegisterInterceptors(options)

    // 将回调加塞到taps中
    this._insert(options)
  }

  tapAsync(options, fn) {
    if (typeof options === "string") options = { name: options }
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

  // 在将回调任务加塞进taps之前，遍历拦截器interceptors列表处理回调任务
  _runRegisterInterceptors(options) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        const newOptions = interceptor.register(options)
        if (newOptions !== undefined) options = newOptions
      }
    }
    return options
  }

  // 添加拦截器
  intercept(interceptor) {
    this._resetCompilation()
    // 向interceptors加塞拦截器
    this.interceptors.push(Object.assign({}, interceptor))

    // 为已经添加到taps中的回调任务进行拦截处理
    if (interceptor.register) {
      for (let i = 0; i < this.taps.length; i++)
        this.taps[i] = interceptor.register(this.taps[i])
    }
  }

  // 重置触发方法
  _resetCompilation() {
    this.call = this._call
    this.callAsync = this._callAsync
    this.promise = this._promise
  }

  // 加塞回调任务
  // 通过options中的before、stage来对当前注册的回调进行优先级的配置
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

function createCompileDelegate(name, type) {
  return function lazyCompileHook(...args) {
    this[name] = this._createCall(type)
    return this[name](...args)
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

总结一下，`Hook`类做了以下几件事情：
1. 定义回调队列`hook.taps`、拦截器队列`taps.interceptors`等属性
2. 定义了抽象方法`compile`，需要在子类中去重写它，用于生成触发钩子的方法：`call`、`callAsync`、`promise`
3. 定义了三种在钩子上注册回调的方法：`tap`、`tapAsync`、`tapPromise`
4. 在原型`Hook.prototype`上添加了`_call`、`_promise`、`_callAsync`方法

我们知道，`Hook`需要实现不同类型的钩子——同步、异步、串行、并行等特性，而留意`tap`、`tapAsync`、`tapPromise`可以发现，这三个注册回调方法大致类似，只是推入`taps`的回调的参数略有不同（`options.type`不同），那么不同钩子的特性显然就要依赖触发钩子回调的方法`call`、`callAsync`、`promise`去实现了。

回顾`Hook`的代码，我们发现`Hook`上并未直接定义`call`、`callAsync`、`promise`方法，而是让它们指向了下划线开头的同名函数：
```js
this.call = this._call
this.promise = this._promise
this.callAsync = this._callAsync
```

接下来就来看一看`Hook.prototype`上的这三个通过属性拦截器定义的方法：
```js
class Hook {
  constructor () {}

  _createCall(type) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type: type
    })
  }
}

function createCompileDelegate(name, type) {
  return function lazyCompileHook(...args) {
    this[name] = this._createCall(type)
    return this[name](...args)
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

这里通过属性拦截器的方式为`Hook.prototype`定义了`_call`、`_callAsync`、`_promise`方法，它们是通过`createCompileDelegate`方法生成的函数。以`_call`为例，`createCompileDelegate('call', 'sync')`方法会将钩子实例的`call`方法重写为执行`_createCall('sync')`返回的结果：
```js
this['call'] = this._createCall('sync')
return this['call'](...args)
```

这里调用了`_createCall`来生成用于重写钩子的`call`的方法，`_createCall`又调用了子类的`compile`方法。这里先不继续分析`compile`方法，回头来看前面这几步操作，在初始化钩子时：
```js
this.call = this._call
```

使得：
```js
this._call = function lazyCompileHook(...args) {
  this['call'] = this._createCall('sync')
  return this['call'](...args)
}
```

这意味着，第一次通过`_call`调用钩子的这个`call`方法，是通过`_createCall` -> `compile`生成的。后面再调用钩子的`call`方法，就不要通过`_call`了，因为第一次调用`call`的同时重写了`call`。

再次回到`Hook`中，在注册回调的方法`tap`/`tapAsync`/`tapPromise`以及注册拦截器的`intercept`方法中，发现它们都会调用`_resetCompilation`：
```js
_resetCompilation() {
  this.call = this._call
  this.callAsync = this._callAsync
  this.promise = this._promise
}
```

这里有两个问题：
1. 一是`_call`/`_callAsync`/`_promise`方法没有直接被定义在原型上，而是采用属性拦截器的方式？
2. 二是`call`/`callAsync`/`promise`等方法为什么不直接在子类中实现，而是采用这种通过在`Hook`中调用子类的`compile`的方式生成，且在注册回调、拦截器时重新赋值？

简单的说是因为插件彼此有着联系，所以用了这么多类型的钩子来控制这些联系，一个钩子上每次有新的回调或拦截器被注册时，就要重新排布回调和拦截器的调用顺序，因此需要重写`call`方法，并通过属性拦截器将生成`call`的方法记录在`_call`上。这个逻辑后面还会再次讲到，不能理解的话暂时先记住。

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

const factory = new SyncBailHookCodeFactory()

class SyncBailHook extends Hook {
  // 禁止使用注册异步回调方法
  tapAsync() {
    throw new Error("tapAsync is not supported on a SyncBailHook")
  }

  tapPromise() {
    throw new Error("tapPromise is not supported on a SyncBailHook")
  }

  compile(options) {
    factory.setup(this, options)
    return factory.create(options)
  }
}
```

在这里，正如前文已经提到的，我们发现子类中确实没有重写父类的`call`/`callAsync`/`promise`方法：
1. 钩子触发回调的方法通过`Hook`的`_createCall`调用子类的`compile`生成
2. 钩子根据各自的需要继承了父类`Hook`的注册回调方法同时禁用了部分不支持的注册回调的方法

需要关注的是子类的`compiler`方法：
```js
compile(options) {
  factory.setup(this, options)
  return factory.create(options)
}
```

前文已经提到过，`comile`方法是用于生成`call`/`callAsync`/`promise`方法的。在这里可以看到，不同的钩子在调用`compile`方法时使用了不同的工厂类实例的`create`方法。

在`SyncBailHookCodeFactory`定义中可以发现它只提供了`content`方法，其他变量和方法继承自`HookCodeFactory`。

#### HookCodeFactory
```js
class HookCodeFactory {
  constructor(config) {
    this.config = config
    this.options = undefined
    this._args = undefined
  }

  create(options) {
    this.init(options)
    let fn
    switch (this.options.type) {
      case "sync":
        fn = new Function(
          this.args(),
          '"use strict";\n' +
            this.header() +
            this.content({
              onError: err => `throw ${err};\n`,
              onResult: result => `return ${result};\n`,
              resultReturns: true,
              onDone: () => "",
              rethrowIfPossible: true
            })
        )
        break
      case "async":
        fn = new Function(
          this.args({
            after: "_callback"
          }),
          '"use strict";\n' +
            this.header() +
            this.content({
              onError: err => `_callback(${err});\n`,
              onResult: result => `_callback(null, ${result});\n`,
              onDone: () => "_callback();\n"
            })
        )
        break
      case "promise":
        let errorHelperUsed = false
        const content = this.content({
          onError: err => {
            errorHelperUsed = true
            return `_error(${err});\n`
          },
          onResult: result => `_resolve(${result});\n`,
          onDone: () => "_resolve();\n"
        })
        let code = ""
        code += '"use strict";\n'
        code += "return new Promise((_resolve, _reject) => {\n"
        if (errorHelperUsed) {
          code += "var _sync = true;\n"
          code += "function _error(_err) {\n"
          code += "if(_sync)\n"
          code += "_resolve(Promise.resolve().then(() => { throw _err; }));\n"
          code += "else\n"
          code += "_reject(_err);\n"
          code += "};\n"
        }
        code += this.header()
        code += content
        if (errorHelperUsed) {
          code += "_sync = false;\n"
        }
        code += "});\n"
        fn = new Function(this.args(), code)
        break
    }
    this.deinit()
    return fn
  }

  setup(instance, options) {
    instance._x = options.taps.map(t => t.fn)
  }

  /**
   * @param {{ type: "sync" | "promise" | "async", taps: Array<Tap>, interceptors: Array<Interceptor> }} options
   */
  init(options) {
    this.options = options
    this._args = options.args.slice()
  }

  deinit() {
    this.options = undefined
    this._args = undefined
  }

  header() {
    let code = ""
    if (this.needContext()) {
      code += "var _context = {};\n"
    } else {
      code += "var _context;\n"
    }
    code += "var _x = this._x;\n"
    if (this.options.interceptors.length > 0) {
      code += "var _taps = this.taps;\n"
      code += "var _interceptors = this.interceptors;\n"
    }
    for (let i = 0; i < this.options.interceptors.length; i++) {
      const interceptor = this.options.interceptors[i];
      if (interceptor.call) {
        code += `${this.getInterceptor(i)}.call(${this.args({
          before: interceptor.context ? "_context" : undefined
        })});\n`
      }
    }
    return code
  }

  needContext() {
    for (const tap of this.options.taps) if (tap.context) return true
    return false
  }

  callTap(tapIndex, { onError, onResult, onDone, rethrowIfPossible }) {
    let code = ""
    let hasTapCached = false
    for (let i = 0; i < this.options.interceptors.length; i++) {
      const interceptor = this.options.interceptors[i]
      if (interceptor.tap) {
        if (!hasTapCached) {
          code += `var _tap${tapIndex} = ${this.getTap(tapIndex)};\n`
          hasTapCached = true
        }
        code += `${this.getInterceptor(i)}.tap(${
          interceptor.context ? "_context, " : ""
        }_tap${tapIndex});\n`
      }
    }
    code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`
    const tap = this.options.taps[tapIndex]
    switch (tap.type) {
      case "sync":
        if (!rethrowIfPossible) {
          code += `var _hasError${tapIndex} = false;\n`
          code += "try {\n"
        }
        if (onResult) {
          code += `var _result${tapIndex} = _fn${tapIndex}(${this.args({
            before: tap.context ? "_context" : undefined
          })});\n`
        } else {
          code += `_fn${tapIndex}(${this.args({
            before: tap.context ? "_context" : undefined
          })});\n`
        }
        if (!rethrowIfPossible) {
          code += "} catch(_err) {\n"
          code += `_hasError${tapIndex} = true;\n`
          code += onError("_err")
          code += "}\n"
          code += `if(!_hasError${tapIndex}) {\n`
        }
        if (onResult) {
          code += onResult(`_result${tapIndex}`)
        }
        if (onDone) {
          code += onDone()
        }
        if (!rethrowIfPossible) {
          code += "}\n"
        }
        break
      case "async":
        let cbCode = ""
        if (onResult) cbCode += `(_err${tapIndex}, _result${tapIndex}) => {\n`
        else cbCode += `_err${tapIndex} => {\n`
        cbCode += `if(_err${tapIndex}) {\n`
        cbCode += onError(`_err${tapIndex}`)
        cbCode += "} else {\n"
        if (onResult) {
          cbCode += onResult(`_result${tapIndex}`)
        }
        if (onDone) {
          cbCode += onDone()
        }
        cbCode += "}\n"
        cbCode += "}"
        code += `_fn${tapIndex}(${this.args({
          before: tap.context ? "_context" : undefined,
          after: cbCode
        })});\n`
        break
      case "promise":
        code += `var _hasResult${tapIndex} = false;\n`
        code += `var _promise${tapIndex} = _fn${tapIndex}(${this.args({
          before: tap.context ? "_context" : undefined
        })});\n`
        code += `if (!_promise${tapIndex} || !_promise${tapIndex}.then)\n`
        code += `  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${tapIndex} + ')');\n`
        code += `_promise${tapIndex}.then(_result${tapIndex} => {\n`
        code += `_hasResult${tapIndex} = true;\n`
        if (onResult) {
          code += onResult(`_result${tapIndex}`)
        }
        if (onDone) {
          code += onDone()
        }
        code += `}, _err${tapIndex} => {\n`
        code += `if(_hasResult${tapIndex}) throw _err${tapIndex};\n`
        code += onError(`_err${tapIndex}`)
        code += "});\n"
        break
    }
    return code
  }

  callTapsSeries({
    onError,
    onResult,
    resultReturns,
    onDone,
    doneReturns,
    rethrowIfPossible
  }) {
    if (this.options.taps.length === 0) return onDone()
    const firstAsync = this.options.taps.findIndex(t => t.type !== "sync")
    const somethingReturns = resultReturns || doneReturns || false
    let code = ""
    let current = onDone
    for (let j = this.options.taps.length - 1; j >= 0; j--) {
      const i = j
      const unroll = current !== onDone && this.options.taps[i].type !== "sync"
      if (unroll) {
        code += `function _next${i}() {\n`
        code += current()
        code += `}\n`
        current = () => `${somethingReturns ? "return " : ""}_next${i}();\n`
      }
      const done = current
      const doneBreak = skipDone => {
        if (skipDone) return ""
        return onDone()
      }
      const content = this.callTap(i, {
        onError: error => onError(i, error, done, doneBreak),
        onResult:
          onResult &&
          (result => {
            return onResult(i, result, done, doneBreak)
          }),
        onDone: !onResult && done,
        rethrowIfPossible:
          rethrowIfPossible && (firstAsync < 0 || i < firstAsync)
      })
      current = () => content
    }
    code += current()
    return code
  }

  callTapsLooping({ onError, onDone, rethrowIfPossible }) {
    if (this.options.taps.length === 0) return onDone()
    const syncOnly = this.options.taps.every(t => t.type === "sync")
    let code = ""
    if (!syncOnly) {
      code += "var _looper = () => {\n"
      code += "var _loopAsync = false;\n"
    }
    code += "var _loop;\n"
    code += "do {\n"
    code += "_loop = false;\n"
    for (let i = 0; i < this.options.interceptors.length; i++) {
      const interceptor = this.options.interceptors[i]
      if (interceptor.loop) {
        code += `${this.getInterceptor(i)}.loop(${this.args({
          before: interceptor.context ? "_context" : undefined
        })});\n`
      }
    }
    code += this.callTapsSeries({
      onError,
      onResult: (i, result, next, doneBreak) => {
        let code = ""
        code += `if(${result} !== undefined) {\n`
        code += "_loop = true;\n"
        if (!syncOnly) code += "if(_loopAsync) _looper();\n"
        code += doneBreak(true)
        code += `} else {\n`
        code += next()
        code += `}\n`
        return code
      },
      onDone:
        onDone &&
        (() => {
          let code = ""
          code += "if(!_loop) {\n"
          code += onDone()
          code += "}\n"
          return code
        }),
      rethrowIfPossible: rethrowIfPossible && syncOnly
    })
    code += "} while(_loop);\n"
    if (!syncOnly) {
      code += "_loopAsync = true;\n"
      code += "};\n"
      code += "_looper();\n"
    }
    return code
  }

  callTapsParallel({ onError, onResult, onDone, rethrowIfPossible, onTap = (i, run) => run() }) {
    if (this.options.taps.length <= 1) {
      return this.callTapsSeries({
        onError,
        onResult,
        onDone,
        rethrowIfPossible
      })
    }
    let code = ""
    code += "do {\n"
    code += `var _counter = ${this.options.taps.length};\n`
    if (onDone) {
      code += "var _done = () => {\n"
      code += onDone()
      code += "};\n"
    }
    for (let i = 0; i < this.options.taps.length; i++) {
      const done = () => {
        if (onDone) return "if(--_counter === 0) _done();\n"
        else return "--_counter;"
      }
      const doneBreak = skipDone => {
        if (skipDone || !onDone) return "_counter = 0;\n"
        else return "_counter = 0;\n_done();\n"
      }
      code += "if(_counter <= 0) break;\n"
      code += onTap(
        i,
        () =>
          this.callTap(i, {
            onError: error => {
              let code = ""
              code += "if(_counter > 0) {\n"
              code += onError(i, error, done, doneBreak)
              code += "}\n"
              return code
            },
            onResult:
              onResult &&
              (result => {
                let code = ""
                code += "if(_counter > 0) {\n"
                code += onResult(i, result, done, doneBreak)
                code += "}\n"
                return code
              }),
            onDone:
              !onResult &&
              (() => {
                return done()
              }),
            rethrowIfPossible
          }),
        done,
        doneBreak
      )
    }
    code += "} while(false);\n"
    return code
  }

  args({ before, after } = {}) {
    let allArgs = this._args
    if (before) allArgs = [before].concat(allArgs)
    if (after) allArgs = allArgs.concat(after)
    if (allArgs.length === 0) {
      return ""
    } else {
      return allArgs.join(", ")
    }
  }

  getTapFn(idx) {
    return `_x[${idx}]`
  }

  getTap(idx) {
    return `_taps[${idx}]`
  }

  getInterceptor(idx) {
    return `_interceptors[${idx}]`
  }
}
```

在`HookCodeFactory`中我们找到了`setup`方法的定义：
```js
setup(instance, options) {
  instance._x = options.taps.map(t => t.fn)
}
```

结合`SyncBailHook`的`compile`方法：
```js
compile(options) {
  // this指向钩子实例
  factory.setup(this, options)
  return factory.create(options)
}
```

这里再次遇到了`Hook`构造函数中的`_x`，现在我们知道它是什么了——执行钩子的工厂类实例的`setup`方法时，在钩子上注册的回调会被全部推入钩子的`_x`数组中。

接着是`create`方法，这里通过`new Function`来创建`call`/`callAsync`/`promise`的静态脚本。
