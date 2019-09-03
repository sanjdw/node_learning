## Proxy
#### 概述
Proxy用于修改某些操作的默认行为。
ES6之前：

        var obj = new Proxy({}, {
            get: function (target, key, receiver) {
                console.log(`getting ${key}!`);
                return Reflect.get(target, key, receiver);
            },
            set: function (target, key, value, receiver) {
                console.log(`setting ${key}!`);
                return Reflect.set(target, key, value, receiver);
            }
        });
        //对一个空对象假设一层拦截，重新定义了属性的ge`和set行为。
        obj.count = 1;
        //setting count!

        ++obj.count;
        //getting count!
        //setting count!
        //2

ES6 原生提供 Proxy 构造函数，用来生成 Proxy 实例。

        var proxy = new Proxy(target, handler);

其中，new Proxy()表示生成一个Proxy实例，target参数表示所要拦截的目标对象，handler参数也是一个对象，用来定制拦截行为。

        var proxy = new Proxy({}, {
            get: function(target, property) {
                return 35;
            }
        });

        proxy.time // 35
        proxy.name // 35
        
要使得Proxy起作用，必须针对Proxy实例（上例是proxy对象）进行操作，而不是针对目标对象（上例是空对象）进行操作。
