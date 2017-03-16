**ES6新增的let命令声明变量，使得js有了`代码块（块级作用域)`的概念。**
## let

在ES5中，

        {
            var a=1;
        }
//在{}外还是可以访问到a的，它成为了一个全局变量。
而在ES6中，

        {
            let a=1;
        }
//在{}外就无访问a了。

for循环还有一个特别之处，就是循环语句部分是一个父作用域，而循环体内部是一个单独的子作用域。

        for(let i =0;i<10;i++){
            let i ="hahaha";
            console.log(i);
        }
//会输出10次`hahaha`，这说明循环（）内的i和循环体内的i是分离的，**循环语句部分是一个父作用域，循环体是一个单独的子作用域**。

**不会像ES5中那样出现变量提升的情况了：当` let`生命一个变量之前访问这个变量会出` Uncaught ReferenceError` 的错。**

### 暂时性死区

    if (true) {
        // TDZ开始
        tmp = 'abc'; // ReferenceError
        console.log(tmp); // ReferenceError

        let tmp; // TDZ结束
        console.log(tmp); // undefined

        tmp = 123;
        console.log(tmp); // 123
    }

    let x=x;//也会报错

### 不允许重复声明(在同一个作用域内)

    function f1() {
        let n = 5;
        if (true) {
            let n = 10;
        }
        console.log(n); // 5
    }

**块级作用域使得ES5中的IIFE不再必要了**

## const
声明常量，一旦声明再更改就会报错。

    const PI = 3.1415;
    PI = 3.14;//TypeError: Assignment to constant variable.

这也就意味着const声明一个常量的同时必须初始化它，因为之后无法更改。

**与let一样，const声明的常量同样只在块作用域内有效**