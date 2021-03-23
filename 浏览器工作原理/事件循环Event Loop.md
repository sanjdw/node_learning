我们都知道，JavaScript从诞生之日起就是一门单线程、非阻塞的脚本语言。这是由其最初的用途决定的：与浏览器交互。

- 单线程意味着JavaScript有一个单一的调用栈，代码在执行的任何时刻，都只能做一件事情
- 非阻塞则是指在要执行一项**异步任务**时，这个异步任务会被挂起，不影响主线程上后续任务的执行

你是否考虑过，单线程的JavaScript在遇到异步任务的时候，后续的同步任务执行为什么不会被阻塞？具体的机制是怎样的？这个就是下面我们要讨论的事件循环`Event Loop`。

在开始之前，我们要先明白`Event Loop`只是一种概念/机制，JavaScript、Python、Java...很多计算机语言中都有这个东西，在不同语言领域它的概念并不相同，甚至在JavaScript领域中，浏览器和Node.js中对于`Event Loop`的实现也不尽相同，本文只讨论浏览器中的`Event Loop`：

![Event Loop in browser](https://pic.downk.cc/item/5fd10e873ffa7d37b38933dd.png)

1. 所有同步任务都在主线程上排队执行，形成**调用栈**
2. 主线程之外，还存在**任务队列**。任务队列是什么呢？它里面存放的是事件——每一个异步任务有了运行结果，就会在任务队列之中放置一个事件，表示对应的异步任务有了返回结果
3. 当主线程上**调用栈**中的所有任务执行完毕时，主线程就会查看**任务队列**里面有哪些事件。那些事件对应的异步任务，于是就结束等待状态，异步任务**对应的回调**便进入主线程的执行栈，得以执行
4. 主线程不断重复上面的第三步

浏览器实现了如上的`Event Loop`机制，使得窗口内的事件、用户交互、JavaScript脚本，渲染、网络等可以协调工作。

<!-- 一个主线程对应了一个`Event Loop`，一个`Event Loop`中包含一个或多个任务队列，来自不同任务源的任务、会进入到不同的任务队列。 -->

### 1. macroTask和microTask
为了将不同任务的优先级区分开来，任务又被分为了`macroTask`（宏任务）和`microTask`（微任务），**同步任务/异步任务**与**宏任务/微任务**是不同范畴的任务划分。

`macroTask`有：
- setTimeout/setInterval
- setImediate（部分浏览器支持）
- messageChannel
- I/O
- UI渲染
- Script整体代码

`microTask`有：
- Promise.then
- mutationObserver
- queueMicrotask

在一次事件循环中，`macroTask`和`microTask`的执行如下：

![macroTask和microTask](https://img.imgdb.cn/item/6048fa395aedab222c9c852f.png)

用一句话概括来讲就是，在一轮事件循环中，`Event Loop`会取一个`macroTask`任务（执行栈中没有就从任务队列中获取），**并在当次循环里依次执行并清空microTask队列里的任务（在这个过程中新产生的微任务也会被添加到当前队列中）**。

一段代码可以验证这个流程：
```js
console.log('start')

new Promise(res => {
  console.log('promise')
  res('置为true')
}).then(msg => {
  console.log('promise.then', msg)
}).then(msg => {
  console.log('新的微任务')
})

setTimeout(function() {
  console.log('setTimeout')
}, 0)

console.log('end')
```

执行结果：

![执行结果](https://img.imgdb.cn/item/604905e45aedab222ca119ca.jpg)

- 首先是发现有一个宏任务（Script整体代码）待执行，所以会先依次打印“start”、“promise”、“end”
- 清空微任务，这里对应的是`Promise.then`，且在这个过程中又有新的微任务`Promise.then`出现，所以会依次打印“promise.then, 置为true”、“新的微任务”
- 第二次事件循环开始，再次发现有一个宏任务待执行，所以会打印“setTimeout”
- 无微任务，第二次事件循环结束

### 2. Event Loop与UI渲染
上文曾经提到，UI渲染属于`macroTask`，在一轮事件循环中，`microTask`被清空完之后会进入更新渲染阶段，所以**每一轮事件循环中都会发生渲染更新吗——答案是不一定**。

比如对于如下代码：
```js
document.body.style.background = 'red';
Promise.resolve('置为true').then(res => {
  console.log(res)
})
setTimeout(function () {
  document.body.style.background = 'black';
}, 17)
```

两次设置背景色会在不同的事件循环轮次里执行，**如果每一轮事件循环中渲染更新都会发生，那么你可以看到页面的闪烁（第一轮事件循环中背景色渲染为红色，第二轮渲染为黑色）**，但多次执行上述代码会发现，这个效果并不是稳定出现的，这意味着——**并不是每一轮的事件循环都会伴随着渲染更新**。

在一轮事件循环中JavaScript操作了DOM，浏览器却可能不一定会渲染更新，这该如何解释呢？这里有一个[rendering opportunities](https://html.spec.whatwg.org/multipage/webappapis.html#rendering-opportunity)的概念：
> Browsing context rendering opportunities are determined based on hardware constraints such as display refresh rates and other factors such as page performance or whether the page is in the background. Rendering opportunities typically occur at regular intervals.

这意味着在每一轮的`Event Loop`中，**是否需要执行渲染更新是由浏览器的刷新速率、页面性能、页面是否在后台等诸多因素决定的**。

### 3.requestAnimationFrame和requestIdleCallback
由于显示器都有固定的刷新率（一般在60Hz），所以如果浏览器有动画的渲染更新任务的话需要在16.7ms内完成才能保证页面流畅。

在一帧内：

![task, microTask and render](https://img.imgdb.cn/item/605a28208322e6675c830350.jpg)

除了渲染更新，浏览器还要完成`Event Loop`中的任务。

浏览器只保证requestAnimationFrame的回调在重绘之前执行，没有确定的时间，何时重绘由浏览器决定

___
### 参考
1. [深入理解js事件循环机制（浏览器篇）](http://lynnelv.github.io/js-event-loop-browser)
2. [再谈Event Loop](https://www.ruanyifeng.com/blog/2014/10/event-loop.html)
3. [一位摸金校尉决定转行前端](https://mp.weixin.qq.com/s/f-ltQilq66nKUgjK3S5hnw)
