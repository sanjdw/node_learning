关于CSS3的过渡和动画，很早之前需求开发中使用过，文章也零零散散地看过。最近在工作碰到一个需要实现过渡的效果的需求，想了半天又忘了实现的具体写法，再查了一遍文档才回想起来。现在想来最初在用的时候也只是应付需求，所以针对CSS3的`transition`和`animation`整理了这篇笔记。

在CSS3之前，动画都是靠动图、flash动画以及JavaScript实现的，比如JavaScript动画：
```js
setTimeout(funcntion() {
  document.getElementById("box").style.opacity += 0.1;
}, 300)
```

JavaScript动画有两个比较明显的缺点：
- 由于JavaScript线程运行在渲染进程中，而渲染进程中还有GUI渲染线程、JavaScript线程、事件触发线程、定时触发器线程、异步HTTP请求线程等。其中GUI渲染线程与JS引擎线程是互斥的，可能被JavaScript线程阻塞，从而造成丢帧的情况
- 代码复杂度较高，维护性较差

而flash动画制作成本又比较高，因此CSS3中引入了`transition`（过渡）和`animation`（动画），开发者可以用它来取代图像动画、flash动画以及部分JavaScript实现的动画效果。

### 1. transition过渡
在引入`transition`概念之前，CSS是没有时间轴的——CSS的属性值的变化是**立刻生效**的，比如改变了某个元素的背景色、增大了某个块级元素的width，是可以马上看到相应的变化的。
```css
.img {
  width: 200px;
}
.img:hover {
  width: 300px;
}
```

在上面的CSS效果下，设置的图片宽度在鼠标hover上时马上由200px变成300px。

##### 1.1 基本使用
`transition`提供了一种在**改变CSS属性时控制动画速度**的方法，它可以使这样的CSS属性值的改变不是立即完成，而是呈现出从一种状态变成另一种状态的过程：
```css
.img {
  width: 200px;
  transition-property: width;
  transition-duration: 3s;
  transition-timing-function: linear;
  transition-delay: 1s;
  /*
  简写 transition: width 3s linear 1s
  */
}
.img:hover {
  width: 300px;
}
```

