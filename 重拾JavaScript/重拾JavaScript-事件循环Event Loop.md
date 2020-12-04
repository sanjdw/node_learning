### 引子
我们都知道，JavaScript从诞生之日起就是一门单线程、非阻塞的脚本语言。这是由其最初的用途决定的：与浏览器交互。

单线程意味着JavaScript代码在执行的任何时候，都只有一个主线程来处理所有的任务。

而非阻塞则是指，当需要执行一项异步任务时，主线程会挂起（`pending`）这个异步任务，之后在异步任务返回结果时再去执行相应的回调。

当然，JavaScript的设计者们也意识到，**单线程在保证了执行顺序**的同时也限制了JavaScript的效率，为此他们引入了`web worker`技术。这项技术号称让JavaScript成为一门多线程语言，但是与其他的多线程语言(Java、C++ 等)不同的是，**主程序线程和Worker线程之间，不会共享任何作用域或资源**，他们间实现通信方式的是基于事件监听机制的（下文将具体描述）。

因此对于`JavaScript`语言本身来说它仍是运行在单线程上的，`Web Worker`只是浏览器（宿主环境）提供的一个能力／API，换言之，**JavaScript是单线程的，但是JavaScript的执行环境不是**。

那么——单线程如何做到异步的？
<!-- - EventLoop是什么？
- macrotask 和 microtask 是什么，它们有何区别 -->

### eventLoop
1. 所有同步任务都在主线程上执行，形成一个**执行栈**（`execution context stack`）。
2. 主线程之外，还存在**任务队列**(`task queue`)。只要异步任务有了运行结果，就在**任务队列**之中放置一个**事件**。
3. 一旦**执行栈**中的所有同步任务执行完毕，**JavaScript引擎**就会读取**任务队列**，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，对应的回调进入执行栈，得以执行。
4. 主线程不断重复上面的第三步



___
### 参考
1. [](http://lynnelv.github.io/js-event-loop-browser)
2. [](https://github.com/amandakelake/blog/issues/26)
3. [](https://juejin.im/post/5df631afe51d45581269a7b5)
4. [](https://zhuanlan.zhihu.com/p/25184390)
5. [](https://zhuanlan.zhihu.com/p/33058983)
6. [彻底搞懂浏览器Event-loop](https://github.com/YvetteLau/Blog/issues/4)
7. [Eventloop](https://juejin.im/post/5c72307551882562e74812dc)
8. [浏览器的事件循环](https://juejin.im/post/5edc658de51d45784b1304aa)
