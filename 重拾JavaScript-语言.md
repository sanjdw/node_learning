本文从以下三个角度总结个人对于JavaScript的理解认识：

## 动态弱类型语言
> #### 动态/静态类型，指的是声明一个变量之后，它是否可以存储（指向）不同类型的变量

在JavaScript中可以通过`var`/`let`等关键字声明变量:
```js
var name = 'test'
name = 123
```
变量在声明之初时并不确定类型，初始值为字符串类型之后可以赋值为其他类型，这就是JavaScript的动态类型特性。

而对于静态类型语言，以Java为例，声明变量时需要通过指定类型或标识符声明变量:
```java
int age = 12;
```
如果尝试为变量`age`赋值为其他类型值，则编译出错。

> #### 弱/强类型，指的是是否允许不兼容的类型进行运算

在JavaScript中允许不同数据类型的变量共同运算：
```js
var age = 12
var b = age - '1'
// 11
var c = age + '1'
// 121
```
不同类型变量在运算时会进行隐式类型转换，这就是JavaScript的弱类型特性。而对于强类型语言，以Python为例：
```py
age = 12
b = age - '1'
```
不同类型数据间进行运算会出错：
```
TypeError: unsupported operand type(s) for -: 'int' and 'str'
```
___
## 解释型语言
从表象意义上来看，解释和编译的区别是：
- 解释： 源码 -> 执行结果
- 编译： 源码 -> 可执行的编码

**编译或解释并不是语言的特性，而是实现的特性**，也不存在严格的编译语言和解释语言的定义和划分，理论上，任何编程语言都可以是编译型的，或者是解释型的。

根据语言的偏向实现，业界通常将语言分为编译型语言和解释型语言：
- 编译型语言在编译过程中生成目标平台指令
- 解释型语言在运行过程中才生成目标平台指令

C语言一般被认为是编译型语言，由源代码经过编译器编译生成了目标文件，而这个目标文件是针对特定CPU体系的，如果代码需要在另一种CPU上运行，则需要重新编译。**但是，C语言的解释器也是存在的**，这意味着C语言也可以是解释型的。

Python和Java既有编译的实现，也有解释的实现。Python/Java源码，首先被编译成平台无关字节码，然后通过平台上的虚拟机解释执行。

JavaScript一般被认为是解释型语言，它是完全的**一边解释一边执行**，又叫**即时编译**。它既不会有中间代码产生，也不会有目标代码产生，这个过程由宿主环境（比如浏览器或Node.js的JavaScript虚拟机V8）处理。

## 关于单线程
#### 1. JavaScript是单线程的
```js
while (true) {}
console.log(1)
```
这样的代码运行在浏览器或Node.js中，由于JavaScript是单线程的，`while (true) {}`阻塞了当前JavaScript执行线程，`console.log(1)`永远得不到执行。

#### 2. Web Worker
单线程的缺点是无法充分利用多核CPU资源，CPU密集型计算可能会导致I/O阻塞，以及出现错误可能会导致应用崩溃。

**HTML5** 制定了Web Worker标准，为JavaScript创造了多线程环境，允许JavaScript主线程创建Worker线程，将一些任务分配给Worker线程运行。在主线程运行的同时，Worker线程在后台运行，互不干扰。这样的好处是一些计算密集型、高延迟的任务，被Worker线程承担，主线程（负责UI以及交互）的运行就会更加流畅。

#### 3. Node.js的“多线程”
对于Node.js，其JavaScript执行线程（开发者编写的JavaScript代码）是单线程的，而Node.js进程是多线程的。要了解Nodejs.js进程有哪些线程，需要先了解Node.js内部架构：

![Node.js结构](https://image-static.segmentfault.com/411/182/4111821277-577a300546802_articlex)

- Application/Modules: 
  - Application：这部分是开发者编写的JavaScript代码以及第三方JavaScript库
  - Modules：Node.js的内置核心模块——全局对象、event模块，文件系统fs模块、 http模块等
- Bindings + Addons：可以看做是连接JavaScript代码和C/C++代码的桥梁
  - Binding的作用是把用C/C++编写的Node.js使用的核心模块接口暴露给JavaScript环境
  - Addons：暴露其他第三方或自开发C/C++模块给JavaScript环境
- V8、libuv及其他C/C++组件及库：
  - V8：JavaScript引擎，以C++实现，为JavaScript提供了非浏览器端运行环境
  - libuv：为Node.js提供了跨平台、线程池、事件池、异步I/O等能力
  - 其他C/C++组件和库：c-ares、crypto、http-parser、zlib等，这些为Node.js提供了对系统底层功能如网络、加密、压缩等的访问能力。

Node.js启动后将会创建V8实例，V8实例本身是多线程的：
- 主线程：编译执行JavaScript代码
- 编译线程：在主线程执行时，优化代码
- proifiler线程：记录分析代码运行时间，为Crankshaft优化代码提供依据
- GC线程：垃圾回收

前文已经说过，其中JavaScript执行线程是单线程的，除了上述的四种线程，某些异步I/O操作（dns、fs）以及CPU密集计算（Zlib、Crypto）另外会启用Node.js的线程池。

在单核CPU系统上，我们采用**单进程 + 单线程**的模式来开发，而在多核CPU系统上，为了提高对CPU的利用率，可以通过`child_process.fork`开启多个进程，即**多进程 + 单线程**模式。

#### 4. 浏览器不是单线程的，它甚至可能是多进程的
单进程架构是指浏览器所有功能模块都运行在同一个进程中，这些模块包括网络、插件、JavaScript运行环境、渲染引擎和页面等。

![单进程浏览器架构](https://pic.downk.cc/item/5e63a50898271cb2b8f08f7e.png)

早期的IE浏览器就是单进程架构，从IE8开始其进程架构变成多进程，Firefox经过从Firefox 48到56共9个版本的迭代，逐步的完善了其多进程架构，而Chrome一开始就是基于多进程架构。

下图为Chrome的进程架构：

![多进程浏览器架构](https://pic.downk.cc/item/5e63b26a98271cb2b8f79903.png)

有关浏览器的工作原理，会写在另外一篇笔记里。

___
#### 参考
1. [什么是解释型语言？](https://www.zhihu.com/question/268303059)
2. [Java是编译型语言还是解释型语言？](https://www.zhihu.com/question/19608553)
3. [虚拟机随谈：解释器，树遍历解释器，基于栈与基于寄存器](https://www.iteye.com/blog/rednaxelafx-492667)
4. [JavaScript是如何执行的](https://segmentfault.com/a/1190000020438413)
5. [理解Node.js中的“多线程”](https://zhuanlan.zhihu.com/p/74879045)
6. [浏览器进程架构的演化](https://zhuanlan.zhihu.com/p/96957235)