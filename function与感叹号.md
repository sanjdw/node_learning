# function前的感叹号有什么用？

如果你碰巧看过一些构建工具（类如`Webpack`）生成的源码，你可能会发现在方法前有一个感叹号，像这样子：
```js
!function() {...}()
```
那么`function`前的感叹号是做什么的？

<!-- 在[`stackoverflow`](https://stackoverflow.com/questions/3755606/what-does-the-exclamation-mark-do-before-the-function)上看到这样一个回答：

> `!function foo() {}` 把 `function foo() {}`从函数声明变成了函数表达式
>
> 单独一个感叹号`!`并不会使函数执行，当然，在代码最后补充一个`()`：`!function foo() {}`即可使函数执行。
>
> 可读性更强的函数调用一般长这个样子：
> ```js
> (function(){})()
> ```
> function前的感叹号只是节约了一个字节的空间。 -->

<!-- 事实上，无论是括号还是感叹号，让整个语句合法的事情只有一个——**就是让一个函数声明变成了一个表达式**： -->
函数声明
```js
function foo () { console.log('haha') }
```
有的时候，我们会想在声明一个函数后直接调用它，像这样：
```js
function foo (){ console.log('haha') }() // Uncaught SyntaxError: Unexpected token )
```
然而会得到语法错误的提示，这是因为当解析器遇到 `function` 这样的关键字时，默认会把它视为函数声明处理

但是括号则不同，它将一个函数声明转化成了一个表达式，解析器不再以函数声明的方式处理函数`foo`，而是视为一个函数表达式处理，因此只有在程序执行到函数`foo`时它才能被访问。

因此，**所有可以消除函数声明和函数表达式歧义的形式，都可以被解析器正确识别**。
```js
var i = function foo (){ console.log('haha') }()
1 && function(){return true}()
+function(){alert('iifksp')}()
~function(){alert('iifksp')}()

......
```

到这里，你也许可以明白那个感叹号其实是一个取反符号。

最后，至于为什么大多数开发者都使用感叹号`!`而不是其他的符号，还没有
## 函数声明与函数表达式

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

`函数声明`：JavaScript属于解释型语言，JavaScript 解析器中存在一种变量声明提升机制，`函数声明`会被提升到作用域的最前面
#### Tip ([解释型语言相对于编译型语言主要是把内存分配和释放，类型判断等工作放在`运行时`](https://grain0217.github.io)，且要命的是，每次运行都要执行。但现在的JavaScript的虚拟机已经做了一些优化，可以局部保存一些编译结果，但是还有限的。不过编译型语言的缺点是移植性和适应性差，虽然执行效率高，但编译时间太长，严重影响开发效率和开发体验。)

`函数表达式`：而用函数表达式创建的函数是在`运行时`进行赋值，且要等到表达式赋值完成后才能调用

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