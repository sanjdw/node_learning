### 引子
我们都知道，JavaScript从诞生之日起就是一门单线程、非阻塞的脚本语言。这是由其最初的用途决定的：与浏览器交互。

单线程意味着JavaScript代码在执行的任何时候，都只有一个主线程来处理所有的任务。

而非阻塞则是指，当需要执行一项异步任务时，主线程会挂起（`pending`）这个异步任务，之后在异步任务返回结果时再去执行相应的回调。

而浏览器、Node.js通过各自的事件循环`Event Loop`机制来实现异步非阻塞。

### 1. Event loop

![Event Loop](https://pic.downk.cc/item/5fd10e873ffa7d37b38933dd.png)
1. 所有同步任务都在主线程上执行，形成一个**执行栈**（`execution context stack`）。
2. 主线程之外，还存在**任务队列**(`task queue`)。那么任务队列存放的是什么呢——每一个异步任务有了运行结果，就会在**任务队列**之中放置一个**事件**。
3. 当**执行栈**中的所有同步任务执行完毕时，**JavaScript引擎**就会读取**任务队列**，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，**对应的回调**进入执行栈，得以执行。
4. 主线程不断重复上面的第三步

### 2. MacroTask和MicroTask
`macroTask`：
- setTimeout/setInterval
- setImediate（Node.js支持、部分浏览器支持）
- messageChannel
- requestAnimationFrame（浏览器支持）
- I/O
- UI rendering

`microTask`：
- Promise
- mutationObserver
- queueMicrotask
- process.nextTick（Node.js支持)

### 3. 浏览器环境的Event loop

### 4. Node环境的Event loop


___
### 参考
1. [深入理解js事件循环机制（浏览器篇）](http://lynnelv.github.io/js-event-loop-browser)
2. [](https://github.com/amandakelake/blog/issues/26)
3. [](https://juejin.im/post/5df631afe51d45581269a7b5)
4. [](https://zhuanlan.zhihu.com/p/33058983)
5. [彻底搞懂浏览器Event-loop](https://github.com/YvetteLau/Blog/issues/4)
6. [浏览器的事件循环](https://juejin.im/post/5edc658de51d45784b1304aa)
