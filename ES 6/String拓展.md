## 字符串拓展

#### 字符串的Unicode表示：
在JavaScript中可以用`\uxxxx`的形式表示字符，码点范围为`\u0000`~`\uFFFF`，超出这个范围的字符要用占两个字节：
```
	"\uD842\uDFB7"
	//字符  "吉
```

在ES6中可以使用一个大括号将超出范围的码点表示出来：
```
	"\u{20BB7}"
	//字符  "吉"
```

### includes(),startsWith(),endWith()
在ES6之前，只有一个`indexOf`方法可以直接使用去判断一个字符串是否包含另一个字符串，在ES6中，新增了三个方法：
```js
var s = 'Hello world!';

s.startsWith('Hello') // true
s.endsWith('!') // true
s.includes('o') // true
```

这三个方法都支持第二个参数，表示开始搜索的位置。
```js
s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false
```

### repeat()
repeat方法返回一个新字符串，表示将原字符串重复n次。
```js
"hello".repeat(3) //"hellohellohello"
```

### 模板字符串
传统JavaScript中，输出模板：
```js
//变量拼接字符串
$('#result').append(
	'There are <b>' + basket.count + '</b> ' +
	'items in your basket, ' +
	'<em>' + basket.onSale +
	'</em> are on sale!'
);
```

在ES6中，模板字符串：
```js
//使用反引号(`):
$('#result').append(`
	There are <b>${basket.count}</b> items
		in your basket, <em>${basket.onSale}</em>
	are on sale!
`);

function fn() {
	return "Hello World";
}

`foo ${fn()} bar`
//foo Hello World bar
```

### 标签模板
```js
function tag(arg1,arg2,arg3){
	// ...
}
var a = 5,b = 10;

tag`Hello ${ a + b } world ${ a * b }`
//相当于  tag(['Hello ','world ',' '],15,50)
```