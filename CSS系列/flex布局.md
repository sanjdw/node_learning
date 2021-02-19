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
`flex-flow`是`flex-direction`加上`flex-wrap`的简写形式，默认值自然为`row nowrap`。

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

`align-content`的默认值是`stretch`。如果项目只有一根轴线或者设置了不换行（flex-wrap: no-wrap) ，该属性不起作用。

在flex容器的属性中，使用的最多的要数`justify-content`和`align-items`，一般通过它们来实现容器内元素的对齐。

### 3. 项目的属性
flex项目上共有6个属性：
##### 3.1 order
`order`属性定义项目的排列顺序。数值越小，排列越靠前，默认为0。

##### 3.2 flex-grow
在容器的空间分配还有剩余空间时，`flex-grow`属性决定了如何分配这些剩余空间。其值为一个权重，默认为0，剩余空间将会按照这个权重来分配。

一个flex容器内：
- `flex-grow`为0的项目

##### 3.3 flex-shrink
`flex-shrink`属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。

##### 3.4 flex-basis
`flex-basis`属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为`auto`，即项目的本来大小。

##### 3.5 flex
`flex`属性是`flex-grow`、`flex-shrink`加上`flex-basis`的简写，默认值为`0 1 auto`。后两个属性可选。



##### 3.6 align-self
`align-self`属性允许单个项目有与其他项目不一样的对齐方式，可覆盖`align-items`属性。默认值为`auto`，表示继承父元素的`align-items`属性，如果没有父元素，则等同于`stretch`。

___
### 参考
1. [Flex 布局教程：语法篇](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
2. [Flex 布局教程：实例篇](http://www.ruanyifeng.com/blog/2015/07/flex-examples.html)
3. [弹性盒子align-items与align-content的区别](https://zhuanlan.zhihu.com/p/87146411)
4. [详解flex-grow与flex-shrink](https://zhuanlan.zhihu.com/p/24372279)
