#### ECMA-262第5版在定义只有内部才用的`特性`时，描述了`属性`的的各种特征。
#### 这些特性被放在了两对方括号[[]]中，JavaScript不能直接访问它们。
#### ECMAScript有两种属性：`数据属性`和`访问器属性`。

## 数据属性
数据属性的四个特性：
 - `[[Configurable]]`  能否通过`delete`删除属性从而重新定义属性，能否修改属性的特性，能否把属性修改为访问器属性，默认为true。
 - `[[Enumerable]]`    能否通过`for-in`循环返回属性，默认为true。
 - `[[Writable]]`      属性的值能否被更改，默认为true。
 - `[[Value]]`         属性的值，默认为undefined。

比如，

    var person ={
        name: "mike"
    }
那么，`person`这个对象有一个`name`属性，
这个`name`属性的
   - `[[Configurable]]`
   - `[[Enumerable]]`
   - `[[Writable]]`
    特性均被默认设置为true，而`name`属性的`value`特性被设置为指定的`mike`。

修改属性的默认特性需要使用`Object.defineProperty()`方法。
**IE8是第一个实现`Object.defineProperty()`方法的浏览器版本。**

    var person = {};
    Object.defineProperty(person,"name",{
        writable:false,
        value: "mike"
    })

    console.log(person.name);//mike

    person.name = "james";

    console.log(person.name);//mike

## 访问器属性
访问器属性的四个特性：
 - `[[Configurable]]`  能否通过`delete`删除属性从而重新定义属性，能否修改属性的特性，能否把属性修改为数据属性，默认为true。
 - `[[Enumerable]]`    能否通过`for-in`循环返回属性，默认为true。
 - `[[Get]]`           在读取属性是调用的函数，默认为undefined。
 - `[[Set]]`           在写入属性是调用的函数，默认为undefined。

        var book = {
            _year:2017,//这里 year前加_，表示只通过对象方法访问year属性（book._year），不再走访问器属性的getter，setter
            writer:"mike"
        }
        Object.defineProperty(book,"year",{
            get:function(){
                console.log("get");
                return this._year;
            },
            set:function(newValue){
                console.log("set");
                this._year = newValue;
            }
        })
        console.log(book._year); //2017
        console.log(book._year);//"get",2017
