#### 概念
**不再用到的内存，没有及时释放，就叫做内存泄漏**。

有些语言（比如 C 语言）必须手动释放内存，**由程序员负责内存管理**。

大多数语言提供自动内存管理，减轻程序员的负担，这被称为 **"垃圾回收机制"（garbage collector）** 。JavaScript 就是一种垃圾回收语言。

实现垃圾回收机制最常使用的方法叫做"引用计数"：语言引擎有一张"引用表"，保存了内存里面所有的资源的引用次数。如果一个值的引用次数是0，就表示这个值不再用到了，可以将这块内存释放。

造成内存泄漏的集中情况：

##### 全局变量，闭包都会引起内存泄漏。

```javascript
const arr = [1,2,3,4]
console.log(arr)
```

变量arr是对数组[1,2,3,4]的引用，因此[1,2,3,4]的引用次数是1，尽管后面不再用到arr，它还是会占用内存。只需要增加一行代码，解除对[1,2,3,4]的引用即可使这块内存被释放。
```javascript
const arr = [1,2,3,4]
console.log(arr)
arr = null
```
##### 闭包会导致内存泄漏：

```javascript
let theThing = null
const replaceThing = function () {
  const originalThing = theThing
  const unused = function () {
    if (originalThing) console.log("hi")
  }
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log('someMessage')
    }
  }
}
setInterval(replaceThing, 1000)
```

代码片段做了一件事情：每次调用 `replaceThing` ，`theThing` 得到一个包含一个大数组和一个新闭包（`someMethod`）的新对象。同时，变量 `unused` 是一个引用 `originalThing` 的闭包（先前的 `replaceThing` 又调用了 `theThing` ）。思绪混乱了吗？最重要的事情是，闭包的作用域一旦创建，它们有同样的父级作用域，作用域是共享的。`someMethod` 可以通过 `theThing` 使用，`someMethod` 与 `unused` 分享闭包作用域，尽管 `unused` 从未使用，它引用的 `originalThing` 迫使它保留在内存中（防止被回收）。当这段代码反复运行，就会看到内存占用不断上升，垃圾回收器无法降低内存占用。本质上，闭包的链表已经创建，每一个闭包作用域携带一个指向大数组的间接的引用，造成严重的内存泄漏。

修复此种问题：在 `replaceThing` 的最后添加 `originalThing = null`