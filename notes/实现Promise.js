const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

const isFunction = fn => typeof fn === 'function'

class MyPromise {
  constructor (handle) {
    if (!isFunction(handle)) {
      throw new Error('MyPromise hanle is not a function')
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
            const res = onFulfilled(value)
            if (res instanceof MyPromise) {
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              onFulfilledNext(res)
            }
          }
        } catch (err) {
          onRejectedNext(err)
        }
      }

      switch (_status) {
        case PENDING:
          this._fulFilledQueues.push(onFulfilled)
          this._rejectedQueues.push(onRejected)
          break
        case FULFILLED:
          onFulfilled(_value)
          break
        case REJECTED:
          onRejected(_value)
          break
      }
    })
  }
}
