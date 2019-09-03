## 函数拓展

#### 函数参数的默认值
 在ES6之前，不能为函数指定默认值，只能采取这样的写法传默认值：

    function log(x, y) {
      y = y || 'world';
      console.log(x, y);
    }

    log('Hello') // Hello world
    log('Hello', 'china') // Hello china
 在ES6中允许函数带默认值：

    function log(x="world"){
        console.log("hello "+x);
    }
    log();//hello world
    log("china");//hello china

#### rest参数
 ES6引入rest参数获取多余变量，形式为 **...变量名**：

    function add(...arr){//多余的参数被存进arr里，成为一个数组
        let sum = 0;
        for(let i of arr){
            sum += i;
        }
        return sum;
    }
    add(1,2,3);//6
 rest参数后面不能再有参数。

#### 拓展运算符
拓展运算符是三个点 **...**，可以比作rest参数的逆运算，将一个数组转为用逗号隔开的参数序列：

    console.log(...[1,2,3])//1 2 3

    function push(arr,...items){
        arr.push(...items);
    }

    function add(x,y){
        return x+y;
    }

    var numbers = [4,5];
    add(...numbers);//9

    将字符串转为数组：
    [..."hello"]
    //["h","e","l","l","o"]
    合并数组：
    [...[1,2,3],...[4,5,6],...[7,8,9]]
    //[1,2,3,4,5,6,7,8,9]

#### 箭头函数

    var f = v => v;
        等价于：
    var f = function(v){
        return v;
    }
当不需要参数或者参数有多个时，用一个圆括号圈起来表示：

    var f = () => 5;
        等价于
    var f = function(){
        return 5;
    }

    var f = (a,b) => a + b;
        等价于：
    var f = function(a,b){
        return a + b;
    }

箭头函数有以下几个使用注意点：

1. **函数体内的this对象，是定义时所在的对象，而不是使用时所在的对象**。

2. 不可以当作构造函数，也就是说，不可以使用new命令，否则会抛错。

3. 不可以使用arguments对象，arguments对象在函数体内不存在。要用的话可以用Rest参数代替。

4. 不可以使用yield命令，因此箭头函数不能用作Generator函数。

下面是两个例子：

    function foo() {
        setTimeout(() => {
            console.log('name:', this.name);
        }, 100);
    }

    var name = "global";

    foo.call({ name: "inner" });
    //name:inner

第二个：

    function Timer() {
        this.s1 = 0;
        this.s2 = 0;
        setInterval(() => this.s1++, 1000);
        setInterval(function () {
            this.s2++;
        }, 1000);
    }

    var timer = new Timer();

    setTimeout(() => console.log('s1: ', timer.s1), 3100);
    setTimeout(() => console.log('s2: ', timer.s2), 3100);
    //s1:3
    //s2:0

this指向的固定化，并不是因为箭头函数内部有绑定this的机制，实际原因是箭头函数根本没有自己的this，导致内部的this就是外层代码块的this。
箭头函数转成ES5的代码如下：

    // ES6
    function foo() {
        setTimeout(() => {
            console.log('id:', this.id);
        }, 100);
    }

    // ES5
    function foo() {
        var _this = this;

        setTimeout(function () {
            console.log('id:', _this.id);
        }, 100);
    }

 在下面代码之中，只有一个this，即函数foo的this，所以t1、t2、t3都输出同样的结果。因为所有的内层函数都是箭头函数，都没有自己的this，它们的this其实都是最外层foo函数的this。

    function foo() {
        return () => {
            return () => {
                return () => {
                    console.log('id:', this.id);
                };
            };
        };
    }

    var f = foo.call({id: 1});

    var t1 = f.call({id: 2})()(); // id: 1
    var t2 = f().call({id: 3})(); // id: 1
    var t3 = f()().call({id: 4}); // id: 1

##### 嵌套箭头函数
先看ES5中的一个嵌套函数：

    function insert(value) {
        return {into: function (array) {
            return {after: function (afterValue) {
                array.splice(array.indexOf(afterValue) + 1, 0, value);
                return array;
            }};
        }};
    }

    insert("love").into(["i", "u"]).after("i"); //["i","love", "u"]

用箭头函数改写：

    let insert = (value) => ({into: (array) => ({after: (afterValue) => {
        array.splice(array.indexOf(afterValue) + 1, 0, value);
        return array;
    }})});

    insert("love").into(["i", "u"]).after("i"); //["i","love", "u"]

#### 绑定this
箭头函数可以绑定`this`对象，减少了显示绑定的写法（apply,call,bind），但是并不能适用于所有的场合，所以ES7提出了`函数绑定`运算符，函数绑定运算符是并排的两个双冒号——(`::`)，双冒号左边是一个对象，右边是一个函数，该运算符自动将左边的对象作为上下文环境绑定到右边的函数上面。

    foo::bar;
    //等价于
    bar.bind(foo);

    foo::bar(...arguments)
    //等价于
    bar.apply(foo,arguments)

如果双冒号左边为空，右边为一个对象方法，则等于将该方法绑定到该对象上去。

    var method = ::obj.foo;
    //等价于
    var method = obj::obj.foo;

    let log = ::console.log;
    //等价于
    let log = console.log::console.log

#### 尾掉优化
尾调用是一个函数式编程的概念，是指某个函数的最后一步是调用另一个函数。

    function f(){
        return g();
    }

由于函数调用在内存中会有入栈的操作，而尾调用是函数的最后一步，所以不需要保留外层函数的调用帧，看一下下面的代码：

    function f(){
        let m = 1;
        let n = 2;
        return g(m+n);
    }
    f();

    //等价于
    function f(){
        g(3);
    }
    f();

    //等价于
    g(3);

 这个就叫`尾调用优化`，即只保留内层函数的调用帧，这样做的意义在于节省内存。

 #### 尾递归
 函数自身调用自身，为递归。如果尾调用自身，称为尾递归。

 递归耗费内存，而且容易发生`栈溢出`错误。对于尾递归而言，由于只需要一个调用帧，所以不会发生 `栈溢出`。

    function factorial(n){
        if(n == 1) return 1;
        return n * factorial(n - 1);
    }
    factorial(5);//120

复杂度为O(n)。

改写成尾递归，复杂度为O(1)：

    function factorial(n,total){
        if(n == 1) return total;
        return factorial(n-1,n * total);
    }
    factorial(5,1);//120

