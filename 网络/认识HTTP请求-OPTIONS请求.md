在项目的开发中，如果你有留意的话，有时候会在`devTool`的`network`里看到这种请求——`OPTIONS`，尽管你从未在代码里实现发送这这种请求的逻辑。

`OPTIONS`请求要从`CORS`说起——为了解决跨域资源共享问题，浏览器厂商和标准组织在`HTTP`协议的基础上，提出了`CORS`标准协议。这个标准协议由一组`HTTP Header`构成，用于标识某个资源是否可以被跨域访问。

`CORS`跨域资源共享标准要求，对那些可能对服务端数据产生负作用的`HTTP`请求，**浏览器**必须首先使用`OPTIONS`方法发送一个**预检请求**，由服务端告知浏览器是否允许该跨域请求。在服务端确认允许跨域请求后，浏览器才会将真正的请求发送出去。

那么问题来了，浏览器以什么标准判定一个请求是否可能对服务端数据产生副作用？—— **浏览器将`CORS`请求分为两类：简单请求和非简单请求**，浏览器将非简单请求判定为可能对服务端数据产生副作用的请求处理。

#### 简单请求
成为简单请求需要同时满足下面两个条件：
1. 请求方法是 `HEAD | GET | POST` 之一；
2. `HTTP`请求头信息除了浏览器本身自动设置的部分，人为设置的请求头字段不得超出以下集合：
    - ACCEPT
    - Accept-Language
    - Content-Language
    - Last-Event-ID
    - Content-Type（特殊），如果设置了该头部信息则值必须为`application/x-www-form-urlencoded | multipart/form-data | text/plain`其中之一
    - DPR
    - Downlink
    - Save-Data
    - Viewport-Width
    - Width

#### 非简单请求
与简单请求相对的，满足下面任一件则为非简单请求：
1. 请求方法是下面之一：
    - PUT
    - DELETE
    - CONNECT
    - OPTIONS
    - TRACE
    - PATCH
2. `HTTP`请求头信息人为设置以下集合之外的字段：
    - ACCEPT
    - Accept-Language
    - Content-Language
    - Last-Event-ID
    - Content-Type（特殊），如果设置了该头部信息且值不属于`application/x-www-form-urlencoded | multipart/form-data | text/plain`其中之一
    - DPR
    - Downlink
    - Save-Data
    - Viewport-Width
    - Width

对于`CORS`非简单请求，浏览器会首先自动发出一个方法为`OPTIONS`的预检请求，询问当前网页所在域名是否在服务端的许可名单之中，以及可以使用哪些`HTTP`方法、请求头信息字段。

下面看一段请求：

```js
var settings = {
  "url": "some url",
  "method": "POST",
  "headers": {
    "withCredentials": "true",
  },
  "data": { 
    // balabala..
  }
};

$.ajax(settings).done(response) => {
    // balabala
});
```
由于手动设置了请求头部中的`withCredentials`，浏览器会在发送这个`POST`请求之前先使用`OPTIONS`方法发送一次预检请求：

![一个OPTIONS](https://pic.downk.cc/item/5e75f0189d7d586a54f7f706.jpg)

可以看到预检请求头包含两个特殊字段：
1. Access-Control-Request-Method
    该字段表示浏览器后续将发送的`CORS`非简单请求会用到什么方法，上面的代码中实现的跨域请求是通过`POST`发送的，此处值是 `POST`。
2. Access-Control-Request-Headers
    该字段是一个逗号分割的字符串，表示浏览器后续将发送的`CORS`非简单请求的请求头中额外设置的头部信息。上面的代码中手动设置了`CORS`请求的`withCredentials`头部信息，因此此处是`withCredentials`。

预检请求响应头部则包含以下特殊信息：
1. Access-Control-Allow-Origin
    该字段指定了该资源允许来自哪些域名的请求。
2. Access-Control-Allow-Method
    该字段的值是逗号分隔的字符串，表明对于该资源服务端所支持的`CORS`请求的方法。
3. Access-Control-Allow-Headers
    预检请求头中包含`Access-Control-Request-Headers`字段，对应的响应头中也包含`Access-Control-Allow-Headers`。它是一个逗号分隔的字符串，表明对于该资源服务端支持的`CORS`请求头信息字段。
4. Access-Control-Allow-Credentials
    该字段值是一个布尔值，控制`CORS`请求是否包含cookies。
5. Access-Control-Max-Age
    该字段用来指定本次预检请求的响应结果可以被缓存多久。


#### 总结
![CORS flow](https://pic.downk.cc/item/5e75d9b89d7d586a54e0fd78.jpg)

对于`CORS`非简单请求，浏览器会自动发出方法为`OPTIONS`的预检请求，这意味着——**一个`CORS`非简单请求可能会消耗两个TTL**，作为FE自然要考虑尽量避免这种情况，显然有两个方案：
1. 通过简单请求发送`CORS`请求，在实际开发中就是尽量避免设置那些会触发预检请求的HTTP请求头部信息。
2. 通过设置预检请求响应的头部`Access-Control-Max-Age`字段，缓存预检信息。

#### 一个插曲
在验证上面的触发`CORS`预检请求条件的过程中，发现了那些本可以触发`OPTIONS`的请求在其他浏览器中正常触发了预检，在Chrome浏览器（80.0.3987.149（正式版本）（64 位））中却没有触发预检请求，事实上是chrome发送了预检请但做了隐藏，设置展示参考这里[https://stackoverflow.com/questions/57410051/chrome-not-showing-options-requests-in-network-tab](https://stackoverflow.com/questions/57410051/chrome-not-showing-options-requests-in-network-tab)。

___
#### 参考
1. [预检请求](https://developer.mozilla.org/zh-CN/docs/Glossary/Preflight_request)
2. [科普一下 CORS 以及如何节省一次 OPTIONS 请求](https://zhuanlan.zhihu.com/p/70032617)
3. [Chrome not showing OPTIONS requests in Network tab](https://stackoverflow.com/questions/57410051/chrome-not-showing-options-requests-in-network-tab)