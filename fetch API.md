传统的 `AJAX (Asynchronous JavaScript and XML)` 是通过`XMLHttpRequest/ActiveXObject` 来实现的，这种方式存在了很久，而 `XHR` 的API设计非常粗糙，且不符合职责分离的原则，为了修正上述提到的缺陷，`fetch` 出现了。

```js
// XHR 的写法
let xhr = null
if (window.XMLHttpRequest) {
  xhr = new XMLHttpRequest()
} else if (window.ActiveXObject) {
  try {
    xhr = new ActiveXObject('Msxml2.XMLHTTP')
  } catch (e) {
    xhr = new ActiveXObject('Microsoft.XMLHTTP')
  }
}
xhr.open('GET', url)

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText)
  }
}

xhr.send()

// fetch
fetch(url)
  .then(response => {
    if (response.ok) {
      return response.json()
    }
  })
  .then(data => {
    console.log(data)
  })
  .catch(e => {
    console.log("Oops, error:", e)
  })
```

显然，从上面的代码中可以看到 `fetch` 具有语法简洁、
基于标准 `Promise` 实现、支持 `async/await` 等优点。同时，作为原生的底层API，`fetch` 也存在以下缺陷：

#### 1. 兼容问题
浏览器支持率不是很好，需要借助 `polyfill` 兼容各浏览器。

#### 2. 错误处理
`fetch` 请求会返回一个 `Promise` 对象，只有在遇到网络错误的时候（比如用户网络断开连接或请求的域名无法解析等情况）才会 `reject` 这个 `Promise`，只要服务器能够返回HTTP响应（即使HTTP响应的状态码是404、500），`Promise` 对象一定是 `resolved` 的状态。

需要通过 response.ok 判断请求是否响应成功：

```js
fetch('xx.png')
  .then(response => {
    if (response.ok) {
      console.log('ok')
    }
    console.log('always excute')
  })
  .catch(() => {
    console.log('error')
  })
```

#### 3. cookie
`fetch` 请求默认不带 `cookie`， 需要配置credentials:
```js
fetch(url, {
  credentials: 'include',
})
```

#### 4. 取消请求
`fetch` 不支持 `abort`，比如：
```js
xhr.abort()
```
可以取消一个 `XHR` 请求，而 `fetch` 请求一旦被发起，只能等待被 `resolve` 或 `reject`。

#### 5. 不支持检测请求进度
对于 `XHR` 来说，可以通过 `xhr.onprogress` 的回调来检测请求的进度，而 `fetch` 无原生支持。
