今天在写python的时候遇到这样一个问题：在将前端通过表单POST请求来的数据作用于修改数据库前，需要纪录这个对象模型的哪些字段发生了更改。

先通过表单POST而来的数据生成一个与模型对应的对象，一个蛋疼的问题是在验证这个表单数据的合法性时POST数据就会commit到数据库中，导致没有办法取到修改前的对象数据作比较。最后想到的解决办法就是，深拷贝这个对象。之后就想到了JavaScript中的深拷贝这个概念，总结：

#### 浅拷贝
浅拷贝是在另一块地址中创建一个新的变量或容器，但是这个变量地址是源对象的地址的拷贝，即新的变量和旧的元素指向同一块内存空间。
#### 深拷贝
深拷贝是在另一块地址中创建一个新的变量或容器，但这个变量的地址是不同于源对象的地址的，仅仅是变量的值相同而已，是独立于源对象的完全副本。

在谈JavaScript的浅拷贝、深拷贝之前，需要先了解JavaScript的变量类型：

- 基本类型
Undefined、Null、Number、String和Boolean5中基本数据类型，变量存放在栈内存中，可直接访问。

- 引用类型
Object、Array、Function等，变量存放在堆内存中，保存的是一个对象。当需要访问引用类型的值时，首先从栈中获得该对象的地址指针，然后从堆内存中取得数据。

#### JavaScript的浅拷贝
在JavaScript中谈基本类型的变量拷贝似乎没有什么意义，对于引用类型变量之间的赋值就是浅拷贝：

	var obj_a = {
		name: "sanjdw",
		gender: "male"
	}
	var obj_b = obj_a;
	obj_b.name = "grain";
	console.log(obj_a);//"grain"，双向改变
或者 Object.assign()

	var obj_a = {
		name: "sanjdw",
		gender: "male"
	}
	var obj_b = Object.assign({}, obj_a);//将obj_a所有可枚举属性拷贝到{}，并将{}作为返回赋给obj_b

#### JavaScript的深拷贝
1.最简单的一种方法：

	var obj_b = JSON.parse(JSON.stringify(obj_a));

这种方法会导致对象的constructor被置成Object。

2.另一种方法，最直接的想法就是：

	var obj_b = {};
	for (var attr in obj_a){
		obj_b[attr] = obj_a[attr];
	}
这种方法看起来好像没什么问题，当对象结构复杂一点的时候就出现问题了：

	var obj_a = {
		name: "sanjdw",
		info: {
				"home": "Nanjing"
				},
		friends: ["luyi", {
					"pingpang": "zhihong",
					"coding": "wangxiang"
				}],
	}
	obj_b.info.home = "Jiangsu";
	obj_b.friends.pingpang = "hainan";
	console.log(obj_a.info.home);//"Jiangsu"
	console.log(obj_a.friends.pingpang);//"hainan"
按照这个思路，需要对对象和数组处理：

	function DeepCopy(target, source){
		for(var attr_name in source){
			var attr_value = source[attr_name];
			if(Object.prototype.toString.call(attr_value).slice(8,-1) == "Array"){
				target[attr_name] = arguments.callee(target[attr_name]||[], attr_value);
			}else if(Object.prototype.toString.call(attr_value).slice(8,-1) == "Object" ){
				target[attr_name] = arguments.callee(target[attr_name]||{}, attr_value)
			}else{
				target[attr_name] = attr_value;
			}
		}
		return target;
	}
	var obj_b = DeepCopy({}, obj_a);