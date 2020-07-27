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
```js
var person ={
	name: "mike"
}
```
那么，`person`这个对象有一个`name`属性，
这个`name`属性的
   - `[[Configurable]]`
   - `[[Enumerable]]`
   - `[[Writable]]`
    特性均被默认设置为true，而`name`属性的`value`特性被设置为指定的`mike`。

修改属性的默认特性需要使用`Object.defineProperty()`方法。

**IE8是第一个实现`Object.defineProperty()`方法的浏览器版本。**
```js
var person = {};
Object.defineProperty(person,"name",{
	writable:false,
	value: "mike"
})

console.log(person.name);//mike

person.name = "james";

console.log(person.name);//mike
```

## 访问器属性
访问器属性的四个特性：
 - `[[Configurable]]`  能否通过`delete`删除属性从而重新定义属性，能否修改属性的特性，能否把属性修改为数据属性，默认为true。
 - `[[Enumerable]]`    能否通过`for-in`循环返回属性，默认为true。
 - `[[Get]]`        在读取属性时调用的函数，默认为undefined。
 - `[[Set]]`        在写入属性时调用的函数，默认为undefined。
		```js
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
		console.log(book.year);//"get", 2017
		book._year = 2016;//2016
		book.year = 2015; //"set", 2015
		```

**所以对象属性的getter,setter方法相当于拦截器，直接去访问对象的属性的实质是调用对应的属性的getter和setter方法。**

## 现在来看一道题目：
```js
var foo = (function(){
	var O = {
		a: 1,
		b: 2,
		/**更多属性**/
	};
	return function(key) {
		return o[key];
	}
})();
```

对象O有多个属性，不修改代码，编写另一段代码获取对象o的所有属性？

foo()在这里形成了一个闭包，foo("a")返回1，看似现在我们只能访问对象O的属性，不能访问对象O。

如果对象O有一个属性，假设它叫"shuxing",当我们访问这个属性的时候，让这个属性返回对象本身就可以了。

这个属性怎么来呢?

`Object.defineProperty()`要作用在一个对象上的，现在又没有办法直接访问对象O。

但是我们有`prototype`。
```js
Object.defineProperty(Object.prototype, "shuxing", {
	get:function(){   //注意这里是访问器的get方法，而不是直接定义了对象的一个方法。因为在setter,getter里面，this指向的总是对象本身！
		return this;
	}
})

var obj =foo("shuxing"); //这里就拿到了对象O。
Object.keys(obj);  //['a','b']
```

有一个问题是如果对象本身就有`shuxing`这个属性就尴尬了。
 
所以用es6的`symbol`。
```js
	var symbol = Symbol();
	Object.defineProperty(Object.prototype, symbol, {
		//同上
	}
```
