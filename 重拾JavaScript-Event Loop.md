#### 引子


那么—— 单线程如何做到异步的？
<!-- - EventLoop是什么？
- macrotask 和 microtask 是什么，它们有何区别 -->

#### eventLoop
1. 所有同步任务都在主线程上执行，形成一个**执行栈**（execution context stack）。
2. 主线程之外，还存在 **"任务队列"**(task queue)。只要异步任务有了运行结果，就在"任务队列"之中放置一个**事件**。
3. 一旦"执行栈"中的所有同步任务执行完毕，JavaScript引擎就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。
4. 主线程不断重复上面的第三步


___
#### 参考
1. [](http://lynnelv.github.io/js-event-loop-browser)
2. [](https://github.com/amandakelake/blog/issues/26)
3. [](https://juejin.im/post/5df631afe51d45581269a7b5)
