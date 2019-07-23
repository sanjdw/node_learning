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
    this._status = FULFILLED
    this._value = val
  }
  _reject (val) {
    if (this._status !== PENDING) return
    this._status = REJECTED
    this._value = val
  }

  then (onFulfilled, onRejected) {
    const { _status, _value } = this

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
