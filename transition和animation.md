关于CSS3的过渡和动画，很早之前需求开发中使用过，文章也零零散散地看过，上午开发中需要实现一个过渡的效果，想了半天又忘了实现的细节，再查了一遍文档才回想起来。现在想来最初在用的时候也只是应付需求，所以针对CSS 3的Transition和Animation整理了这篇笔记。

## transition
CSS transition提供了一种在改变CSS属性时控制动画速度的方法——通常情况下，CSS的属性值变化所产生的影响是**立刻生效**的，比如改变了某个元素的背景色、增大了某个块级元素的width，是可以马上看到相应的变化的：
```css
.img {
  width: 200px;
}
.img:hover {
  width: 300px;
}
```
而CSS transition可以使这样的CSS属性值的改变不是立即完成，而是呈现出从一种状态变成另一种状态的过程：
```css
/* 使用 transition */
.img {
  width: 200px;
  transition-property: width;
  transition-duration: 2s;
  transition-timing-function: linear;
  transition-delay: 0s;
  /*
  简写
  transition: width 1s linear 0s
   */
}
.img:hover {
  width: 300px;
}
```
如上所述，CSS transitions可以让开发者决定CSS属性值变化的过程，包括变化过程对应的CSS属性名、什么时间开始变化、变化持续的时间以及变化的类型：
- transition-property: 过渡效果的CSS属性名
- transition-duration: 过渡效果持续的时间
- transition-timing-function: 过渡效果的速度曲线
- transition-delay: 过渡效果从何时开始

##### 多个过渡效果
##### 哪些CSS属性能够使用动画

## animation

## 比较
在极端情况下，animation比transition更占资源，导致前端压力过大时animation的关键帧动画无法很好的展现出来，而transition占用的资源更少，当然效果也没有animation好，所以能用transition完成的动画尽量用transition，追求更好更复杂的效果的话使用animation。
