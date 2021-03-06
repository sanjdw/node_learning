## Class
### 基本语法
JavaScript传统方法是通过构造函数定义生成对象：

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    Point.prototype.toString = function () {
        return `(${this.x},${this.y)}`;
    };

    var p = new Point(1, 2);

ES6提供了更接近传统语言的写法，引入了`Class`（类）这个概念，作为对象的模板。

通过class关键字，可以定义类。基本上，ES6的`Class`可以看作只是一个语法糖，它的绝大部分功能，ES5都可以做到，新的`Class`写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        toString() {
            return '(' + this.x + ', ' + this.y + ')';
        }
    }
定义“类”的方法的时候，前面不需要加上`function`关键字。另外，方法之间不需要逗号分隔，加了会报错。

事实上，类的所有方法都定义在类的prototype属性上面：

    var point = new Point(1,2);
    point.constructor === Point.prototype.constructor

类的内部所有定义的方法，都是不可枚举的,这一点与ES5的行为不一致。

类的方法名，可以采用表达式：

    let methodName = "toString";
    class Square{
        constructor(length) {
            // ...
        }

        [methodName]() {
            // ...
        }
    }

### constructor方法
constructor方法是类的默认方法，通过new命令生成对象实例时，自动调用该方法。一个类必须有constructor方法，如果没有显式定义，一个空的constructor方法会被默认添加。

**constructor方法默认返回实例对象（即this），完全可以指定返回另外一个对象**：

    class Foo {
        constructor() {
            return Object.create(null);
        }
    }

    new Foo() instanceof Foo
    // false
类的构造函数，不使用new是没法调用的，会报错。这是它跟普通构造函数的一个主要区别，后者不用new也可以执行。

    class Foo {
      constructor() {
        return Object.create(null);
      }
    }

    Foo()
    // TypeError: Class constructor Foo cannot be invoked without 'new'

### 类的实例对象
实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）：

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        toString() {
            return '(' + this.x + ', ' + this.y + ')';
        }
    }

    var point = new Point(2, 3);

    point.toString() // (2, 3)

    point.hasOwnProperty('x') // true
    point.hasOwnProperty('toString') // false
    point.__proto__.hasOwnProperty('toString') // true

### 不存在变量提升

    new Foo();// ReferenceError
    class Foo{
        //
    }

### 私有方法
私有方法是常见需求，但 ES6 不提供，只能通过变通方法模拟实现：

一种是命名区分：

    class Widget {
       // 公有方法
        foo (baz) {
            this._bar(baz);
        }

       // 私有方法
        _bar(baz) {
            return this.snaf = baz;
        }
        // ...
    }
事实上在类的外部依然可以调用到这个方法。

另一种是将私有方法移出模块，因为模块内的所有方法对外都是可见的：

    class Widget {
        foo (baz) {
            bar.call(this, baz);
        }
        // ...
    }

    function bar(baz) {
        return this.snaf = baz;
    }
还有一种方法是利用Symbol值的唯一性，将私有方法的名字命名为一个Symbol值：(感觉并没有什么卵用？)

    const bar = Symbol('bar');
    const snaf = Symbol('snaf');

    export default class myClass{
       // 公有方法
        foo(baz) {
            this[bar](baz);
        }
       // 私有方法
        [bar](baz) {
            return this[snaf] = baz;
        }
      // ...
    };

### this的指向
类的内部方法如果含有`this`，它默认指向类的实例。

    class Logger {
        printName(name = 'there') {
            this.print(`Hello ${name}`);
        }

        print(text) {
            console.log(text);
        }
    }

    const logger = new Logger();
    const { printName } = logger;
    printName(); // TypeError: Cannot read property 'print' of undefined
将这个方法提取出来单独使用，this会指向该方法运行时所在的环境，因为找不到print方法而导致报错。

**类和模块的内部，默认就是严格模式，所以不需要使用use strict指定运行模式。**

## class的继承
Class之间可以通过`extends`关键字实现继承，这比ES5的通过修改原型链实现继承，要清晰和方便很多。

    class ColorPoint extends Point {
        constructor(x, y, color) {
            super(x, y); // 调用父类的constructor(x, y)
            this.color = color;
        }

        toString() {
            return this.color + ' ' + super.toString(); // 调用父类的toString()
        }
    }
在constructor方法和toString方法中，都出现了super关键字，表示**父类的构造函数，用来新建父类的this对象**。

**子类必须在constructor方法中调用super方法，否则新建实例时会报错。这是因为子类没有自己的this对象，而是继承父类的this对象，然后对其进行加工。** 如果不调用super方法，子类就得不到this对象。

ES5的继承，实质是先创造子类的实例对象this，然后再将父类的方法添加到this上面（Parent.apply(this)）。**ES6的继承机制完全不同，实质是先创造父类的实例对象this（所以必须先调用super方法），然后再用子类的构造函数修改this。**