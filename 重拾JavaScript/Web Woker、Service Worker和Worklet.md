我们都知道，JavaScript从诞生之日起就是一门单线程语言。

### Web Worker
当然，JavaScript的设计者们也意识到，**单线程在保证了执行顺序**的同时也限制了JavaScript的效率，为此他们引入了`web worker`技术。

这项技术号称让JavaScript成为一门多线程语言，但是与其他的多线程语言(Java、C++ 等)不同的是，**主程序线程和Worker线程之间，不会共享任何作用域或资源**，他们间实现通信方式的是基于事件监听机制的（下文将具体描述）。

然而，使用`Web Worker`技术开的多线程有着诸多限制，例如：所有新线程都受主线程的完全控制，不能独立执行。这意味着这些“线程”实际上应属于主线程的子线程。另外，这些子线程并没有执行`I/O`操作的权限，只能为主线程分担一些类如计算等任务。所以严格来讲这些线程并没有完整的功能，也因此这项技术并非改变了JavaScript语言的单线程本质。

因此对于`JavaScript`语言本身来说它仍是运行在单线程上的，`Web Worker`只是浏览器（宿主环境）提供的一个能力／API，换言之，**JavaScript是单线程的，但是JavaScript的执行环境不是**。

### Service Worker
什么是service worker？

### Worklet
什么是worklet?

___
### 参考
1. [Web Worker、Service Worker 和 Worklet
](https://tinyshare.cn/post/HpDVBvTWbUD)