正如上面所说的，`transitions`可以让开发者决定CSS属性值变化的过程，包括变化过程对应的CSS属性名、什么时间开始变化、变化持续的时间以及变化的类型：
- transition-property: 过渡效果的CSS属性名，不写或`all`则表示所有CSS属性
- transition-duration: 过渡效果持续的时间
- transition-timing-function: 过渡效果的速度曲线，可选值
  - linear：匀速
  - ease-in：加速
  - ease-out：减速
  - cubic-bezier函数：自定义速度模式，可以借助[第三方工具](https://cubic-bezier.com/)来定制。
- transition-delay: 过渡效果从何时开始

在使用简写时，第一个可以解析为时间的值会被赋值给`transition-duration`，第二个可以解析为时间的值会被赋值给`transition-delay`。

##### 1.2 触发transition的方式
```css
.box {
  width: 200px;
  transition: width 2s linear;
}
```

`transition`的过渡方式一般有三种，
- 伪类触发
  ```css
  .box:hover {
    box: width: 400px;
  }
  ```

- 媒体查询触发
  ```css
  @media only screen and (max-width : 960px) {
    .box {
      width: 400px;
    }
  }
  ```

- JavaScript触发
  可以通过事件回调为目标元素添加classname：
  ```js
  // 提前写好 'active' 样式
  // .active {
  //   width: 400px;
  // }
  const box = document.getElmentById('box')
  box.addEventListener('click', () => {
    box.classList.add('active')
  })
  ```

##### 1.3 局限
`transition`用法简单，但是使用场景有限：
- 需要事件触发
- `transition`是一次性的，不能重复发生，除非一再触发
- `transition`只能定义开始状态和结束状态，不能定义中间状态
- 并不是所有CSS属性都支持`transition`
  1. 支持`transition`的CSS属性列表见[这里](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_animated_properties)
  2. 支持`transition`的CSS属性的属性值必须设置为绝对值：比如，不能让height从`0px`过渡到`auto`，因为浏览器不能计算中间过渡值。

### 2. animation动画
`animation`弥补了`transition`使用场景有限的缺点。

###### 2.1 基本使用
首页需要为动画指定一个周期的持续时间、动画名称：
```css
div {
  animation: 2s rainbow;
}
```

这段代码表示`div`元素会产生持续时间为2s、名为`rainbow`的动画效果。为此，我们还需要用`keyframes`关键字来定义这个`rainbow`的具体效果：
```css
@keyframes rainbow {
  0% { width: 200px; }
  50% { width: 300px; }
  100% { width: 500px; }
}
```

也可以指定动画播放次数
```css
img:hover {
  animation: 2s rainbow infinite; // 无限循环
  animation: 2s rainbow 3; // 3次
}
```

##### 2.2 animation-fill-mode
动画结束以后，会立刻从结束状态还原到起始状态。如果想让动画保持在结束状态，需要使用`animation-fill-mode`属性：
```css
img:hover {
  animation: 2s rainbow 3 forwards; // 停留在结束状态
}
```

`animation-fill-mode`还有以下可选：
- `none`：默认值，回到动画**没开始时**的状态
- `backwords`，回到动画第一帧的状态
- `both`：根据`animation-direction`（下文会提到）轮流应用`forwards`和`backwards`规则

##### 2.3 animation-direction
动画循环播放时，每个周期结束都是从结束状态跳回到起始状态开始下一个周期的动画。`animation-direction`属性，可以改变这种行为，默认值为`normal`：
```css
div:hover {
  animation: 2s rainbow 3 normal|alternate|reverse|alternate-reverse;
}

@keyframes rainbow {
  0% { background-color: yellow; }
  100% { background: blue; }
}
```

`animation-direction`属性指定了动画的播放方向：

|值|描述|
|----|----|
|reverse|反向播放|
|alternate|动画在奇数次（1、3、5...）正向播放，在偶数次（2、4、6...）反向播放|
|alternate-reverse|动画在奇数次（1、3、5...）反向播放，在偶数次（2、4、6...）正向播放|

对应的上面这段代码`animation-direction`设置的四个值，效果如下：

![animation-direction](https://pic.downk.cc/item/5ed4c4ccc2a9a83be5e78112.png)

##### 2.4 animation各项属性
与`transition`一样，`animation`既可以简写也可以分成各个单独的属性：
```css
div {
  animation: 1s 1s rainbow linear 3 forwards normal;
}
div {
  animation-name: rainbow;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-delay: 1s;
  animation-fill-mode:forwards;
  animation-direction: normal;
  animation-iteration-count: 3;
}
```

##### 2.5 keyframes写法
`keyframes`定义动画的的写法则比较自由：
```css
@keyframes rainbow {
  0% { background: #c00 }
  50% { background: orange }
  100% { background: yellowgreen }
}
/* 0%可以用from代表，100%可以用to代表 */
@keyframes rainbow {
  from { background: #c00 }
  50% { background: orange }
  to { background: yellowgreen }
}
```

##### 2.6 steps功能
上面实现的从一个状态向另一个状态的过渡动画，是平滑过渡。`steps`函数可以实现分步过渡。

##### 2.7 animation-play-state
此外，我们还可以通过`animation-play-state`属性控制动画运行还是暂停：
```css
div {
  animation: animation: 1s rainbow linear infinite;
  animation-play-state: paused;
}
div:hover {
  animation-play-state: running;
}
@keyframes rainbow {
  0% { background: #c00 }
  100% { background: yellowgreen }
}
```

上面这段，为div元素定义了动画效果，当鼠标悬停在div元素上时动画会运行，鼠标移走动画会暂停，鼠标悬停动画会继续播放。

### 硬件加速
CSS3硬件加速又叫做`GPU加速`，是利用GPU进行渲染，减少CPU操作的一种优化方案。由于GPU中的transform等CSS属性不会触发repaint，所以能大大提高网页的性能。

### 总结
##### CSS3动画的缺点：
- CSS运行过程控制较弱，无法附加事件回调
- 对于一些复杂的动画，如果用CSS3实现，则会导致CSS代码冗长

##### 优点：
- 占用的内存更小，运行更加流畅
- 可以强制使用硬件加速（通过GPU来提高动画性能）
- 对于帧速表现不好的低版本浏览器，CSS3动画可以做到自然降级，而JavaScript则需要撰写额外代码

如果动画只是需要简单状态切换的交互动效，不需要中间过程控制，那么css动画是优选方案。然而如果需要设计复杂需要大量控制的动画，那么应该使用JavaScript动画。

___
### 参考
1. [CSS3动画简介](https://www.ruanyifeng.com/blog/2014/02/css_transition_and_animation.html)
2. [css与 js动画 优缺点比较](https://www.cnblogs.com/wangpenghui522/p/5394778.html)
3. [两张图解释CSS动画的性能](https://github.com/ccforward/cc/issues/42)
4. [CSS animation和transition的性能探究](http://zencode.in/18.CSS-animation%E5%92%8Ctransition%E7%9A%84%E6%80%A7%E8%83%BD%E6%8E%A2%E7%A9%B6.html)
5. [在CSS动画中使用硬件加速](https://juejin.im/post/5b6143996fb9a04fd343ae28#heading-3)
