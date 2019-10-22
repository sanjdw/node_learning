## 概念
可缩放矢量图（Scalable Vector Graphics）,本质上是文本文件，体积较小，不管放大多少倍都不会失真。

svg在网页中有三种引入方式：

- 直接写在HTML文档中
- 保存在独立文件中，通过`<img>`，`<embed>`，`<iframe>`等标签的src属性引入
- 通过CSS的background属性引入

## 语法

1. 所有svg代码通过```<svg></svg>```标签包裹起来

```html
<svg width="100" height="100" viewBox="50 50 50 50">
```

其中width属性和height属性，指定了SVG图像在HTML元素中所占据的宽度和高度。如果不指定这两个属性，SVG图像默认大小是300像素 x 150像素。

viewBox属性的值有四个数字，分别是视口左上角的横坐标和纵坐标、宽度和高度。上面代码中，SVG图像是100像素宽 x 100像素高，viewBox属性指定视口从(50, 50)这个点开始。所以，实际看到的是右下角的四分之一圆。

注意，视口必须适配所在的空间。上面代码中，视口的大小是50 x 50，由于SVG图像的大小是 100 x 100，所以视口会放大去适配SVG图像的大小，即放大了四倍。如果不指定width属性和height属性，只指定viewBox属性，则相当于只给定SVG图像的长宽比，这种情况下SVG图像的默认大小将等于所在的HTML元素的大小。

2. 圆`<circle>`

```html
<circle cx="100" cy="100" r="10" class="red">
```

`<circle>`标签的cx、cy、r属性分别为横坐标、纵坐标和半径，单位为像素。坐标都是相对于`<svg>`画布的左上角原点。

```css
.red {
  fill: red;
  stroke: #e8e8e8;
  stroke-width: 1pt;
}
```
SVG的CSS属性与网页元素有所不同：
    
 \ | 填充色 | 描边色 | 边框宽度 
 :----: | :----: | :----: | :----:
 svg | fill | stroke | stroke-width
 HTML | background-color | border-color | border-width
 
3. 直线`<line>`

```html
<line x1="0" y1="0" x2="200" y2="0" style="stroke:rgb(0,0,0);" />
```

`<line>`标签的x1和y1，表示线段起点的横、纵坐标；x2和y2，表示线段终点的横、纵坐标。

4. 折线`<polyline>`

```html
<polyline points="3,3 30,28 3,53" fill="none" stroke="black" />
```

`<polyline>`的points属性指定了每个端点的坐标，**横坐标与纵坐标之间与逗号分隔，点与点之间用空格分隔。**

5. 矩形`<rect>`

```html
<rect x="0" y="0" height="100" width="200" style="stroke: #70d5dd; fill: #dd524b" />
```

`<rect>`的x属性和y属性，指定了矩形左上角端点的横、纵坐标；width属性和height属性指定了矩形的宽度和高度。

6. 椭圆`<ellipse>`

```html
<ellipse cx="260" cy="300" ry="100" rx="20" stroke="black" stroke-width="2" fill="silver"/>
```

`<ellipse>`的cx属性和cy属性，指定了椭圆中心的横坐标和纵坐标，rx属性和ry属性则指定了椭圆横向轴和纵向轴的半径。

7. 多边形`<polygon>`

```html
<polygon fill="green" stroke="orange" stroke-width="1" points="0,0 100,0 100,100 0,100 0,0"/>
</svg>
```

`<polygon>`的points属性指定了每个端点的坐标，横坐标与纵坐标之间与逗号分隔，点与点之间用空格分隔，与polyline相似。

8. 路径`<path>`

```html
<path d="
	M 18,3 
	L 46,3 
	L 46,40 
	L 61,40 
	L 32,68 
	L 3,40 
	L 18,40 
	Z
"></path>
```

`<path>`的d属性表示绘制顺序，它的值是一个长字符串，每个字母表示一个绘制动作，后面跟着坐标。

- M：移动到（moveto）
- L：画直线到（lineto）
- Z：闭合路径

9. 文本`<text>`

```html
<text x="50" y="25">Hello World</text>
```

`<text>`的x属性和y属性，表示文本区块基线（baseline）起点的横坐标和纵坐标。

10. 组`<g>`

```html
<g id="myCircle">
  <text x="25" y="20">圆形</text>
  <circle cx="50" cy="50" r="20"/>
</g>
```

`<g>`标签用于将多个形状组成一个组（group），方便复用。


11. `<use>`标签

```html
  <circle id="myCircle" cx="5" cy="5" r="4"/>

  <use href="#myCircle" x="10" y="0" fill="blue" />
```

`<use>`标签用于复制一个形状，href属性指定所要复制的节点，x属性和y属性是`<use>`左上角的坐标。

12. 自定义`<defs>`

`<defs>`标签用于自定义形状，**它内部的代码表示的图形不会显示在页面中，仅供引用**。

13. 图片`<image>`

```html
 <image xlink:href="path/to/image.jpg" width="50%" height="50%"/>
```

`<image>`标签用于插入图片文件，xlink:href属性表示图像的来源。

14. 动画`<animate>`

```html
<rect x="0" y="0" width="100" height="100" fill="#feac5e">
  <animate attributeName="x" from="0" to="500" dur="2s" repeatCount="indefinite" />
</rect>
```

上面代码中，矩形会不断移动，产生动画效果。
`<animate>`的属性含义如下:

- attributeName：发生动画效果的属性名
- from：单次动画的初始值
- to：单次动画的结束值
- dur：单次动画的持续时间
- repeatCount：动画的循环模式

## JavaScript操作

1. 获取SVG DOM

使用`<object>`，`<iframe>`，`<embed>`标签插入SVG文件时，可以通过以下方式获取SVG DOM：

```javascript
var svgObj = document.getElementId('object').contentDocument;
var svgIframe = document.getElementById('iframe').contentDocument;
var svgEmbed = document.getElementById('embed).getSVGDocument();
```

2. 读取SVG源码

SVG本身就是一段XML文件，可以通过**XMLSerializer**实例的serializeToString()方法，获取SVG元素的代码：

```javascript
var svgString = new XMLSerializer().serializeToString(document.querySelector('svg'))
```

3. 将SVG转为Canvas元素

通过新建一个Image对象，将SVG图像指定到该Image对象的src属性，当图像加载完成后再将它绘制到`<canvas>`元素中。

```javascript
var svgString = new XMLSerializer().serializeToString(document.querySelector('svg'))
var img = new Image();
var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
var DOMURL = self.URL || self.webkitURL || self;
var url = DOMURL.createObjectURL(svg);
img.onload = function () {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
};
img.src = url
```
