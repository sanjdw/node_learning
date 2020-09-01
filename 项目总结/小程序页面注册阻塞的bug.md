最近写了一个bug，它是这样产生的：

**订单确认页**(`pages/showsubs/order/comfirm`)有两个接口需要带入微信版本参数，而猫眼小程序`app.js`中注册小程序提供的`onLaunch`回调中将版本信息写到了小程序实例的`globalData`上`:
```js
App({
  globalData: {
    $systemInfo: {}
  },
  onLaunch () {
    // ... 其他初始化操作
    setTimeout(() => {
      this.systemInfo()
    }, 0)
  },
  systemInfo () {
    this.wx2promiseify(wx.getSystemInfo)
      .then(res => {
        this.$systemInfo = res;
      })
    }
})
```

这样在各页面中可以通过`gatApp().$systemInfo`访问到版本信息。于是我在`pages/showsubs/order/comfirm.js`中：
```js
const appVersion = getApp().$systemInfo.version

Page({
  data: {},
  onLoad () {},
  queryCoupons () {
    // 使用appVersion
  },
  caculate () {
    // 使用appVersion
  }
})
```

这段代码在正常的用户访问流程中是ok的。周五上午，开始收到主办反馈——用户通过识别二维码进入小程序**订单列表页**，页面是空白的，而通过正常的点击操作进入是正常的。

通过微信开发者工具预览扫码进入**订单列表页**，发现一段脚本执行抛错：

![报错](https://pic.downk.cc/item/5f4e1339160a154a6787b31d.jpg)

这意味着此时**订单确认页**(`pages/showsubs/order/comfirm`)这段代码：
```js
getApp().$systemInfo.version
```

是无法访问到小程序实例的`$systemInfo`的。这里有两个问题：
1. 为什么正常访问流程进入可以拿到`$systemInfo`，而通过二维码进入则不可以
2. 为什么**确认订单页的**的脚本出错影响了**订单列表页**的页面渲染

#### 1. 为什么正常流程没问题而二维码进入有问题？
`globalData.$systemInfo`的写操作是在异步方法中执行的：
```js
onLaunch () {
  // 其他初始化操作
  setTimeout(() => {
    this.systemInfo()
  }, 0)
}

systemInfo () {
  this.wx2promiseify(wx.getSystemInfo)
    .then(res => {
      this.$systemInfo = res
    })
}
```

而**确认订单页**、**订单列表页**又均是演出业务下的子包：

![子包配置](https://pic.downk.cc/item/5f4e2d1b160a154a67959574.jpg)

在正常流程中用户进入`pages/showsubs`目录之后，子包才被加载执行，这种情况下关于`globalData.$systemInfo`的写操作早已完成，子包的脚本执行时可以通过`getApp().$systemInfo.version`访问到版本信息。

而通过二维码进入小程序演出侧子包页面，主包和演出的子包(`pages/showsubs`目录下配置的所有子包)一同加载，**订单确认页**(`pages/showsubs/order/comfirm`)的脚本加载后马上执行，这场情况下`globalData.$systemInfo`写操作还未完成，访问出错。

#### 2. 为什么确认订单页的的脚本出错影响了订单列表页的页面渲染
在第一个回答中其实已经给出了答案，进入子包路径时，路径下配置的所有子包按配置的顺序依次加载执行：

![小程序包的加载顺序](https://pic.downk.cc/item/5f4e3b8c160a154a679cc552.png)

子包按配置的顺序依次加载执行：
1. `ticket/ticket`
2. `mixTicket/ticket`
3. `mixTicket/groupExhibition`
4. `order/confirm`

可以看到，在**订单确认页**(`pages/showsubs/order/comfirm.js`)执行出错后，后续的子包脚本不再执行，**订单列表页**(`pages/showsubs/user/order-list`)无法被注册：
```js
// pages/showsubs/user/order-list.js
Page({
  data: {
    // ...
  },
  onLoad () {},
  onShow () {}
  // ...
})
```

因此**订单列表页**空白。事实上，当`order/confirm.js`出错后，配置在它之后子包对应的页面均无法被注册。

### 3. 修复bug
1. 通过`wx.getSystemInfo`获取微信版本数据，`wx`是`JSBridge`提供的`API`。
2. 将访问`global.$systemInfo`操作放到注册页面之后的逻辑中
