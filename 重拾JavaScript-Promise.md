在实现`Promise`之前, `Promise`有哪些规范
- 链式调用
- 异常捕获
- Promise.all 和 Promise.race
- Promise 标准

#### Promise类
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

class MyPromise {
  constructor (handle) {
    // 初始状态为 PENDING
    this.state = PENDING
    
    this.value = undefined

    this.reason = undefined

    try {
      handle(this.resolve, this.reject)
    } catch (err) {
      this.reject(err)
    }
  }

  resolve () {
    if (this.state === PENDING) {
      // 将 Promise对象 状态 置为 FULFILLED
      this.state = FULFILLED
    }
  }

  reject () {
    if (this.state === PENDING) {
      // 将 Promise对象 状态 置为 FULFILLED
      this.state = REJECTED
    }
  }
}
```

下面我们需要实现`then`方法，这是`Promise`一个非常实用的特性：

```js
// Promise对象的三种状态
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
  constructor (handle) {
    // 初始状态为 PENDING
    this.state = PENDING
    
    // value和reason存放Promise对象状态改变后的结果、错误原因
    this.value = undefined
    this.reason = undefined

    // 存放Promise对象状态变为 FULFILLED 后执行的回调函数
    this.onResolvedCallbacks = []

    // 存放Promise对象状态变为 REJECTED 后执行的回调函数
    this.onRejectedCallbacks = []

    try {
      handle(this.resolve, this.reject)
    } catch (err) {
      this.reject(err)
    }
  }

  resolve (value) {
    if (this.state === PENDING) {
      // 将 Promise对象 状态 置为 FULFILLED
      this.state = FULFILLED

      // 储存 状态变为FULFILLED后对外
      this.value = value
    }
  }

  reject (reason) {
    if (this.state === PENDING) {
      // 将 Promise对象 状态 置为 FULFILLED
      this.state = REJECTED

      // 储存失败的值
      this.reason = reason
    }
  }
}
```

ssssss

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
    // 状态初始化
    this._status = PENDING
    this._value = undefined

    // then 支持多次调用，维护两个数组用于存储then方法注册的回调函数
    this._fulFilledQueues = []
    this._rejectedQueues = []
    try {
      handle(this._resolve.bind(this), this._reject.bind(this))
    } catch (err) {
      this._reject(err)
    }
  }

  _resolve (val) {
    if (this._status !== PENDING) return

    const run = () => {
      this._status = FULFILLED
      this._value = val
      let cb = undefined
      while (cb = this._fulFilledQueues.shift()) {
        cb(val)
      }

      setTimeout(() => run(), 0)
    }
  }
  _reject (err) {
    if (this._status !== PENDING) return

    const run = () => {
      this._status = REJECTED
      this._value = err
      let cb = undefined
      while (cb = this._rejectedQueues.shift()) {
        cb(err)
      }
    }

    setTimeout(() => run(), 0)
  }

  then (onFulfilled, onRejected) {
    const { _status, _value } = this

    // then 返回的是一个Promise，因为需要实现链式调用
    return new MyPromise((onFulfilledNext, onRejectedNext) => {
      const fulfilled = value => {
        try {
          if (!isFunction(onFulfilled)) {
            onFulfilledNext(value)
          } else {
            // 如果onFulfilled是一个方法，则根据方法的返回值是否为Promise对象处理
            const res = onFulfilled(value)
            if (res instanceof MyPromise) {
              // 返回值是Promise对象，则在返回的Promise对象状态改变后执行回调
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              // 返回值不是Promise，直接作为参数传入下一个then的回调，并立即执行回调函数
              onFulfilledNext(res)
            }
          }
        } catch (err) {
          onRejectedNext(err)
        }
      }

      const rejected = error => {
        try {
          if (!isFunction(onRejected)) {
            onRejectedNext(error)
          } else {
            const res = onRejected(error)
            if (res instanceof MyPromise) {
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              onRejectedNext(res)
            }
          }
        } catch (err) {
          onRejectedNext(err)
        }
      }
      switch (_status) {
        case PENDING:
          this._fulFilledQueues.push(fulfilled)
          this._rejectedQueues.push(rejected)
          break
        case FULFILLED:
          fulfilled(_value)
          break
        case REJECTED:
          rejected(_value)
          break
      }
    })
  }
}
```

___
#### 参考
1. [可能是目前最易理解的手写promise](https://juejin.im/post/5dc383bdf265da4d2d1f6b23)
2. [【面试题解析】手动实现Promise](https://juejin.im/post/5e6fbf88e51d45270d532b7f)