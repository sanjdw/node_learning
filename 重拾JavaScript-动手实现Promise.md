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

    fucntion reject () {
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
    this.onResolvedCallbacks = []

    // 存放 Promise对象状态变为REJECTED后 需要执行的回调函数
    this.onRejectedCallbacks = []

    function resolve (value) {
      if (this.state === PENDING) {
        this.state = FULFILLED
        this.data = value
      }
    }

    function reject (reason) {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.data = reason
      }
    }

    try {
      handle(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then (onFulfilled, onRejected) {
    const self = this
    // 首先对onFulfilled、onRejected做方法校验
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : function () {}
    onRejected = isFunction(onRejected) ? onRejected : function () {}

    if (this.state === PENDING) {
      return new MyPromise(function (resolve, reject){
        // todo
      })
    }

    if (this.state === FULFILLED) {
      // onFulfilled、onFulfilled 是用户输入，可能会出错，用try-catch处理
      return new MyPromise(function (resolve, reject){
        try {
          // result：通过then方法注册的onFulfilled方法的返回值
          const result = onFulfilled(self.data)
          if (result instanceof MyPromise) {
            // result 是Promise对象
            result.then(resolve, reject)
          } else {
            // result是空 或 result不是Promise对象
            // 1.将新的返回的Promise对象状态置为Fulfilled
            // 2.将result作为参数传递出去
            resolve(result)
          }
        } catch (err) {
          reject(err)
        }
      })
    }

    if (this.state === REJCTED) {
      return new MyPromise(function (resolve, reject){
        try {
          const result = onRejected(self.data)
          if (result instanceof MyPromise) {
            result.then(resolve, reject)
          } else {
            reject(result)
          }
        } catch (err) {
          reject(err)
        }      
      })
    }
  }
}
```

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
}
```

___
#### 参考
1. [可能是目前最易理解的手写promise](https://juejin.im/post/5dc383bdf265da4d2d1f6b23)
2. [【面试题解析】手动实现Promise](https://juejin.im/post/5e6fbf88e51d45270d532b7f)