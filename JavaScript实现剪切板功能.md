之前写过一个这样的功能：通过点击图片旁的”复制“按钮，将图片链接比如 
```
http://p0.meituan.net/moviesh/6d6b2a44e3d59d0472e82624c5c256aa10334.png
```
放入系统粘贴板，供用户粘贴，也就是一个简单的帮助用户减少鼠标移动和点击操作的功能

当时急着完成，借助了第三方模块 [`clipboardjs`](https://clipboardjs.com/) 来实现。现在回头来看还有其他的方法实现这个功能 —— **document.execCommand**

[来自MDN的参考](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand)：

> 当`HTML`文档切换到 [`设计模式`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/designMode) 时，`document` 会暴露 `execCommand` 方法，该方法允许运行命令来控制可编辑内容区域，如 `input` 元素或设置了`contentEditable` 属性的元素。

好吧，读起来确实很绕口，继续往下读：

> 语法： 
> ```
> bool = document.execCommand(aCommandName, aShowDefaultUI, aValueArgument)
> ```
> 