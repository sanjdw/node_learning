## Set和Map

#### set
set是ES6提供的一种新的数据结构，类似于数组，但是成员都是唯一的，无重复值。

使用Set构造函数来生成Set数据结构：

    const s = new Set();
    ["s","t","u","d","e","n","t"].forEach(x => s.add(x));

    for (let i of s){
        console.log(i);
    }
    //s t u d e n
所以Set也提供了一种数组去重的方法：

    [...new Set(array)]
向Set中加入值得时候，不会发生数值类型转换，`'1'`和`1`是两个不同的值，类似于精确运算符`===`，有一个区别是`NaN`等于自身。

另外，两个对象总是不等的：

    let set = new Set();

    set.add({name:'grain'});
    set.size //1

    set.add({name:'grain'})
    set.size //2
Set实例有两个属性：
- `Set.prototype.constructor`
- `Set.prototype.size`

操作方法：
- `add()` 添加一个值，返回Set本身
- `delete()`  删除一个值，返回布尔值，表示成功/失败
- `has()` 返回布尔值，表示是否为Set成员
- `clear()`   清除所有成员，无返回值

遍历方法：
- `keys()`  返回键名的遍历器
- `values()`    返回键值的遍历器
- `entries` 返回键值对的遍历器
- `forEach` 使用回调函数遍历每个成员

***

    let set = new Set(['red', 'green', 'blue']);

    for (let item of set.keys()) {
      console.log(item);
    }
    // red
    // green
    // blue

    for (let item of set.values()) {
      console.log(item);
    }
    // red
    // green
    // blue

    for (let item of set.entries()) {
      console.log(item);
    }
    // ["red", "red"]
    // ["green", "green"]
    // ["blue", "blue"]
Set结构的实例默认可遍历，它的默认遍历器生成函数就是它的values方法。

这意味着，可以省略values方法，直接用`for...of`循环遍历Set。

    let set = new Set(['red', 'green', 'blue']);

    for (let x of set) {
      console.log(x);
    }
    // red
    // green
    // blue
Set的`forEach`方法和数组的`forEach`基本相同。

    let set = new Set([1, 2, 3]);
    set.forEach((value, key) => console.log(value * 2) )
    //2
    //4
    //6
利用Set可以容易的实现并集、交集和差集：

    let a = new Set([1,2,3,4]);
    let b=  new Set([4,5,6,6]);

    //并集
    let union = new Set([...a,...b])

    //交集
    let intersect = new Set([...a].filter(x => b.has(x)))

    //差集
    let diff = new Set([...a].filter(x => !b.has(x)))

#### WeakSet
与Set类似，WeakSet也是不重复值的集合，它与Set有两个区别：
- WeakSet的成员只能是对象。
- WeakSet的对象是弱引用，无法引用WeakSet的成员，也无法遍历WeakSet的成员。

    var ws = new WeakSet();
    ws.add(1)
    // TypeError: Invalid value used in weak set
    //只能添加对象成员

WeakSet实例有以下三个方法：
- add() 添加成员
- delete()  清除指定成员
- has() 返回一个布尔值，表示是否为WeakSet成员

**WeakSet没有`size`属性，不能遍历成员。**

#### Map
JavaScript中的对象，本质上是键值对的集合，由于只能用字符串当做键，它的使用收到了限制：

    var data = {};
    var element = document.getElementById('myDiv');

    data[element] = 'metadata';
    data['[object HTMLDivElement]'] // "metadata"
由于对象只接受字符串作键名，element在data对象中被自动转为字符串`[object HTMLDivElement]`。

ES6提供了Map数据结构，它类似于对象，也是键值对的集合，但是键的范围不限于字符串。

    var m = new Map();
    var o  = {p : 'Hello World'};

    m.set(o, 'content');
    m.get(o) // 'content'

    m.has(o)    //true
    m.delete(o) //true
    m.has(o)    //false


