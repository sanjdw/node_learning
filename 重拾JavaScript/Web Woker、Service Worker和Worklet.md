我们都知道，JavaScript从诞生之日起就是一门单线程语言。

### Web Worker
当然，JavaScript的设计者们也意识到，单线程限制了JavaScript的效率，为了解决不可避免的耗时操作(多重循环、复杂的运算)，HTML5提出了`web worker`标准。

这项技术号称让JavaScript成为一门多线程语言，但是与其他的多线程语言(Java、C++...)不同的是：
- JavaScript的**主线程和Worker线程之间，不会共享任何作用域或资源**
- 所有Worker线程都受主线程的控制，不能独立执行，没有执行`I/O`操作的权限，这些Worker线程可以看做**主线程的子线程**
- 主线程和Worker线程基于事件监听机制实现线程间通信（下文将具体描述）

所以严格来讲`Web Worker`并没有改变JavaScript语言的单线程本质。

因此对于JavaScript语言本身来说它仍是运行在单线程上的，`Web Worker`只是浏览器（宿主环境）提供的一个能力／API，换言之，**JavaScript是单线程的，但是JavaScript的执行环境不是**。

### Service Worker
什么是service worker？

### Worklet
什么是worklet?

___
### 参考
1. [Web Worker、Service Worker 和 Worklet](https://tinyshare.cn/post/HpDVBvTWbUD)