#### 什么是Data-URI？

`DaTa-URI`是指可以在 Web 页面中包含图片但**无需任何额外的HTTP请求的一类URI**。也就是说，它是表示图片的一种方式。例如，在google主页，可以发现搜索框右侧的话筒图就是用`Data-URI`表示的：
```css
.gsri_a {
  background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACrElEQ…2iTnbwNT+gBX54H+IaXAtxJzE3ycSAFqSAFJACUkAikXD+AHj5/wx2o5osAAAAAElFTkSuQmCC) no-repeat -3px 0;
}
```
url中这一串编码就是`Data-URI`，标准`Data-URI` 的格式如下所示：
```html
  data:[<mime type>][;charset=<charset>][;base64],<encoded data>
```

先不谈这个编码过程，图片的表示形式折腾成这样了有什么好处？减少了`HTTP`请求。通常图片的表示形式是img标签的`src`属性指向服务器地址，每个`src`都会使浏览器向服务端发起一次请求。`Data-URI`技术将图片编码成字符串，**在浏览器端完成解码就不再需要HTTP请求了**，弊端也有：

- 图片`Base64`编码后的数据体积通常是原始数据体积的**4/3**
- 不利于懒加载
- IE6/7/8不识别
- 解码消耗CPU，移动端不宜使用

#### 如何编码
