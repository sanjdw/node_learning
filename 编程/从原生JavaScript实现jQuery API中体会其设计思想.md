利用原生JavaScript来实现jQuery中的`addClass`这个API，通过实现此过程来体会jQuery的设计思想

#### 封装函数
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

#### 命名空间
防止函数名冲突
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
```js
// 目标: node.addClass(className)
```
###### 利用原型
```js
Node.prototype.addClass = function () {}
```
###### 无侵入
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
#### alias 别名
```js
window.jQuery = function (node) {}
window.$ = jQuery

const $node = $('div')
$node.addClass('class-name')
```