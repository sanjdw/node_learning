BFC是面试中常见的一个考察点，之前在网上看过很多总结BFC的文章，看得云里雾里。最近抽空又仔细查阅了一遍相关的资料，将它总结在这里。

在解释BFC之前，需要先了解盒子（Box）与格式化上下文（Formatting Context）的关系。

CSS渲染的时候以Box作为渲染的基本单位，Box的类型由元素的类型和display属性共同决定，不同类型的Box会参与不同类型的`Formatting Context`（一个决定如何渲染元素的容器）布局。在CSS2中，Box分为`block-level box`和`inline-level box`。
- block-level box：display属性为block/list-item/table的元素，会**生成**block-level box，并**参与**block fomatting context
- inline-level box：display属性为inline/inline-block/inline-table的元素，会**生成**inline-level box，并且**参与**inline formatting context
- run-in box：CSS3新增了grid布局以及flex布局，display属性为grid/flex的元素会分别参与GFC、FFC

`Formatting context`是W3C CSS2.1规范中的一个概念，指的是页面中的一块渲染区域拥有一套渲染规则，它决定了其子元素将如何定位，以及和其他元素的关系和相互作用。像上文提到的，常见的格式化上下文就有BFC和IFC。

### 1. BFC的渲染规则是什么？
1. `BFC`内部的盒子在垂直方向上从上到下排列，相邻的两个盒子的`margin`会发生重叠（合并后以**较大的margin**为准）
2. `BFC`内部盒子（不论是浮动盒子还是普通盒子）的左外边缘总是与包含块的左边缘相接触（对于从右到左的格式，则是右边缘接触）
3. `BFC`的区域不会与浮动元素重叠
4. `BFC`内部元素不会影响到外面的元素，外面的元素也不会影响BFC内部元素
5. 计算`BFC`的高度时，浮动元素也参与计算

### 2. 哪些区域属于BFC？
1. html根元素
2. 浮动元素，即具有`float`属性且`float`值不为`none`
3. 绝对定位元素，即`position`值为`absolute`或`fixed`
4. `display`值为`inline-block`、`table-cell`、`table-caption`、`flex`
5. `overflow`值为`hidden`、`auto`、`scroll`

### 3. BFC应用
##### 3.1 外边距溢出和外边距合并

##### 3.2 高度塌陷

##### 3.3 自适应两栏布局
`BFC`可以阻止元素被浮动元素覆盖，利用这一点可以实现自适应两列布局

1. 同一个`BFC`内的元素外边距会重叠，解决margin重叠需要将元素放到不同的`BFC`内
2. `BFC`可以包含浮动的元素，即可以利用`BFC`清除浮动，解决“父元素高度塌陷”的问题

___
### 参考：
1. [CSS盒模型完整介绍](https://segmentfault.com/a/1190000013069516)
2. [10分钟理解BFC原理](https://zhuanlan.zhihu.com/p/25321647)
3. [什么是BFC](https://github.com/YvetteLau/Step-By-Step/issues/15)
4. [全面分析总结BFC原理及实践](https://segmentfault.com/a/1190000021924606)
5. [块状格式化上下文](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context)
6. [深度剖析Margin塌陷，BFC，Containing Block之间的关系](https://zhuanlan.zhihu.com/p/30168984)
