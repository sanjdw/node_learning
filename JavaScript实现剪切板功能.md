之前写过一个这样的功能：通过点击图片旁的`“复制”`按钮，将图片链接比如 
```
http://p0.meituan.net/moviesh/6d6b2a44e3d59d0472e82624c5c256aa10334.png
```
放入系统粘贴板，供用户粘贴使用，也就是一个简单的帮助用户减少鼠标移动、选中链接以及右击复制等操作的功能。

当时赶工，借助了第三方模块 [`clipboardjs`](https://clipboardjs.com/) 来实现。现在回头来看还有这个功能还有更简单的原生JavaScript实现 —— **document.execCommand**

[来自MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand)：

> 当`HTML`文档切换到 [**设计模式**](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/designMode) 时，`document`会暴露`execCommand`方法，该方法允许运行命令来控制可编辑内容区域（如`input`元素或设置了`contentEditable`属性的元素等）。

好吧，读起来确实很绕口，继续往下读，语法：
```js
bool = document.execCommand(aCommandName, [,aShowDefaultUI, [,aValueArgument]])
```
返回值是一个 `Boolean`，表示命令操作是否支持。
参数：
- aCommandName：命令的名称，如 `copy`、`cut`、`undo`等，可接受的命令列表见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand#%E5%91%BD%E4%BB%A4)，实现剪切板功能很显然用到的是`copy`命令。另外在[这篇文章](https://blog.csdn.net/gertyy/article/details/65936318)里为各个命令的使用及其功能做了介绍。
- aShowDefaultUI：是否展示用户界面，默认为`false`，一般很少使用，而且FireFox不支持。
- aValueArgument，一些命令可能需要额外的参数，默认为`null`。

怎么用呢？尝试在浏览器控制台中跑一下这个命令，在这之前要先在bash中运行下面的命令将系统剪切板中的内容清空：
```shell
Mac OS下：
pbcopy < /dev/null

windows下：
cmd /c "echo off | clip"
```
然后在浏览器控制台中run：
```js
document.execCommand('copy')
```
会得到一个返回值 `true`，表示你的浏览器支持这个操作，`command+v`（Mac OS，如果是Windows的话则是`control+v`）看看剪切板里放进了什么——什么也没有，因为系统剪切板的内容在之前已经被我们清空了。

如果你用鼠标选中了浏览器页面中的一段文本内容后再执行```document.execCommand('copy')```，会发现选中的文本内容已经被放到了系统剪切板中。

回到需求本身，我们希望利用`document.execCommand('copy')`去将指定的内容放到剪切板，而不是手动选中文本，那么可以借用input：
```html
<button id='btn'>点我复制</button>
```
```js
/*
* @param { String }: 指定向剪切板中放置的内容
*/
function copy(content = '') {
  btn.addEventListener('click', function () {
    const btn = document.getElementById('btn')
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.setAttribute('value', content)
    // 兼容ios的写法
    input.focus()
    input.setSelectionRange(0, content.length)
    // input.select()
    if (document.execCommand('copy')) {
      document.execCommand('copy')
    }
    document.body.removeChild(input)
  })
}

copy('http://p0.meituan.net/moviesh/6d6b2a44e3d59d0472e82624c5c256aa10334.png')
```

这样算是大略完成了剪切板功能，通过它大致可以推测知乎是如何实现拷贝文本内容后向剪切板中追加`...著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。`效果的。

浏览了MDN文档，发现除了`copy`，`document.execCommand()`的`aCommandName`参数也可以是`FontSize`、`FontName`等，这些可以帮助实现富文本编辑器的一些功能。

### 补充

此外，chrome 66新增了 `Async Clipboard` API，
```js
navigator.clipboard.writeText('需要复制的文本')
```
如果是只需要针对Chrome的复制功能可以考虑使用它，具体[点击阅读这里](https://zhuanlan.zhihu.com/p/34698155)

___
#### 参考：
- [富文本原理了解一下？](https://juejin.im/post/5cfe4e8a6fb9a07ec63b09a4)
- [JavaScript赋值内容到剪切板](https://github.com/axuebin/articles/issues/26)
- [javascript execCommand,复文本框神器](https://blog.csdn.net/gertyy/article/details/65936318)
- [How do I copy to the clipboard in JavaScript?](https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript)