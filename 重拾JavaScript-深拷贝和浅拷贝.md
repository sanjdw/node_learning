## 数据类型
首先从数据类型谈起，JavaScript中的数据类型主要分为两大类——原始类型和引用类型。

- 原始类型
  - Null
  - Undefined
  - Boolean
  - Number
  - String
  - Symbol
- 引用类型

所有数据在内存中都需要分配空间来存储，内存空间又分为两类——**栈与堆**。

- 栈内存
  - 存储的值占据内存的空间大小固定
  - 空间较小
  - 可以直接操作栈内存中的变量，执行效率高
  - 由系统自动分配内存空间

存储在栈中的数据是不可变的，原始类型数据就存储在栈内存中：

![栈中的原始类型数据](https://pic.downk.cc/item/5e5d370098271cb2b8e55aeb.jpg)

假设对字符串类型变量`d`重新赋值：
```js
d = 'world'
```
实际上是在栈中又开辟了一块内存空间用于存储`'world'`，然后将变量`d`指向这块空间：

![赋值操作](https://pic.downk.cc/item/5e5d39df98271cb2b8e6e6d2.jpg)

- 堆内存
  - 存储的值占据内存的空间大小不固定
  - 空间较大
  - 无法直接操作堆内存中的变量，需要通过引用地址读取
  - 通过代码进行内存空间分配

引用类型的值实际存储在堆内存中，它在栈中存储了一个固定长度的地址，这个地址指向堆内存中的值：

![堆内存中的引用类型数据](https://pic.downk.cc/item/5e5d3d9898271cb2b8e8c0c9.jpg)

## 拷贝
当我们从一个变量拷贝出另一个变量时，原始类型数据和引用类型数据的表现是不同的。

#### 原始类型
```js
var name = 'hello'
var name2 = name
```

栈内存中分配了一块空间用于存储变量`name`，值为`hello`，从`name`拷贝出一个变量`name2`时，在栈内存中创建了一块新的空间用于存储`hello`，虽然两个变量的值是相等的，但是它们指向的内存空间完全不同，这两个变量的操作互不影响：

![原始类型的拷贝](https://pic.downk.cc/item/5e5d439498271cb2b8ebd601.jpg)

#### 引用类型
```js
var obj = { name: 'hello' }
var obj2 = obj
```

![引用类型的拷贝](https://pic.downk.cc/item/5e5d4c4598271cb2b8ef4d39.jpg)
当拷贝引用类型的变量时，实际上拷贝的是栈内存中存储的地址，所以拷贝出来的`obj2`与`obj`指向了堆中的同一个对象。操作其中任何一个变量，另一个变量都会受到影响，因为它们操作的是堆内存中的同一个对象，这就是为什么会有浅拷贝和深拷贝的原因。

## 深浅拷贝
**浅拷贝和深拷贝都是针对引用类型数据来说的**，上文已经讲过，拷贝对于原始类型数据而言就是在栈内存中另外开辟一块空间存储相同的数据。

> 浅拷贝是指在对引用类型的原始数据进行拷贝时，原始类型属性拷贝其值，引用类型属性只拷贝其内存地址，所以对于拷贝得到的数据和原始数据其中任一个改变了引用类型属性时，另一个也会受影响。

换言之，浅拷贝只拷贝指向某个对象的指针，而不拷贝对象本身，新旧对象还是共享同一块内存。但深拷贝会另外创造一个一模一样的对象，新对象与原对象不共享内存，操作新对象不会影响原对象。


```js
const bill = {
  name: 'Bill',
  hobbies: ['reading', 'photography']
}

const gates = Object.assign({}, bill)
```
![浅拷贝](https://pic.downk.cc/item/5e5e84be98271cb2b8803497.jpg)

> 深拷贝是指对引用类型数据进行拷贝时，从堆内存中开辟一块新的空间用于存储新的对象，源数据和拷贝数据互不影响。

```js
const bill = {
  name: 'bill',
  hobbies: ['reading', 'photography']
}
const gates = deepCopy(bill)
```

![深拷贝](https://pic.downk.cc/item/5e5e88ff98271cb2b8873ae9.jpg)

#### JSON 实现深拷贝
最简单的深拷贝实现——通过借助`JSON.stringify`将对象转为JSON字符串，然后再反转为JavaScript对象，这种方法在业务开发中适用于大多数场景：
```js
function Person (name) {
  this.name = name
  this.friends = ['he', 'she', 'you'],
  this.reg = /\d/
  this.birth = new Date()
  this.say = function () {console.log('hi')}
  this._null= null
  this._undefined = undefined
  this._set = new Set([2,6])
  this._symbol = Symbol('test')
}
const grain = new Person('grain')
const copy = JSON.parse(JSON.stringify(grain))
console.log(grain)
console.log(copy)
```

![grain](https://pic.downk.cc/item/5e5e752d98271cb2b869521c.jpg)
![copy](https://pic.downk.cc/item/5e5e755e98271cb2b869c702.jpg)

但是从上面的例子中可以看到通过`JSON`深拷贝存在以下几个问题：

- 不能正确处理正则类型
- 不能正确处理`Date`类型
- 不能正确处理`Set`、`Map`类型
- 会忽略函数
- 会忽略值为`undefined`的key
- 会忽略`Symbol`类型
- 原型链丢失

且当拷贝对象存在循环引用的时，`JSON.stringify`会出错：

![JSON error](https://pic.downk.cc/item/5e5e765e98271cb2b86b5b01.jpg)

#### 实现一个完善的深拷贝
```js
function deepCopy (source) {
  const type = Object.prototype.toString.apply(source).toLowerCase().slice(8, -1)
  if (source === 'null') {
    // typeof null === 'object'需要单独处理
    return null
  } else if (typeof source !== 'object') {
    return source
  } else if (type === 'regexp') {
    return new RegExp(source)
  } else if (type === 'date') {
    return new Date(source)
  }
  
  // 如何解决Map、Set等类型变量的拷贝？
  // 原型链
  const copy = new source.constructor()
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      // 递归处理属性
      copy[key] = arguments.callee(source[key])
    }
  }
  return copy
}
```

问题：未解决函数拷贝、Map、Set类型数据拷贝
循环引用？

___
#### 参考
1. [你真的掌握变量和类型了吗？](https://juejin.im/post/5cec1bcff265da1b8f1aa08f#heading-6)
2. [深拷贝与浅拷贝的实现](http://www.alloyteam.com/2017/08/12978/)
3. [引用、浅拷贝及深拷贝到Map、Set](https://juejin.im/post/5d843abe6fb9a06af510050c)
4. [深拷贝-循环引用的处理](https://juejin.im/post/5dd0caea6fb9a01fe736b186)