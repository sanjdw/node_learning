> TypeScript的核心原则之一是对值所具有的结构进行类型检查。 

在TypeScript里，接口的作用就是为这些类型命名、代码或第三方代码定义契约。

#### 接口初探
```ts
function printLabel(labelledObj: { label: string }) {}

let myObj = { size: 10, label: "Size 10 Object" };
```

类型检查器会查看`printLabel`的调用。 `printLabel`有一个参数，并要求这个对象参数有一个名为`label`类型为`string`的属性。 需要注意的是在这里传入的对象参数实际上会包含很多属性，但是编译器只会检查那些必需的属性是否存在，并且其类型是否匹配。

使用接口重写上面的例子：
```ts
interface LabelledValue {
  label: string;
}

function printLabel(labelledObj: LabelledValue) {}

let myObj = {size: 10, label: "Size 10 Object"};
```

`LabelledValue`接口就好比一个名字，用来描述上面例子里的要求。 它代表了有一个`label`属性且类型为`string`的对象。 需要注意的是在这里只会去关注值的外形，只要传入的对象满足上面提到的必要条件，那么它就是被允许的。

此外，类型检查器也不会去检查属性的顺序，只要相应的属性存在并且类型也是对的就可以。

#### 可选属性
```ts
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): {color: string; area: number} {
  let newSquare = {color: "white", area: 100};
  if (config.color) {
    newSquare.color = config.color;
  }
  if (config.width) {
    newSquare.area = config.width * config.width;
  }
  return newSquare;
}

let mySquare = createSquare({color: "black"});
```

可选属性的好处之一是可以对可能存在的属性进行预定义，好处之二是可以捕获引用了不存在的属性时的错误。 比如，我们故意将`createSquare`里的`color`属性名拼错，就会得到一个错误提示：
```ts
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  let newSquare = {color: "white", area: 100};
  if (config.clor) {
    // Property 'clor' does not exist on type 'SquareConfig'. Did you mean 'color'?
    newSquare.color = config.clor;
  }
  if (config.width) {
    newSquare.area = config.width * config.width;
  }
  return newSquare;
}

let mySquare = createSquare({color: "black"});
```
