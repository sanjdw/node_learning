BFC是面试中常见的一个考察点，之前在网上看过很多总结BFC的文章，看得云里雾里。最近抽空又仔细查阅了一遍相关的资料，将它总结在这里。

在解释BFC之前，需要先了解盒子（Box）与格式化上下文（Formatting Context）的关系。

CSS渲染的时候以Box作为渲染的基本单位，Box的类型由元素的类型和display属性共同决定，不同类型的Box会参与不同类型的`Formatting Context`（一个决定如何渲染元素的容器）布局：
- block-level box：display属性为block/list-item/table的元素，会**生成**block-level box，并**参与**block fomatting context
- inline-level box：display属性为inline/inline-block/inline-table的元素，会**生成**inline-level box，并且**参与**inline formatting context
- run-in box：CSS3新增了grid布局以及flex布局，display属性为grid/flex的元素会分别参与GFC、FFC

`Formatting context`是W3C CSS2.1规范中的一个概念，指的是页面中的一块渲染区域拥有一套渲染规则，它决定了其子元素将如何定位，以及和其他元素的关系和相互作用。

像上文提到的，块级格式化上下文BFC（block formatting context）就属于格式化上下文中的一种，它规定了内部的**block-level box**如何布局。

### 1. BFC的渲染规则是什么？
1. `BFC`内部的盒子在垂直方向上从上到下排列，相邻的两个盒子的`margin`在**垂直**方向上会发生重叠（合并后以**较大的margin**为准）
2. `BFC`内部盒子（不论是浮动盒子还是普通盒子）的左外边缘总是与包含块的左边缘相接触（对于从右到左的格式，则是右边缘接触）
3. `BFC`的区域不会与浮动元素重叠
4. 计算`BFC`的高度时，浮动元素也参与计算
5. `BFC`内部元素不会影响到外面的元素，外面的元素也不会影响BFC内部元素


上面提到的盒子均指的是`block-level box`。

### 2. 如何创建BFC？
1. html根元素
2. 浮动元素（`float`值不为`none`）
3. 绝对定位元素（`position`值为`absolute`或`fixed`）
4. `display`值为`inline-block`、`table-cell`、`table-caption`、`flex`
5. `overflow`值为`hidden`、`auto`、`scroll`

### 3. BFC应用
##### 3.1 外边距重叠
先来看一段代码：
```html
<style>
  p {
    color: #f55;
    background: #fcc;
    width: 200px;
    line-height: 100px;
    text-align:center;
    margin: 100px;
  }
</style>
<body>
  <p>哈哈</p>
  <p>嘿嘿</p>
</body>
```

实际上两个p元素之间的**垂直**距离并不是200px，发生了重叠：
![margin重叠](https://img.imgdb.cn/item/602e9951e7e43a13c6115d07.jpg)

可以在p元素外包括一层，并为包括层创建BFC使不同的p元素处于不同的BFC中来解决margin重叠问题：
```html
<style>
  .container {
    overflow: hidden;
  }
</style>
<body>
  <div class="container">
    <p>哈哈</p>
  </div>
  <div class="container">
    <p>嘿嘿</p>
  </div>
</body>
```

##### 3.2 margin穿透
先来看代码：
```html
<style>
  .parent{
    width: 100px;
    height: 100px;
    background: lightcoral;
  }
  .child{
    width: 50px;
    height: 50px;
    margin-top: 50px;
    background: lightblue;
  }
</style>
<body>
  <div class="parent">
    <div class="child"></div>
  </div>
</body>
```

父元素没有设置`padding`、`border`，也没有文字，父元素会随着子元素设置的margin-top一起往下掉，这个现象就叫做margin值穿透：
![margin穿透](https://img.imgdb.cn/item/602eb91be7e43a13c61e5b17.jpg)

为什么会有margin穿透问题[这篇文章](https://zhuanlan.zhihu.com/p/30168984)里进行了分析。

一种解决办法是为父元素设置`border`、`padding`或者文字内容；
另一种是为父元素创建BFC（比如为父元素设置overflow: hidden），改变父级元素渲染规则。

##### 3.3 浮动导致父元素高度塌陷
先来看一段代码：
```html
<style>
  .parent {
    border: 1px solid #000;
    width: 300px;
  }

  .child {
    border: 1px solid #f66;
    width:100px;
    height: 100px;
    float: left;
  }
</style>
<body>
  <div class="parent">
    <div class="child"></div>
    <div class="child"></div>
  </div>
</body>
```

浮动元素脱离了标准文档流，导致其父元素高度塌陷：
![浮动元素导致父元素高度塌陷](https://img.imgdb.cn/item/602e91c8e7e43a13c60e2c6c.jpg)

根据前文提到的BFC渲染规则的第4条，可以通过为父元素创建BFC（比如为父元素设置overflow: hidden）来解决这个问题：
![父元素触发BFC解决高度塌陷](https://img.imgdb.cn/item/602e932ce7e43a13c60ecbf6.jpg)

##### 3.4 自适应两栏布局
先来看一段代码：
```html
<style>
  body {
    margin: 0;
    width: 500px;
  }

  .aside {
    width: 100px;
    height: 150px;
    float: left;
    background: #f66;
  }

  .main {
    height: 200px;
    background: #fcc;
  }
</style>
<body>
  <div class="aside"></div>
  <div class="main"></div>
</body>
```

效果如下：
![页面](https://img.imgdb.cn/item/602e88dee7e43a13c60a90c6.jpg)

由于浮动元素`aside`脱离了标准文档流，它遮挡住了`main`的一部分。

根据前文提到的BFC渲染规则的第3条——`BFC`的区域不会与浮动元素重叠，可以通过为`main`创建新的BFC（比如为其设置overflow: hidden），这个新的BFC不会与浮动的`aside`重叠，从而实现自适应两栏布局：
![BFC阻止与浮动元素重叠](https://img.imgdb.cn/item/602e8b66e7e43a13c60b925b.jpg)

___
### 参考：
1. [深度剖析Margin塌陷，BFC，Containing Block之间的关系](https://zhuanlan.zhihu.com/p/30168984)
2. [前端精选文摘：BFC 神奇背后的原理](https://www.cnblogs.com/lhb25/p/inside-block-formatting-ontext.html#!comments)
