在开发中，如果你留意过NetWork中的请求、响应头的话，可以经常看到这两个东西——`content-encoding`和`transfer-encoding`，它们是做什么用的呢？

### 1. Content-Encoding内容编码
`Accept-Encoding`和`Content-Encoding`是HTTP中用来对「采用何种编码格式传输正文」进行协定的一对头部字段。

它的工作原理大概是：
1. 浏览器发送请求时，通过`Accept-Encoding`带上自己支持的内容编码格式列表；
2. 服务端从中挑选一种用来对正文进行编码，并通过`Content-Encoding`响应头指明选定的格式；
3. 浏览器拿到响应正文后，依据`Content-Encoding`进行解压。当然，服务端也可以返回未压缩的正文，但这种情况不允许返回`Content-Encoding`。

![content-encoding](https://pic.downk.cc/item/5f1037ea14195aa594a9017a.jpg)

这就是HTTP的内容编码机制。

内容编码目的是**优化传输内容大小**。一般对于文本类响应是否开启了内容压缩，是我们做性能优化时首先要检查的；而对于图片类型资源 (还有视频文件)，这类文件本身已经是高度压缩过的二进制文件，开启`gzip`压缩效果微乎其微且会浪费`CPU`资源。

### 2. Transfer-Encoding传输编码
上文已经讲到到，`Content-Encoding`通常用于对实体内容进行压缩编码，目的是优化传输。而`Transfer-Encoding`则是用来改变报文的格式，它不会减小传输体积的大小，反而会使传输的体积增大。在介绍`Transfer-Encoding`之前，先来看`Content-Length`。

#### 2.1 Content-Length
我们知道HTTP运行在TCP连接之上，而TCP的三次握手连接机制导致TCP连接的创建成本较高。为了尽可能的提高HTTP性能，`HTTP/1.1`规定所有连接都必须是持久的，除非显式地在头部加上`Connection: close`。

持久连接特性的引入带来了另外一个问题——在`HTTP/1.1`之前，一个HTTP响应完成时服务端会通过响应头部的`Connection: close`通知客户端HTTP响应完成了，但在`Connection: close`不存在了的情况下，**客户端该如何判断一个HTTP响应是否结束了？**

答案就是`Content-Length`——服务端在响应资源前计算好资源的体积大小，将它放到响应头的`Content-Length`中，客户端可以通过它判断出响应实体是否结束。

那么新的问题也来了——在实际应用中，很多时候响应资源的体积并没那么好获得，比如实体来自于网络文件、由动态语言生成等情况。这时候要想准确获取长度，只能开一个足够大的`buffer`，等内容全部生成好再计算。但这样做一方面需要更大的内存开销，另一方面也会让客户端等待的时间更久。

#### 2.2 Transfer-Encoding
好了，到这里，`Transfer-Encoding`可以登场了。除了持久连接，`HTTP/1.1`也引入了分块传输编码传输编码的概念——将数据分解成一系列数据块，并以多个块的形式发送给客户端，通过响应头`Transfer-Encoding: chunked`来通知客户端响应传输使用的是分块传输编码，这样就不需要`Content-Length`了。

如果一个HTTP响应的头部`Transfer-Encoding`的值为`chunked`，那么客户端就会知道，**消息体由数量未定的块组成**，并以最后一个大小为**0**的块为结束：
1. 每一个非空的块都以该块包含数据的字节数（字节数以十六进制表示）开始，跟随一个`CRLF`，然后是数据本身，最后块`CRLF`结束。
2. 最后一块是单行，由块大小（0），以及CRLF。

![chunked](https://pic.downk.cc/item/5f50b1ec160a154a672fffed.jpg)

注：在HTTP/2中，`Transfer-Encoding`已经被弃用了，因为HTTP/2本身提供了更加高级的流机制来实现类似功能。
