### 1. 异步控制
> 页面上有一个输入框，两个按钮，A按钮和B按钮，点击A或者B分别会发送一个异步请求，请求完成后，结果会显示在输入框中。

题目要求，用户随机点击A和B多次，输入框按照用户点击的顺序显示A、B对应的请求结果。

利用Promise的链式：
```js
const ButtonA = document.querySelector('#ButtonA')
const ButtonB = document.querySelector('#ButtonB')
const input = document.querySelector('#input')

let _promise = Promise.resolve()

ButtonA.addEventListener('click', () => {
  _promise = _promise.then(() => {
    // A的异步请求
    A_request(res => {
      input.value = res
    })
  })
})
ButtonB.addEventListener('click', () => {
  _promise = _promise.then(() => {
    // B的异步请求
    B_request(res => {
      input.value = res
    })
  })
})
```

### 2. 并发控制
请实现如下函数，可以批量请求数据，所有的URL地址在`urls`数组中，同时可以通过`max`控制请求的并发数，并返回一个Promise：
```js
function sendRequest (urls: string[], max: number) {
  // ...
}
```

利用`Promise.all`：
```js
function sendRequest (urls: string[], max: number) {
  // 已经完成的请求数
  let count = 0
  const len = urls.length
  const result = new Array(len).fill(undefined)

  return new Promise((res, rej) => {
    // 并发max个消费者
    while (count < max) {
      consume()
    }

    function consume () {
      // 同步操作前置！！
      const current = count++
      const url = urls[current]
      
      if (current >= max) {
        result.every(r => r) && resolve(result)
        return
      }

      fetch(url)
        .then(res => {
          result[current] = res
          if (current < len) consume()
        })
        .catch(err => {
          result[current] = err
          if (current < len) consume()
        })
    }
  })
}
```

在每个消费者`consumer`的消费中递归`consume`，将是否所有请求完成的判断交给下一个`consumer`。
