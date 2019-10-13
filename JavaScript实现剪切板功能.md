之前写过一个这样的功能：通过点击图片旁的”复制“按钮，将图片链接比如 
```
http://p0.meituan.net/moviesh/6d6b2a44e3d59d0472e82624c5c256aa10334.png
```
放入系统粘贴板，供用户粘贴，也就是一个简单的帮助用户减少鼠标移动和点击操作的功能

当时赶工，借助了第三方模块 [`clipboardjs`](https://clipboardjs.com/) 来实现。现在回头来看还有其他的方法实现这个功能 —— **document.execCommand**

[来自MDN的参考](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand)：

> 当`HTML`文档切换到 [**设计模式**](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/designMode) 时，`document` 会暴露 `execCommand` 方法，该方法允许运行命令来控制可编辑内容区域（如 `input` 元素或设置了`contentEditable` 属性的元素等）。

好吧，读起来确实很绕口，继续往下读，语法：
```
bool = document.execCommand(aCommandName, [,aShowDefaultUI, [,aValueArgument]])
```
返回值是一个 `Boolean`， 表示命令操作是否支持。
参数：
- aCommandName：命令的名称，如 `copy`、`cut`、`undo`等，可接受的命令列表见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand#%E5%91%BD%E4%BB%A4)，实现剪切板功能很显然用到的是`copy`命令。另外在[这篇文章](https://blog.csdn.net/gertyy/article/details/65936318)里有各个命令功能的demo。
- aShowDefaultUI：是否展示用户界面，默认为`false`，一般很少使用，而且FireFox不支持。
- aValueArgument，一些命令可能需要额外的参数，默认为 `null`。

怎么用呢？如果尝试在浏览器控制台中跑一下，在这之前先在终端中运行下面的命令来清除系统剪切板中的内容：
```
Mac OS下：
pbcopy < /dev/null

windows下：
cmd /c "echo off | clip"
```
然后在浏览器中run：
```
document.execCommand('copy')
```
得到一个返回值 `true` 表示你的浏览器支持这个操作，`command+v`（Mac OS下，如果是Windows的话`control+v`）看看剪切板里放进了什么——什么也没有，剪切板的内容在之前已经被清空了，除非在执行`document.execCommand('copy')`之前你用鼠标选中了浏览器页面中的一段文本内容。

#### 参考：
- [富文本原理了解一下？](https://juejin.im/post/5cfe4e8a6fb9a07ec63b09a4)
- [JavaScript赋值内容到剪切板](https://github.com/axuebin/articles/issues/26)
- [javascript execCommand,复文本框神器](https://blog.csdn.net/gertyy/article/details/65936318)
- [How do I copy to the clipboard in JavaScript?](https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript)