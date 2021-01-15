利用原生JavaScript来实现jQuery中的`addClass`这个API，通过实现此过程来体会jQuery中的一些设计思想。

#### 封装函数
简单的功能模块封装成一个方法：
```js
function addClass (node, className) {
  const NodeList = document.querySelectorAll(node)
  for (let i = 0; i < NodeList.length; i++) {
    NodeList[i].classList.add(classes)
  }
}
// 使用形式
addClass('div', 'class-name')
```

函数封装会存在命名冲突问题。

#### 命名空间
通过命名空间防止函数名冲突：
```js
window.jQuery = {}
jQuery.addClass = function (node, class) {
  const NodeList = document.querySelectorAll(node)
  for (let i = 0; i < NodeList.length; i++) {
    NodeList[i].classList.add(classes)
  }
}
// 使用形式
jQuery.addClass('div', 'class-name')
```

#### 将node放到前面
命名空间无法完全解决命名冲突问题，可以换一种思路，将node放到前面，提供如下调用方式: 
```js
// node.addClass(className)
```

这里有两种方式实现，一种是利用原型：
```js
Node.prototype.addClass = function () {}
```

这种方式污染了原型，另一种**无侵入**的方式：
```js
window.jQuery = function (node) {
  return {
    element: node,
    addClass: function () {
      const NodeList = document.querySelectorAll(node)
      for (let i = 0; i < NodeList.length; i++) {
        NodeList[i].classList.add(classes)
      }
    }
  }
}
const node = jQuery('div')
node.addClass('class-name')
```

最后为`jquery`维护一个别名：
```js
window.jQuery = function (node) {}
window.$ = jQuery

const $node = $('div')
$node.addClass('class-name')
```
