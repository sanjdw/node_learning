websocket模块的使用场景：
- 打票
- 扫码枪 + 打票
- 工作证加密

打票的场景类型：
- 多订单批量、单笔订单
- 订单详情内，指定票打印（一笔订单可能对应多张票
- 扫码枪扫描订单，再打票

Print-Wrapper组件在业务组件中被加载时
```js
this.PrintSocket = new PrintSocket()
```

扫码枪、工作证业务组件中也有这一步操作，扫码枪业务中需要将实例化的PrintSocket作为参数传给Print-Wrapper

##### 1. 点击【打票】
在业务组件中，点击【打票】，组织orderIdList（订单列表）/ticketList（订单详情）数据

因为在Print-Wrapper中做了对`orderIdList/ticketList`的watch，所以业务组件中获取`orderIdList/ticketList`后，触发了Print-Wrapper的svgList的获取（ticket的svg是项目的模板svg，后续还需要处理）, 紧接着触发了Printer-Wrapper的露出

##### 2. 点击【确认打票】
Print-Wrapper露出后，点击【确认打票】：
1. Print-Wrapper中的逻辑，先移除之前的事件监听：
    ```js
    this.PrintSocket.removeAllListeners()
    ```
    移除事件监听：~~connectError~~，ticketPrinting，ticketPrintError，progress，finished

2. ~~绑定 websocket【连接失败】事件监听，失败则上报~~
    ```js
    this.printSocket.on('connectError', this.onConnectError)
    ```
    这里的逻辑有问题，不应该在Print-Wrapper中监听该事件，连接失败的处理（上报）应该放在PrintSocket内部，因为【连接】websocket的逻辑是公用的

3. 连接websocket，失败则重试
    ```js
    await  this.printSocket.connect()
    ```
    connect【连接】的逻辑放在PrintSocket内部，socket为打印、扫码枪扫描（加打印）、工作证加密等共用
    三次重试后仍失败则reject Promsie阻止后续，并上报连接失败

4. 打印预检验 
    预检验的逻辑放在Print-Wrapper中的内部：
    ```js
    const { checkOK = false } = await this.checkPrinterStatusInAdvance()
    if (!checkOK) {
      this.showPrintWrapper = false
      return
    }
    ```
    
    在PrintSocket内部提供getPrinterStatus发送测试打票指令检验打票功能（涉及了一些用于组织与websocket通信相关的数据），供Print-Wrapper的校验逻辑调用，如果测试失败则reject Promise并上报。PrintSocket这样一来checkPrinterStatusInAdvance就阻塞了Print-Wrapper后面的任务

5. 打印准备工作
    ```js
    this.printSocket.on('ticketPrinting', this.onTicketPrinting)

    // code 0: RFID打印未检测到票纸； 1: 二维码图片下载失败
    this.printSocket.on('ticketPrintError', this.onTicketPrintError)

    // 打印完成一张票
    this.printSocket.on('progress', this.onProgress)

    // 开始打第一张票 通过索引下标移动票打印
    this.svgIndex = 0 // 初始值是-1
    ```
    Print-Wrapper内的逻辑，绑定ticketPrintError/progress事件监听，因为这些都是打印相关的逻辑

6. 处理svgList中的svg字段
    在对`svgIndex`的watch处理中，做边界条件处理——是否允许开始打印以及打印是否结束
    如果正常，则开启打印流程，每一张票纸信息来自svgList[index]：
    - svgList如下：
    ![svgList](https://img.imgdb.cn/item/6013b0703ffa7d37b347eca2.jpg)

    因为订单可以是选择某个场次下的几个座位（有座项目）、几个票价（无座），场馆、演出名、时间等信息是订单下的票所公用的

    - svgProcess：
    ![ticket动态字段](https://img.imgdb.cn/item/6013b0e43ffa7d37b3481cf8.jpg)

    用动态字段替换svg模板对应的字段。（字符串->DOM->字符串

    这个svg处理过程中出错上报。

7. 打印指令

8. 发送打印完一张票的信号
    ```js
    PrintSocket.emit('progress')
    ```

    这就是为什么Print-Wrapper最初在测试打印通过后对PrintSocket做`progress`事件监听


### 总结
websocket通信、打印流程中很多关键节点需要做准确控制和错误上报，为了实现
1. 流程易于控制
2. 代码结构更加清晰
3. 易于复用和拓展
的PrintSocket模块，使用了Node的Event机制去实现。
