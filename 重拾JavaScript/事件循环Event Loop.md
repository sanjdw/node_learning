我们都知道，JavaScript从诞生之日起就是一门单线程、非阻塞的脚本语言。这是由其最初的用途决定的：与浏览器交互。

- 单线程意味着JavaScript有一个单一的调用栈，代码在执行的任何时刻，都只能做一件事情
- 非阻塞则是指，在要执行一项**异步任务**时，这个异步任务会被挂起，不影响主线程上后续任务的执行

单线程的JavaScript是如何做到将异步任务挂起，不阻塞后续任务的执行的？具体机制是怎样的？这个就是下面我们要讨论的事件循环`Event Loop`。

在开始之前，我们要先明白`Event Loop`只是一种概念/机制，JavaScript、Python、Java...很多计算机语言中都有这个东西，在不同语言领域它的概念并不相同。当然，在这里我们仅讨论JavaScript领域的`Event Loop`：
1. 所有同步任务都在主线程上执行，形成一个**执行栈**。
2. 主线程之外，还存在**任务队列**(`task queue`)。任务队列是什么呢？它是一个队列，里面存放的是事件——每一个异步任务有了运行结果，就会在任务队列之中放置一个事件，表示对应的异步任务有了返回结果。
3. 当**执行栈**中的所有同步任务执行完毕时，**JavaScript引擎**就会查看**任务队列**里面有哪些事件。那些事件对应的异步任务，于是就结束等待状态，异步任务**对应的回调**便进入执行栈，得以执行。
4. 主线程不断重复上面的第三步

在JavaScript领域，**主线程从任务队列中读取执行事件，不断循环重复的过程，就被称为事件循环（Event Loop）**。

浏览器、Node.js各自实现了`Event Loop`机制来实现JavaScript的单线程异步非阻塞特性：
- Node.js的Event Loop是基于libuv，而浏览器的Event Loop则在HTML5的规范中明确定义。
- libuv对Event loop作出了具体的实现，而HTML5规范中只是定义了浏览器中Event Loop的模型，具体实现留给了浏览器厂商。

### 1. macroTask和microTask
前面的事件循环过程是一个宏观的表述，实际上因为异步任务之间并不相同，因此它们的执行优先级也有区别。在JavaScript中，不同的异步任务被分为两类：macroTask（宏任务）和microTask（微任务）。

`macroTask`：
- setTimeout/setInterval
- setImediate（Node支持、部分浏览器支持）
- messageChannel（浏览器）
- requestAnimationFrame（浏览器）
- I/O
- UI rendering（浏览器）

`microTask`：
- Promise
- mutationObserver（浏览器）
- queueMicrotask
- process.nextTick（Node)

事件循环的顺序，决定JavaScript代码的执行顺序。

### 2. 浏览器环境的Event loop
![Event Loop in browser](https://pic.downk.cc/item/5fd10e873ffa7d37b38933dd.png)

在浏览器的每一轮事件循环中，两个`macroTask`执行之间都要清空所有的`microTask`。


### 3. Node环境的Event loop
![Event Loop in Node](https://img.imgdb.cn/item/6016eb1a3ffa7d37b3791e89.png)

Node同样采用了V8作为JavaScript引擎，但在I/O处理方面使用了自己设计的libuv，libuv是一个基于事件驱动的跨平台抽象层（封装了不同操作系统的底层特性），对外提供统一的API，事件循环机制也是libuv里面的实现。

Node中的Event Loop分为六个阶段：
![Node Event Loop-6个阶段](https://img.imgdb.cn/item/601819653ffa7d37b306d004.png)

```js
外部输入数据 -> 轮询 -> 检查 -> 关闭事件回调 -> timer回调 -> I/O 事件回调 -> 闲置 -> 轮询 -> ...
```

- `timers`：这个阶段执行定时器（setTimeout/setInterval）的回调
- `I/O callbacks`: 这个阶段处理一些上一轮循环中的少数未执行的I/O回调
- `idle/prepare`: 仅node内部使用
- `poll`: 获取新的I/O事件，适当的条件下node将阻塞在这里
- `check`: 执行setImmediate的回调
- `close callbacks`: 执行socket的close事件回调

浏览器环境下，`microtask`的执行时机是两个`macrotask`执行之间，而在Node中，`microtask`会在事件循环的各个阶段之间执行：
![浏览器的Event Loop与Node的Event Loop](https://img.imgdb.cn/item/601820053ffa7d37b3099cd6.png)

所以对于以下JavaScript：
```js
setTimeout(()=>{
  console.log('timer1')
  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)
setTimeout(()=>{
  console.log('timer2')
  Promise.resolve().then(function() {
    console.log('promise2')
  })
}, 0)
```

在浏览器中的运行结果是：
```
timer1
proimise1
timer2
promise2
```

在Node中的运行结果是：
```
timer1
timer2
promise1
promise2
```
___
### 参考
1. [深入理解js事件循环机制（浏览器篇）](http://lynnelv.github.io/js-event-loop-browser)
2. [再谈Event Loop](https://www.ruanyifeng.com/blog/2014/10/event-loop.html)
3. [浏览器与Node的事件循环(Event Loop)有何区别?](https://blog.fundebug.com/2019/01/15/diffrences-of-browser-and-node-in-event-loop/)
4. [不要混淆nodejs和浏览器中的event loop](https://cnodejs.org/topic/5a9108d78d6e16e56bb80882)
5. [详解JavaScript中的Event Loop](https://zhuanlan.zhihu.com/p/33058983)
6. [浏览器的事件循环](https://juejin.im/post/5edc658de51d45784b1304aa)
<!-- 7. [彻底搞懂浏览器Event-loop](https://github.com/YvetteLau/Blog/issues/4) -->
