## 什么是Blob
Blob是`Binary Large Object`二进制大对象的缩写。

在数据库中也有Blob的概念——如Mysql中存储二进制数据的类型就是Blob；而在Web中，Blob代表一个不可变的、原始数据的类文件对象。换句话说，Blob对象是二进制数据，且它是类文件对象的二进制数据。

## API
### 1. 构造函数:
```js
Blob(blobParts, options)
```
返回一个新创建的Blob对象，其内容由参数中给定的数组串联组成。参数说明：

- blobParts：数组类型，数组中的每一项连接起来构成Blob对象的数据。数组中的每项元素可以是`ArrayBuffer`, `ArrayBufferView`, `Blob`, `DOMString`。
- options: 可选的字典，它包含以下两个属性：
  - type: 默认值为`""`，表示将会被放入到Blob中的数组内容的`MIME`类型。
  - endings: 用于指定包含行结束符`\n`的字符串如何被写入，可选的值：
    1. `"native"`，代表行结束符会被更改为适合宿主操作系统文件系统的换行符
    2. `"transparent"`，默认值，代表会保持Blob中的结束符不变

### 2. 属性（只读）
- `Blob.size`：Blob对象中所包含数据的大小（字节）
- `Blob.type`：一个字符串，表明该Blob对象所包含数据的`MIME`类型。如果类型未知，则该值为空字符串

### 3. 方法
- `Blob.slice([start[, end[, contentType]]])`
  返回一个按给定范围将原Blob对象截断的部分数据组成的新的Blob对象
- `Blob.stream()`
  返回一个能读取Blob对象内容的`ReadableStream`
- `Blob.text()`
  返回一个代表异步操作的Promise对象，对应的异步操作是将Blob对应的内容解析为`UTF-8`格式的`USVString`，`USVString`将作为该Promise状态翻转为`FULFILLED`回调的参数
- `Blob.arrayBuffer()`
  返回一个代表异步操作的Promise对象，对应的异步操作是将Blob对应的内容解析为二进制格式的`ArrayBuffer`，`ArrayBuffer`将作为该Promise状态翻转为`FULFILLED`回调的参数

## 使用场景
### 1. Blob URL
`Blob URL`是Blob协议的URL，它的格式如下：
```
blob:http://XXX
```

`Blob URL`可以通过`URL.createObjectURL(blob)`创建，用来**唯一对应内存里面的某个Blob对象**，一般通过它生成目标文件资源的下载地址：
```js
http.request(sourceUrl)
  .then(res => {
    const blob = new Blob(res)
    // 同时避免了跨域问题
    const blobUrl = (window.URL || window.webkitURL).createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = '文件名'
    a.click()
  })
```

### 2. 图片预览

### 3. 大文件分片上传
