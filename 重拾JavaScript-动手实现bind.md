#### bind操作符
> `bind`操作符会创建一个新函数，当这个新函数运行时，`bind()`的第一个参数将作为该新函数的运行时`this`，`bind()`的剩余参数将合并到新函数的参数之前且共同作为新函数的参数传入给新函数。

后半句有点拗口，先结合代码来看一下：

```js
function f(age, gender) {
  console.log(`hi, i'm ${this.name}`)
  console.log(`i'm ${age} years old`)
  console.log(`i'm a ${gender}`)
}
const xiaoming = {
  name: 'xiaoming'
}
const newF = f.bind(xiaoming, 12)
newf('boy')
/*
  hi, i'm xiaoming
  i'm 12 years old
  i'm a boy
*/
```

首先对下文会提到的两个名词作一下区分解释：
1. 绑定函数，指的是上面代码中的`f`
2. 新函数，在上面代码中指的是通过`f.bind()`生成的函数`newF`方法

可以看到，除了新函数接收的参数，`bind`接收的`context`之外的参数也被计入新函数的参数之中，因此需要对参数进行合并。

#### 模拟bind
1. 初步模拟，考虑参数问题
```js
Function.prototype.Bind = function (context) {
  // self指向绑定函数
  const self = this
  const args = Array.prototype.call(arguments, 1)
  return function () {
    const _args = args.concat(Array.prototype.slice.call(arguments))
    self.apply(context, _args)
  }
}
```

2. 看起来`bind`的模拟已经完成了，事实上还有一点没有考虑——新函数作为构造函数时，`bind`接收的运行时`this`参数失效，其他参数仍然有效：
```js
function f(age, gender) {
  this.home = 'earth'
  console.log(`hi, i'm ${this.name}`)
  console.log(`i'm ${age} years old`)
  console.log(`i'm a ${gender}`)
}
const name = 'xiaoliang'
const xiaoming = {
  name: 'xiaoming'
}
const newF = f.bind(xiaoming, 12)
const boy = new newF('boy')
/*
  hi, i'm undefined
  i'm 12 years old
  i'm a boy
*/
console.log(boy)
/*
f
  home: 'earth'
  __proto__: Object
*/
```

在`new newF`调用新函数时，新函数（构造函数）将`this`重新指向`boy`，因而导致新函数最初绑定的`this`--`xiaoming`失效。

那么如何判断新函数是作为构造函数调用还是普通函数调用——通过为新函数原型赋值并判断新函数内`this`是否继承自绑定函数。

```js
Function.prototype.Bind = function (context) {
  // self 指向绑定函数
  const self = this
  const args = Array.prototype.slice.call(arguments, 1)
  function bind () {
    const _args = args.concat(Array.prototype.slice.call(arguments))
    // 新函数作为构造函数调用，this指向构造函数生成的实例对象
    // 新函数作为普通函数调用，bind绑定的运行时context
    // 由于用绑定函数实例为新函数原型赋值，当新函数作为构造函数调用时，生成的实例也必定属于绑定函数类原型的子类
    self.apply(this instanceof self ? this : context, _args)
  }
  // 继承绑定函数的原型对象
  function newP () {}
  newP.prototype = self.prototype
  bind.prototype = new newP()
  return bind
}
```
