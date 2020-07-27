#### var和let的区别

1.**代码块**

let声明的变量只在代码快内有效，实际上`let`为JavaScript新增了块级作用域：
```js
{
		let a = 1;
		var b = 2;
}
a // Uncaught ReferenceError: a is not defined
b // 2
```

2.**变量提升**

`var`命令会发生“变量提升”的现象，即变量可以在声明之前访问。

而`let`则不会，在声明前访问会报错：Uncaught ReferenceError。

3.**重复声明**

`var`命令可以重复声明一个变量。

`let`命令则不可以，重复声明会报错：Uncaught SyntaxError: Identifier 'a' has already been declared。

4.**顶级作用域**

在全局作用域下用`var`声明的变量会挂载在`window`对象下成为`window`的属性：
```js
var a = 1;
window.a // 1
```

而`let`则不同：
```js
let b = 2;
window.b // undefined
```

5.**暂时性死区**

只要块级作用域内存在`let`命令，它所声明的变量就“绑定”这个区域，不再受外部的影响。

#### 钩子函数和普通函数的区别

1. **函数体内的this对象，是定义时所在的对象，而不是使用时所在的对象**。

2. 不可以当作构造函数，也就是说，不可以使用new命令，否则会抛错。

3. 不可以使用arguments对象，该对象在函数体内不存在。要用的话可以用Rest参数代替。

4. 不可以使用yield命令，因此箭头函数不能用作Generator函数。
