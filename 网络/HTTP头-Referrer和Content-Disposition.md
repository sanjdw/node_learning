问题：对于服务端响应的数据为二进制文件(图片、视频、音频、zip...)或者是纯文本，浏览器如何判断是展示资源还是download它?

首先要知道两个HTTP响应头——`content-disposition`和`content-type`

### 1. content-disposition
HTTP响应头部中的`content-disposition`字段用来告知客户端响应的内容应该以何种形式处理，有两种取值：
- `inline`，默认值，告知浏览器在窗口内尝试展示资源
- `attachment`，告知浏览器下载资源

### 2. content-type
HTTP响应头部中的`content-type`字段用来告知客户端实际返回的内容的MIME类型（[更多MIME类型列表](https://www.iana.org/assignments/media-types/media-types.xhtml)）：

常见的：
- application/json
- application/octet-stream
- application/pdf
- application/zip

- font/woff
- text/css
- text/plain
- text/html
- text/javascript
- image/gif
- image/jpeg

浏览器根据资源的响应头`content-disposition`、`content-type`来决定展示资源还是download：
1. 当`content-disposition`是`attachment`，则下载该资源；
2. 当`content-disposition`是`inline`（默认），则浏览器根据`content-type`类型来做对应处理：
  - 当`content-type`为`application/json`、`text/html`、`text/css`、`image/jpeg`等浏览器可以识别的资源类型，则浏览器作展示处理
  - 当`content-type`为`application/octet-stream`、`application/zip`等浏览器认为无法处理的资源类型，则浏览器作下载处理

在实际的项目开发中，比如遇到导出订单列表为excel保存到用户本地的需求时，只需要服务端在响应的文件流头部设置即可：
```http
content-disposition: attachment;filename=****.xls
```

以上策略是在浏览器导航栏输入资源url的场景下作用的，但有些场景服务端提供的接口是需要POST方法请求的，因此：
1. 对于支持GET方法请求的资源，服务端设置好响应头`content-disposition: attachment`后，前端通过JavaScript新开tab窗口即可实现download；
2. 对于其他方法如POST请求的资源，前端通过ajax请求资源，将http响应体处理为blob对象结合HTML5 a元素的download属性下载：

```js
request
  .post('*****')
  .then(res => res.blob())
  .then(res => {
    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = downloadName
    a.href = blobUrl
    a.click()
  })
```
这种方式同样适用于GET请求的场景。
