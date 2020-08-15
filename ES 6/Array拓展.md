## 数组的拓展

### Array.from()
`Array.from()`方法用于将两类对象转化为真正的数组——类似数组的对象和可遍历的对象（包括Set和Map）。

类似数组的对象：

    let arrayLike = {
        '0' : 'a',
        '1' : 'b',
        '2' : 'c',
        length : 3
    };

    ES5的写法：
    var arr1 = Array.prototype.slice.call(arryLike)//['a','b','c']

    ES6的写法：
    var  arr1 = Array.from(arrayLike)//['a','b','c']

**在实际应用中，常见的类似数组的对象是DOM操作返回的NodeList集合，以及函数内部的`arguments`对象。**
