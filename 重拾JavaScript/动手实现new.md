### new操作符
> new操作符创建一个用户自定义类实例或内置构造函数实例。

### new做了什么
这算是一个老生常谈的话题了，记得校招面试的时候就有被问过这个问题。所以，`new`究竟做了什么？以下面这段代码为例：
```js
function F (name) {
  this.name = name
}
const f = new F('foo')
console.log(f)
/*
F
  name: 25
  __proto__: Object
*/
```

`new`实际上做了三件事情:
```js
// 1. 创建了一个空对象
const f = new Object()
// 2. 用构造函数原型为该空对象原型赋值
f.__proto__ = F.prototype
// 3. 使构造函数的执行环境指向该空对象
F.apply(f)
```

需要注意的是**构造函数的返回**:
```js
// 1. 有返回值，且返回值为引用类型
function G (age) {
  this.age = age
  return new F('foo')
}
const g = new G(25)
console.log(g)
/*
F: 
  name: 'foo'
  __proto__: Object
*/

// 2. 有返回值，且返回值为基本数据类型值
function G (age) {
  this.age = age
  return 'age'
}
const g = new G(25)
console.log(g)
/*
G
  age: 25
  __proto__: Object
*/

// 3. 无返回
function G (age) {
  this.age = age
}
const g = new G(25)
console.log(g)
/*
G
  age: 25
  __proto__: Object
*/
```

总结：
> 构造函数有返回值**且返回值为引用类型**会导致通过该构造函数创建的实例原型被改写为返回对象的原型，所以构造函数尽量不需要手写返回。

### 模拟new
目标：实现一个函数，接收不定量的参数，第一个参数为构造函数，剩余参数为构造函数所接收，

```js
function create () {
  const _constructor = Array.prototype.shift.apply(arguments)
  const obj = {}
  obj.__proto__ = _constructor.prototype
  // 对返回值处理，构造函数如果有返回值且为对象则使用该对象，否则obj作为返回
  const _return = _constructor.apply(obj, arguments)
  return _return instanceof Object ? _return : obj
}
```
