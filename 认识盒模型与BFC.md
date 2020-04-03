<!-- ### 常见定位方案
1. 普通流
2. float
3. 绝对定位 -->

### 盒模型（Box Model）
**所有HTML元素可以看作盒子**，在CSS中，**Box Model**这一术语是用来设计和布局时使用的。CSS盒模型本质上是一个盒子，封装周围的HTML元素，它包括：边距，边框，填充，和实际内容。

#### 1. 什么是盒模型
盒模型又叫框模型，它包含了内容元素(content)、内边距(padding)、边框(border)、外边距(margin)几个要素：
![盒模型](https://www.runoob.com/images/box-model.gif)

盒模型分为 **IE盒模型** 和 **W3C标准盒模型**两种，通过CSS属性 `box-sizing: content-box | border-box`可以设置盒模型为标准模型`(content-box)`和IE模型`(border-box)`，默认值为盒模型`(content-box)`。

#### 2.两种盒模型的区别
在标准盒模型中，元素的宽度(高度)与元素content的宽度(高度)一致

而在IE盒模型中，元素的宽度(高度)为元素content的宽度(高度)+内边距+边框

下面的代码可以更直观地表明这一点:
```css
.content-box {
  box-sizing: content-box;
  width: 100px;
  height: 50px;
  padding: 10px;
  border: 5px solid red;
  margin: 15px;
}
```
![标准盒模型宽高](https://upload-images.jianshu.io/upload_images/79178-f0a78b1c458cf16e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到标准盒模型元素的宽度为所设置的100px，高度为50px，而对于IE盒模型：
```css
.border-box {
  box-sizing: border-box;
  width: 100px;
  height: 50px;
  padding: 10px;
  border: 5px solid red;
  margin: 15px;
}
```
![IE盒模型](https://upload-images.jianshu.io/upload_images/79178-15ee23e259ba96a1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

元素宽度 = content + 2padding + 2border，由于设置了width为100px，导致content的width为：
```js
width = 100 - 2 * 10 - 2 * 5
      = 70
```

### BFC
`BFC` 全称 `block formatting context`，中文译作**块格式化上下文**。相应的，还有`IFC (inline formatting context)`，也就是**内联格式化上下文**。

格式化上下文`(formatting context)`是W3C CSS2.1规范中的一个概念。它是页面中的一块渲染区域，并且有一套渲染规则，它决定了子元素如何定位，以及与其他元素的相互关系。

具有`BFC`特性的元素可以看作是隔离了的独立容器，**容器内的元素在布局上不会影响到容器外的元素**。

#### 1. 以下条件均会触发`BFC`:
1. html根元素
2. 浮动元素，即具有`float`属性且`float`值不为`none`
3. 绝对定位元素，即`position`值为`absolute`或`fixed`
4. `display`值为`inline-block`、`table-cell`、`table-caption`、`flex`
5. `overflow`值为`hidden`、`auto`、`scroll`

#### 2. BFC规则
1. `BFC`内，盒子依次垂直排列。
2. `BFC`内，两个盒子的垂直距离由 `margin` 属性决定。属于同一个`BFC`的两个相邻Box的`margin`会发生重叠（符合合并原则的margin合并后以**大的margin**为准）
3. `BFC`内，每个盒子的左外边缘接触内部盒子的左边缘（对于从右到左的格式，右边缘接触）。即使在存在浮动的情况下也是如此。除非创建新的`BFC`。
4. `BFC`的区域不会与float box重叠。
5. `BFC`就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。
6. 计算`BFC`的高度时，浮动元素也参与计算。

#### 3. BFC应用
1. 同一个`BFC`内的元素外边距会重叠，解决margin重叠需要将元素放到不同的`BFC`内
2. `BFC`可以包含浮动的元素，即可以利用`BFC`清除浮动，解决“父元素高度塌陷”的问题
3. `BFC`可以阻止元素被浮动元素覆盖，利用这一点可以实现自适应两列布局

___
#### 参考：
1. [CSS盒模型完整介绍](https://segmentfault.com/a/1190000013069516)
2. [10分钟理解BFC原理](https://zhuanlan.zhihu.com/p/25321647)
3. [什么是BFC](https://github.com/YvetteLau/Step-By-Step/issues/15)
4. [全面分析总结BFC原理及实践](https://segmentfault.com/a/1190000021924606)
5. [](https://segmentfault.com/a/1190000021924606)