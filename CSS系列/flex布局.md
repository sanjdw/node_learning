我们知道，并列书写的多个div标签，它们会在竖直方向上从上往下排列。如果我们想让多个同层级的div水平排列，就需要借助`position`、`float`或者`display`属性，这就是传统盒模型的做法。

2009年，W3C 提出了一种新的方案----Flex 布局，可以简便、完整、响应式地实现各种页面布局。目前，它已经得到了所有浏览器的支持。

`Flex`是`Flexible Box`的缩写，意为"弹性布局"。

### 1. 基本概念
采用Flex布局的元素，称为Flex容器（flex container）。它的所有子元素会自动成为容器成员，称为Flex项目（flex item）。

任何一个容器都可以指定为Flex布局，包括行内元素：
```css
.box {
  display: flex | inline-flex
}
```

设为Flex布局以后，容器内的子元素的float、clear和vertical-align属性将失效。

容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis）。主轴的开始位置（与边框的交叉点）叫做`main start`，结束位置叫做`main end`；交叉轴的开始位置叫做`cross start`，结束位置叫做`cross end`：
![flex](https://img.imgdb.cn/item/602f5cfde7e43a13c66419d4.png)

项目默认沿**主轴**排列。单个项目占据的主轴空间叫做`main size`，占据的交叉轴空间叫做`cross size`。

### 2. 容器的属性
flex容器上有6个属性：
##### 2.1 flex-direction
`flex-direction`属性决定主轴的方向（即项目的排列方向）,它共有4个可选值：
- column-reverse：主轴为垂直方向，起点在下沿
- column：主轴为垂直方向，起点在上沿
- row：主轴为水平方向，起点在左端
- row-reverse：主轴为水平方向，起点在右端

对应的项目的排列如下：
![flex-direction](https://img.imgdb.cn/item/602f69fae7e43a13c66fe869.png)

`flex-direction`默认值是`row`。

##### 2.2 flex-wrap
项目沿主轴方向排列，`flex-wrap`属性定义了如果一条轴线排不下，项目如何换行，它有3个可选值：
- nowrap：不换行
- wrap：换行，第一行在上方
  ![flex-wrap: wrap](https://img.imgdb.cn/item/602f6d6ce7e43a13c6728baf.jpg)
- wrap-reverse：换行，第一行在下方
  ![flex-wrap: wrap-reverse](https://img.imgdb.cn/item/602f6d8ae7e43a13c672a0a7.jpg)

`flex-wrap`默认值是`nowrap`。

##### 2.3 flex-flow
`flex-flow`是`flex-direction`加上`flex-wrap`的简写形式，默认值自然为`row nowrap`了。

##### 2.4 justify-content
`justify-content`属性定义了项目在主轴上的对齐方式，它有5个可选值：
- flex-start：起点对齐
- flex-end：终点对齐
- center：中点对齐
- space-between：两端对齐，项目之间的间隔都相等，两端的项目与容器边框无间隔
- space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比两端的项目与容器边框的间隔大一倍

对应项目在主轴上的对齐效果分别如下：
![justify-content](https://img.imgdb.cn/item/602f749ae7e43a13c6781938.png)

`justify-content`默认值是`flex-start`。

##### 2.5 align-items
`align-items`属性定义项目在交叉轴上如何对齐，它有5个可选值：
- flex-start：起点对齐
- flex-end：终点对齐
- center：中点对齐
- baseline：项目的第一行文字的基线对齐
- stretch：如果项目未设置高度或设为auto，将占满整个容器的高度

对应项目在交叉轴上（交叉轴方向为从上向下时）的对齐效果分别如下：
![align-items](https://img.imgdb.cn/item/602f7659e7e43a13c6795466.png)

`align-items`默认值是`flex-start`。

##### 2.6 align-content
`align-content`属性定义了多根轴线的对齐方式，它有6个可选值：
- flex-start：与交叉轴的起点对齐
- flex-end：与交叉轴的终点对齐
- center：与交叉轴的中点对齐
- space-between：与交叉轴两端对齐，轴线之间的间隔平均分布
- space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍
- stretch：轴线占满整个交叉轴

对应项目的多根轴线的对齐方式效果分别如下：
![align-content](https://img.imgdb.cn/item/602f9836e7e43a13c68ad05d.png)

`align-content`的默认值是`stretch`。如果容器只有一根轴线或者设置了不换行（flex-wrap: no-wrap)，则`align-content`属性不会起作用。

简而言之，`align-items`控制项目在交叉轴方向的对齐方式，`align-content`控制所有轴线（主轴+平行于主轴的行）的对齐方式。

在以上列举的flex容器的属性中，使用的最多的要数`justify-content`和`align-items`，一般通过它们来实现容器内元素的对齐。

### 3. 项目的属性
flex项目上共有6个属性：
##### 3.1 order
`order`属性定义项目的排列顺序。数值越小，排列越靠前，默认为0。

##### 3.2 flex-grow
`flex-grow`属性决定了容器的空间在足够容纳项目且还有剩余空间的情况下，如何为项目分配这些剩余空间。其值为一个权重，默认为0。

下面通过一个例子来理解`flex-grow`：
```html
<style>
  .parent{
    display: flex;
    width: 1100px;
  }
  .left{
    width: 50px;
    height: 200px;
    background: lightblue;
    flex-grow: 1;
  }
  .main {
    width: 200px;
    background: mediumturquoise;
    flex-grow: 2;
  }
  .right {
    width: 100px;
    background-color: blue;
  }
</style>
<body>
  <div class="parent">
    <div class="left"></div>
    <div class="main"></div>
    <div class="right"></div>
  </div>
</body>
```

容器设置了宽度为1100，三个项目的`flex-grow`分别为1、2、0，原本width分别为50、200、100，三个项目原本占据的总宽度350<容器总宽度1100，三个项目按照`flex-grow`比例分配这剩余的750空间。`left`分配到`1 / (1 + 2) * 750 = 250`的空间，如图所示`left`最终的宽度为`50 + 250 = 300`：
![flex-grow](https://img.imgdb.cn/item/602febebe7e43a13c6af4453.jpg)

同理，`main`分配到500的空间，最终宽度为700px；而`right`的`flex-grow`为0，不会分配到额外的空间。

需要注意的是，当容器内的项目的`flex-grow`之和**小于1**时，还是上面的例子，假设`flex-grow`分别为0.1，0.2和0，`left`和`main`将分别分配到`0.1 / 1`、`0.2 / 1`的剩余空间。这意味着当所有项目的 `flex-grow`之和小于1时，剩余空间不会全部分配给各个项目。

当然在实际的使用中，我们一般也不会为需要弹性布局的盒子设置固定宽度，只需要为项目设置`flex-grow`使它们按照比例占据容器的总宽度即可。

##### 3.3 flex-shrink
`flex-shrink`属性决定了在容器的空间不够的情况下，如何让项目收缩来适应有限的空间，默认值为1。

下面还是通过一个例子来理解`flex-shrink`是如何工作的：
```html
<style>
  .parent{
    background: lightcoral;
    display: flex;
    width: 813px;
  }
  .left{
    width: 300px;
    height: 200px;
    background: lightblue;
    flex-shrink: 1;
  }
  .main {
    width: 400px;
    background: mediumturquoise;
    flex-shrink: 2;
  }
  .right {
    width: 300px;
    background-color: blue;
    flex-shrink: 0;
  }
</style>
<body>
  <div class="parent">
    <div class="left"></div>
    <div class="main"></div>
    <div class="right"></div>
  </div>
</body>
```

容器设置了宽度为813，三个项目的`flex-shrink`分别为1、2、0，原本width分别为300、400、300，三个项目原本占据的总宽度1000>容器总宽度813，三个项目将按照`flex-grow`比例分配收缩共`1000 - 813 = 187`的空间。

总权重为`1 * 300 + 2 * 400 + 0 * 300 = 1100`，`left`将收缩`187 * 300 * 1 / 1100 = 51`的空间，如图所示`left`的最终宽度为`300 - 51 = 249`：
![flex-shrink](https://img.imgdb.cn/item/60300361e7e43a13c6b6760e.jpg)

同理，`main`将收缩136的空间，最终宽度为264px；而`right`的`flex-shrink`为0，不会收缩。

同样的，当所有项目的`flex-shrink`之和小于1，收缩的计算方式有所不同，这里不再赘述，感兴趣的可以阅读[这篇文章](https://zhuanlan.zhihu.com/p/24372279)。

##### 3.4 flex-basis
`flex-basis`属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为`auto`，即项目的本来大小。

##### 3.5 flex
`flex`属性是`flex-grow`、`flex-shrink`加上`flex-basis`的简写，默认值为`0 1 auto`。后两个属性可选。

##### 3.6 align-self
`align-self`属性允许单个项目在交叉轴上与其他项目不一样的对齐方式，可覆盖容器的`align-items`属性。

它有6个可选值，其中5个与容器的`align-items`可选值一致：`flex-start`、`flex-end`、`center`、`baseline`、`stretch`，另外还有一个默认值`auto`，表示继承容器的`align-items`属性。

有意思的是，虽然CSS中存在`justify-self`这个属性，但是它在flex布局中是不会起作用的。

### 总结
在上述列举的属性中，比较常用的是容器的`align-items`、`justify-content`，一般通过它们实现对齐。另外还有项目的`flex-grow`，一般使用它来实现元素宽度的自适应。

___
### 参考
1. [Flex 布局教程：语法篇](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
2. [弹性盒子align-items与align-content的区别](https://zhuanlan.zhihu.com/p/87146411)
3. [详解flex-grow与flex-shrink](https://zhuanlan.zhihu.com/p/24372279)
