传统的 `AJAX (Asynchronous JavaScript and XML)` 是通过`XMLHttpRequest/ActiveXObject` 来实现的，这种方式存在了很久，而 `XHR` 的API设计非常粗糙，且不符合职责分离的原则，为了修正上述提到的缺陷，`fetch` 也就出现了。

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

显然，从上面的代码中可以看出 `fetch` 具有语法简洁、
基于标准 `Promise` 实现、支持 `async/await` 等优点。但是，作为原生的底层API，`fetch` 同时也存在以下缺陷：

### 1. 兼容问题
浏览器端的支持率不是很友好，在某些低版本的Firefox、Chrome中，以及IE、Edge、Safari中均没不被支持，因此需要借助 `polyfill` 兼容各浏览器。

### 2. 错误处理
`fetch` 请求会返回一个 `Promise` 对象，只有在遇到网络故障的时候（比如用户网络断开连接或请求的域名无法解析等情况）才会 `reject` 这个 `Promise`，只要服务器能够返回HTTP响应（即使HTTP响应的状态码是代表错误的404、500等），`Promise` 对象一定是 `resolved` 的状态。

需要通过 `response.ok` 判断请求是否响应成功：

```js
fetch('xx.png', {
  headers: new Headers({
    "Content-Type": "image/png",
  })
})
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

### 3. cookie
`fetch` 请求默认不带 `cookie`， 需要配置credentials:
```js
fetch(url, {
  credentials: 'include',
})
```

### 4. 不支持取消请求
`fetch` 不支持 `abort`，比如：
```js
xhr.abort()
```
可以取消一个 `XHR` 请求，而 `fetch` 请求一旦被发起，只能等待被 `resolve` 或 `reject`。

### 5. 不支持检测请求进度
对于 `XHR` 来说，可以通过 `xhr.onprogress` 的回调来检测请求的进度，而 `fetch` 无原生支持。

### 拓展
### request
除了给 `fetch` 传递一个资源地址，还可以通过 `Request` 构造函数来创建一个 `request` 对象作为参数传给 `fetch`：

```js
const myHeaders = new Headers({
  "Content-Type": "image/png",
})

const myInit = {
  method: 'GET',
  headers: myHeaders,
  mode: 'cors',
  cache: 'default'
}

const myRequest = new Request('flowers.jpg', myInit)

fetch(myRequest)
  .then(response => {
    return response.blob()
  }).then(blob => {
    const objectURL = URL.createObjectURL(blob)
    myImage.src = objectURL
  })
```

### response
`fetch` 请求返回一个 `response` 对象，它有以下几个常见属性：
- status: 整数，默认为200，表示response的状态码
- statusText: 字符串，默认值为`OK`,该值与HTTP状态码消息对应
- ok: 布尔值，当response的状态码在200-299之内时为`true`，否则为`false`，用它来判断请求是否响应成功。
- body: 用于暴露一个 `ReadableStream` 类型的body内容。
- bodyUsed: 布尔值，表示`body` 内容是否被读取：`response` 对象的 `body` 只能被读取一次，读取一次之后就被置为`true`，这样设计的目的是为了兼容基于流的API，让应用一次性消费data。

此外，这个 `response` 对象还有以下方法：
- clone: 创建一个 `response` 对象的克隆。
- json: 读取 `response` 对象并将 `bodyUsed` 置为`true`，并返回一个被解析为 `JSON` 格式的 `Promise` 对象。
- text: 读取 `response` 对象并将 `bodyUsed` 置为`true`，并返回一个被解析为 `USVString` 格式的 `Promise` 对象。
- blob: 读取 `response` 对象并将 `bodyUsed` 置为`true`，并返回一个被解析为 `Blob` 格式的 `Promise` 对象。
- formData: 读取 `response` 对象并将 `bodyUsed` 置为`true`，并返回一个被解析为 `FormData` 格式的 `Promise` 对象。

### 总结
作为一个底层API，fetch确实存在很多缺陷。一般在项目开发中，我们很少直接使用fetch来做HTTP请求,而是使用`axios`、`Superagent`等第三方网络请求库，记录以上这些是因为在自己开发某个需求手动加载图片以获得文件流时使用过这个API，在网上找到的资料也都是几年之前的了，并未看到fetch有被广泛使用的讨论，也许对于简单的项目来说它也够用。

___
### 参考:
1. [MDN：使用fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
2. [https://segmentfault.com/a/1190000003810652](https://segmentfault.com/a/1190000003810652)