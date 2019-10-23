## window.screen.width/height
- screen.width/height: **显示器屏幕**的宽度（高度），而不是浏览器
- screen.availWidth/availHeight: 浏览器窗口可占用的最大水平宽度（高度）

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
- screenX/screenY: 浏览器左部（或顶部）边框到**屏幕**左边（或顶部）边缘的水平（垂直）距离
- screenLeft/screenTop: screenX（screenY）的别名

screenLeft/screenTop是screenX/screenY的别名，最初只被IE支持，后来被引入个主流浏览器，Firefox除外，在Firefox中使用screenX/screenY。

当系统任务栏在屏幕顶部（或底部），且浏览器无向下**拖动**操作，此时screenY为浏览器顶部边框到屏幕顶部的垂直距离，有：
```js
window.screenY + window.screen.availHeight == window.screen.height
```

## window.scrollX 和 window.pageXOffset
- scrollX/scrollY: 页面文档水平（或垂直）滚动的值
- pageXOffset/pageYOffset: scrollX（scrollY）的别名，各主流浏览器均支持，而scrollX（scrollY）在IE中不被支持

## window.innerWidth 和 window.outerWidth
- innerWidth/innerHeight: 浏览器内层窗口，即**页面可视区域**的宽度（高度），包含滚动条，但不包含浏览器书签栏、地址栏、顶部tab栏以及浏览器开发者工具（如果开启开发者模式的话）所占据的空间
- outerWidth/outerHeight: 浏览器窗口的宽度（高度），包含浏览器书签栏、地址栏、顶部tab栏以及开发者工具所占据的空间

当浏览器无**缩放**时，有：
```js
window.outerWidth = window.screen.availWidth
window.outerHeight = window.screen.availHeight
```

## element.clientWidth 和 element.clientHeight
内联元素的clientWidth属性值为0
The Element.clientWidth property is zero for inline elements and elements with no CSS; otherwise, it's the inner width of an element in pixels. It includes padding but excludes borders, margins, and vertical scrollbars (if present).


## element.scrollTop 和 element.scrollHeight

## element.offsetHeight 和 element.offsetTop