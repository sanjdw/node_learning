## window.screen.width/height
- screen.width/height: **只读属性**，**显示器屏幕**的宽度（高度），而不是浏览器
- screen.availWidth/availHeight: **只读属性**，浏览器窗口可占用的最大水平宽度（高度）

在PC端，由于系统任务栏的存在，屏幕的宽度（或高度）总是大于或等于浏览器窗口可占用的最大宽度（或高度）。如果系统任务栏固定在屏幕左侧或右侧，则：
```js
window.screen.width > window.screen.availWidth
window.screen.height == window.screen.availHeight
```
系统任务栏固定在屏幕顶部或底部，则：
```js
window.screen.width == window.screen.availWidth
window.screen.height > window.screen.availHeight
```

## window.screenX 和 window.screenLeft
- screenX/screenY: **只读属性**，浏览器左部（或顶部）边框到**屏幕**左边（或顶部）边缘的水平（垂直）距离
- screenLeft/screenTop: **只读属性**，screenX（screenY）的别名

screenLeft/screenTop是screenX/screenY的别名，最初只被IE支持，后来被引入个主流浏览器，Firefox除外，在Firefox中使用screenX/screenY。

当系统任务栏在屏幕顶部（或底部），且浏览器无向下**拖动**操作，此时screenY为浏览器顶部边框到屏幕顶部的垂直距离，有：
```js
window.screenY + window.screen.availHeight == window.screen.height
```

## window.scrollX 和 window.pageXOffset
- scrollX/scrollY: **只读属性**，页面文档水平（或垂直）滚动的值，在IE中不被支持，需要使用pageXOffset/pageYOffset
- pageXOffset/pageYOffset: **只读属性**，scrollX（scrollY）的别名，各主流浏览器均支持

## window.innerWidth 和 window.outerWidth
- innerWidth/innerHeight: **只读属性**，浏览器内层窗口，即**页面可视区域**的宽度（高度），包含滚动条，但不包含浏览器书签栏、地址栏、顶部tab栏以及浏览器开发者工具（如果开启开发者模式的话）所占据的空间
- outerWidth/outerHeight: **只读属性**，浏览器窗口的宽度（高度），包含浏览器书签栏、地址栏、顶部tab栏以及开发者工具所占据的空间

当浏览器无**缩放**时，有：
```js
window.outerWidth = window.screen.availWidth
window.outerHeight = window.screen.availHeight
```

## document.documentElement
文档的根元素，对于HTMl文档来说，
```js
document.documentElement == <html>
```

## element.clientWidth 和 element.clientLeft
- clientWidth/clientHeight: **只读属性**，元素的内部宽度（高度），包含内边距(padding)，但不包含滚动条、边框(border)和外边距(margin)
- clientLeft/clientTop: **只读属性**，左（上）边框(border)的宽度

> **Note**: 内联(inline)元素的clientWidth/clientHeight、clientLeft/clientTop属性值均为0。

## element.offsetWidth 和 element.offsetLeft
- offsetParent: **只读属性**，包含element的祖先元素中，层级最近的定位（position不为static）元素，如果祖先元素中无定位元素，则offsetParent为最近的table, table cell或body元素
- offsetWidth/offsetHeight: **只读属性**，元素的布局宽度（高度），包含内边距、滚动条、边框，但不包含外边距
- offsetLeft/offsetTop: **只读属性**，元素左（上）边框外边缘相对于HTMLElement.offsetParent的左（上）边界(content-box)的偏移

> **Note**: 
> - webkit内核、Firefox下，element自身的display属性为none或position属性为fixed，则offsetParent为null
> - offsetWidth/offsetHeight不包含伪元素所占据的空间

## element.scrollLeft 和 element.scrollWidth
- scrollWidth/scrollHeight: **只读属性**，元素内容宽度（高度），**包括由于溢出导致的视图中不可见内容占据的空间**
- scrollLeft/scrollTop: 元素内容水平(垂直)滚动的距离，也可以通过为scrollLeft/scrollTop赋值设置滚动的距离

没有垂直滚动条的情况下，scrollWidth/scrollHeight值与元素视图填充所有内容所需要的最小值clientWidth/clientHeight相同。包括元素的padding，但不包括元素的border和margin

> **Note**: scrollWidth/scrollHeight也包括伪元素占据的空间

当浏览器无缩放且页面文档出现横向或纵向滚动轴时，页面文档的宽度（高度）有可能比屏幕的可用宽度（高度）更大：
```js
document[documentElement||body].scrollHeight == document.body.clientHeight > screen.availHeight > document.documentElement.clientHeight
// 或
document[documentElement||body].scrollWidth == document.body.clientWidth > screen.availWidth > document.documentElement.clientWidth
```
当页面文档滚到浏览器底部时:
```js
document.documentElement.clientHeight + document.documentElement.scrollTop == document.documentElement.scrollHeight
```
## MouseEvent对象的各种坐标属性
- clientX/clientY: 鼠标相对于浏览器视口左上角(0, 0)的坐标
- screenX/screenY: 鼠标相对于屏幕左上角(0, 0)的坐标
- pageX/pageY: 鼠标相对于页面文档左上角(0, 0)的坐标
- offsetX/offsetY: 鼠标相对于事件源左上角(0, 0)的坐标
- x/y: clientX/clientY的别名
