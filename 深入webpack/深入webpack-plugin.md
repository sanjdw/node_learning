Plugin用于扩展执行范围更广的任务，在Webpack构建流程里从开始到结束都能找到时机作为插入点。

Plugin具有以下特点：
1. 监听webpack运行生命周期中广播的事件
2. 在合适时机通过webpack提供的API改变输出结果
3. webpack的Tapable事件流机制保证Plugin的有序性

<!-- 在webpack启动后，读取配置过程中执行new MyPlugin(opts)初始化自定义Plugin获取其实例，在初始化Compiler对象后，通过compiler.hooks.event.tap(PLUGIN_NAME, callback)监听webpack广播事件，当捕抓到指定事件后，会通过Compilation对象操作相关业务逻辑。一句话概括：自己看着办。 -->