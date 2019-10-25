#### function前的感叹号有什么用？

如果你碰巧看过一些构建工具（类如 `Webpack` ）生成的源码，你可能会发现在方法前有一个感叹号，像这样子：
```js
!function() {...}()
```
那么`function`前的感叹号究竟有什么用？

[Stack Overflow](https://stackoverflow.com/questions/3755606/what-does-the-exclamation-mark-do-before-the-function)上也有人问过这个问题：

> 简单的来说，感叹号将方法转化成**立即执行函数表达式**`(IIFE: Immediately-Invoked Function Expression)`。

函数声明一般长这个样子：
```js
function foo () { console.log('haha') }
```
默认返回值为 `undefined`。

有的时候，我们会想在声明一个函数后直接调用它，像这样：
```js
function foo (){ console.log('haha') }() // Uncaught SyntaxError: Unexpected token )
```
然而会得到语法错误的提示，这是因为当解析器遇到 `function` 这样的关键字时，默认会把它视为函数声明处理。而在 `function` 之前加上一个感叹号，将它变成了一个函数表达式。感叹号（其实是取反符号）`!` 同时使表达式返回 `true`, 因为 立即执行函数表达式 `IIFE` 的返回值是 `undefined`，而 `!undefined = true`

另外，单单一个感叹号 `!` 并不能使函数得以执行，在最后加上一个括号 `()` 才会调用函数。

事实上，**所有可以消除函数声明和函数表达式歧义的形式，都可以被解析器正确识别**。
```js
var i = function foo (){ console.log('haha') }()
1 && function(){return true}()
+function(){alert('iifksp')}()
~function(){alert('iifksp')}()

......
```

最后，至于为什么大多数开发者都使用感叹号`!`而不是其他的符号，我暂时理解这是出于一种习惯？

#### 补充 函数声明与函数表达式

函数声明：
```js
function fn () {
  console.log('function declaration')
}
```
函数表达式：
```js
var fn = function () {
  console.log('function express')
}
```

`函数声明`：JavaScript属于解释型语言，JavaScript 解析器中存在一种变量声明提升机制，`函数声明`会被提升到作用域的最前面。

`函数表达式`：而用函数表达式创建的函数是在**运行时**进行赋值，且要等到表达式赋值完成后才能调用。

这也解释了下面这段代码的执行结果：
```js
fn()
var fn = function () {
  console.log('function express')
}
fn()
function fn () {
  console.log('function declaration')
}
fn()

// 执行结果，依次打印
// function declaration
// function express
// function express
```