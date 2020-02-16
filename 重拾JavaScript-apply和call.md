#### apply
> apply()方法调用一个指定运行时上下文以及具有类数组形式的实参的函数

来自MDN的定义，读起来还是很拗口，看一下代码就可以明白：
```js
function f (years, gender) {
  console.log(this.name)
  console.log(`i'm ${years} years old`)
  console.log(`i'm a ${gender}`)
}
const xiaoming = {
  name: 'xiaoming'
}
f.apply(xiaoming, [12, 'boy'])
/*
xiaoming
i'm 12 years old
i'm a boy
*/
```
可以看出，`apply`用于改变绑定函数的运行时环境，且与`bind`不同的是，`apply`直接调用函数而不是返回新函数。

#### 模拟apply
模拟的主要思路是将绑定函数作为属性添加给`context`并通过`context`调用绑定函数：
```js
Function.prototype.Apply = function (context, args) {
  // 处理context为null的情况
  context = context || window
  context.fn = this
  // 函数返回值的处理
  const _return = context.fn(args)
  delete context.fn
  return _return
}
```
上面的`apply`模拟实现对于参数的处理是有问题的，由于`apply`将提供给函数调用的参数以数组形式传入，需要将参数依次提取出来：
```js
Function.prototype.Apply = function (context, args) {
  // 处理context为null的情况
  context = context || window
  context.fn = this
  let _return
  if (!args) {
    _return = context.fn()
  } else {
    for (let i = 1; i < args.length; i ++) {
      _args.push('args[' + i + ']')
    }
    _return = eval('context.fn(' + args +')');
  }
  delete context.fn
  return _return
}
```
