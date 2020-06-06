本文将总结如何实现一个`Promise`。

### Promise类
首先，结合我们使用`Promise`的姿势：

```js
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(successValue);
  } else {
    reject(failValue);
  }
});
```

我们知道:
1. `Promise`是一个构造函数

2. 构造函数`Promise`会生成一个`Promise`实例对象
    - 一个`Promise`实例对象代表着一个异步操作，它拥有三种状态：`pending`（进行中）、`fulfilled`（已成功）和`rejected`（已失败），只有异步操作的结果，可以决定`Promise`对象的当前状态，任何其他操作都无法改变这个状态

    - 且`Promise`对象状态的改变，只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。状态一旦发生改变，就不会再次发生改变，将永远保持这个结果。

3. 构造函数`Promise`接收一个函数作为参数，该函数的两个参数分别是`resolve`和`reject`。
    - `resolve`和`reject`是两个函数，用来改变`Promise`对象的状态
    
    - `resolve`函数可以将`Promise`的状态从`pending`转为`fulfilled`，并将异步操作的结果作为参数传递出去

    - `reject`函数可以将`Promise`的状态从`pending`转为`rejected`，并将异步操作失败报出的错误作为参数传递出去

用ES 6的写法，我们可以定义这样的一个类：

```js
// Promise对象的三种状态
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
const isFunction = fn => typeof fn === 'function'

class MyPromise {
  constructor (handle) {
    // handle必须为一个方法
    if (!isFunction(handle)) {
      throw new Error('MyPromise handle is not a function')
    }

    // 初始状态为 PENDING
    this.state = PENDING
    
    /*
    * resolve、reject方法作为handle的参数传递给Promise对象，但是不是Promise对象的方法，因此写在constructor内部
    */
    function resolve () {
      if (this.state === PENDING) {
        // 将 Promise对象 状态 置为 FULFILLED
        this.state = FULFILLED
      }
    }

    function reject () {
      if (this.state === PENDING) {
        // 将 Promise对象 状态 置为 FULFILLED
        this.state = REJECTED
      }
    }

    try {
      handle(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
}
```

这里要搞清楚一个问题，`Promise`对象的状态何时发生改变？——`Promise`对象的状态是用户手动改变的，我们向用户创建`Promise`对象时注册的`handle`提供了`resolve`和`reject`方法，由用户决定何时使用`resolve`和`reject`。


### then方法
我们知道，`Promise`对象有一个`then`方法，用来注册这个`Promise`对象状态发生改变后的回调。不论是成功还是失败，通过`then`方法注册的回调方法都要执行。再来看一眼我们是怎么使用`then`的：

```js
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(successValue);
  } else {
    reject(failValue);
  }
});

promise.then(function (data) {
  // ...Promise状态变为FUlFILLED 执行的回调
}, function (err) {
  // ...Promise状态变为REJECTED 执行的回调
}).then(function(data) {
  // ...
}, function(err) {
  // ...
})
```

以上，我们知道：
1. `then`方法可以多次调用，因为每一个`then`方法都会返回一个新的`Promise`对象
2. `then`方法返回的`Promise`对象的状态是不确定的，这取决于用户在注册的回调方法中是如何处理的

基于上面两个目标，我们来实现`then`方法：

```js
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
const isFunction = fn => typeof fn === 'function'

class MyPromise {
  constructor (handle) {
    if (!isFunction(handle)) {
      throw new Error('MyPromise handle is not a function')
    }

    this.state = PENDING
    
    // 储存 Promise对象状态变为FULFILLED或REJECTED后 对外传递的值
    this.data = undefined

    // 存放 Promise对象状态变为FULFILLED后 需要执行的回调函数
    this._onResolvedCallbacks = []

    // 存放 Promise对象状态变为REJECTED后 需要执行的回调函数
    this._onRejectedCallbacks = []

    function resolve (value) {
      if (this.state === PENDING) {
        // 当前Promise状态改变时，按顺序依次执行队列中的任务
        function run () {
          this.state = FULFILLED
          this.data = value

          let cb
          while (cb = this._onResolvedCallbacks.shift()) {
            cb(value)
          }
        }

        setTimeout(function() { run() }, 0)
      }
    }

    function reject (reason) {
      if (this.state === PENDING) {
        function run () {
          this.state = FULFILLED
          this.data = value

          let cb
          while (cb = this._onRejectedCallbacks.shift()) {
            cb(reason)
          }
        }

        setTimeout(function() { run() }, 0)
      }
    }

    try {
      handle(resolve.bind(this), reject.bind(this))
    } catch (err) {
      reject(err)
    }
  }

  then (onFulfilled, onRejected) {
    const self = this
    // onFulfilled、onRejected方法可以缺省
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : function (v) { return v }
    onRejected = isFunction(onRejected) ? onRejected : function (v) { return v}

    // then 方法返回一个新的MyPromise对象
    return new MyPromise(function (resolve, reject) {
      function _resolve (data) {
        // then方法中注册的回调要求是异步执行的
        setTimeout(function () {
          try {
            // result：通过then方法注册的onFulfilled方法的返回
            const result = onFulfilled(self.data)
            if (result instanceof MyPromise) {
              // result本身就是Promise对象
              // 则当result的状态改变时，利用result的回调去改变当前Promise的状态
              result.then(resolve, reject)
            } else {
              // result不是Promise对象，那么将result作为参数，传递给下一个then的成功的回调(onFulfilled)
              resolve(result)
            }
          } catch (err) {
            // 如果then中注册的回调方法执行且抛出了异常，那么就会把这个异常作为参数，传递给下一个then的失败的回调(onRejected)
            reject(resul)
          }
        })
      }

      function _reject (data) {
        setTimeout(function () {
          try {
            const result = onRejected(data)
            if (result instanceof MyPromise) {
              result.then(resolve, reject)
            } else {
              resolve(result)
            }
          } catch (err) {
            reject(resul)
          }
        })
      }

      if (self.state === PENDING) {
        // 之前Promise对象（记为p1）状态未改变
        // 则将 onFulfilled、onRejcted 回调推入p1的_onResolvedCallbacks、_onRejectedCallbacks栈中
        // 在p1的resolve、reject方法中调用这些回调
        self._onResolvedCallbacks.push(_resolve)
        self._onRejectedCallbacks.push(_reject)
      } else if (self.state === FULFILLED) {
        _resolve(self.data)
      } else if (self.state === REJCTED) {
        _reject(self.data)
      }
    })
  }
}
```

`then`方法需要返回一个新的`Promise`对象（记为`p1`），这里主要需要考虑的是何时改变这个`p1`的状态。
- 当在`p1`的`then`中注册的回调返回的刚好也是一个`Promise`对象（记为`p2`）时，则将用于改变`p1`状态的`resolve`/`reject`方法注册到`p2`的`then`回调中，在`p2`状态改变的回调中去改变`p1`的状态
- 当在`p1`的`then`中注册的回调返回的不是`Promsie`对象，则直接将`p1`状态置为`FULFILLED`/`REJECTED`，并将该返回值作为参数返回

### 补充finally、catch
```js
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'


class MyPromise {
  constructor (handle) {
    if (!isFunction(handle)) {
      throw new Error('MyPromise handle is not a function')
    }
    this.state = PENDING
    this.data = undefined

    this._fulFilledQueues = []
    this._rejectedQueues = []
    try {
      handle(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  finally () {}

  catch () {}
}
```

### 静态方法resolve、reject、all、race
