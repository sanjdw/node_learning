```
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

const isFunction = fn => typeof fn === 'function'

class MyPromise {
  constructor (handle) {
    if (!isFunction(handle)) {
      throw new Error('MyPromise hanle is not a function')
    }
  }
  // 状态初始化
  this._status = PENDING
  this._value = undefined

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
}
```