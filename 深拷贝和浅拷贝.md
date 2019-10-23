### 概念

深拷贝和浅拷贝是针对复杂数据类型来说的，浅拷贝只拷贝一层，而深拷贝是层层拷贝。

这里有一个例子：

```js
const obj = {
  name: 'Bill',
  age: 18,
  hobbies: ['reading', 'photography']
}

const obj2 = Object.assign({}, obj)
const obj3 = {...obj}

obj.name = 'Gates'
obj.hobbies.push('coding')
```
由于`obj2`、`obj3`在这里是**浅拷贝**，`obj2.name`、`obj3.name` 不变，但是`obj2.hobbies`、`obj3.hobbies`会受到影响。

最简单的深拷贝实现：```JSON.parse(JSON.stringify(obj))```，这种方法有下面几个缺点：

- 不能正确处理正则类型
- 不能正确处理`Date`类型
- 会忽略函数
- 会忽略`undefined`
- 会忽略`Symbol`类型
- 原型链上的属性无法拷贝
- 循环引用的问题
- ...

所以在拷贝引用类型变量时候，考虑清楚是使用浅拷贝还是深拷贝以及是否可以通过`JSON`实现深拷贝。

实现一个完善的深拷贝：

```js
function deepCopy (obj) {
  const type = Object.prototype.toString.apply(obj).toLowerCase().slice(8, -1)
  if (typeof obj !== 'object') {
    return obj
  } else if (type === 'regexp') {
    return new RegExp(obj)
  } else if (type === 'date') {
    return new Date(obj)
  }
  
  // 原型属性的拷贝
  const copy = new obj.constructor()
  for (let key in obj) {
    if (obj.hasOwbProperty(key)) {
      copy[key] = arguments.calle(obj[key])
    }
  }
  return copy
}
```