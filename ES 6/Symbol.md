## Symbol

#### 概述
ES5中对象属性名都是字符串，容易造成名命名冲突，为了保证每个属性名都是独一无二的，ES6引入了`Symbol`。

在ES6中，有七种数据类型：Undefined、Null、布尔值、字符串、数值（Number）、Object。

Symbol值通过`Symbol`函数生成，凡是属性名属于Symbol类型都是独一无二的，与其他属性名不会冲突。

	let s = Symbol();
	//这里要注意Symbol函数前不能使用new，因为Symbol生成的是一个原始类型值，不是对象。
	
	typeof s;
	//Symbol

#### 作为属性名的Symbol

	var mySymbol = Symbol()
	//第一种写法：
	var obj = {};
	obj.mySymbol = "Hello!";
	//第二种写法：
	var obj = {
		[mySymbol] : "Hello!"
		//要注意的是在对象内部用Symbol值定义属性的时候，必须将Symbol放在方括号之中。
	}

#### 属性名的遍历
Symbol值作为属性名，该属性不会出现在`for ... in`、`for ... of`中，也不会被`Object.keys()`、`Object.getOwnPropertyNames()`返回。有一个`Object.getOwnPropertySymbols`方法可以指定对象的所有Symbol属性名。

	var obj = {};
	var a = Symbol();
	var b = Symbol();
		
	obj[a] = "Hello ";
	obj[b] = "world!";
	
	var objectSymbol = Object.getPropertySymbols(obj);
	objectSymbol
	//[Symbol(a),Symbol(b)] 

ES6的一个新的API--`Reflect,ownKeys`方法可以返回所有类型的键名，包括常规键名和Symbol键名。

	let obj = {
		[Symbol('my_key')]:2,
		enum:666,
		nunEnum:233
	};
	Reflect.ownKeys(obj)
	//["enum","nonEnum",Symbol(my_key)]
