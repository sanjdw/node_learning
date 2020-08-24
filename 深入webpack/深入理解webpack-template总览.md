## template总览

### MainTemplate
```js
class MainTemplate extends Tapable {
  constructor(outputOptions) {
    super();
    this.outputOptions = outputOptions || {};
    this.hooks = {
      renderManifest: new SyncWaterfallHook(["result", "options"]),
      modules: new SyncWaterfallHook(["modules", "chunk", "hash", "moduleTemplate", "dependencyTemplates"]),
      moduleObj: new SyncWaterfallHook(["source", "chunk", "hash", "moduleIdExpression"]),
      requireEnsure: new SyncWaterfallHook(["source", "chunk", "hash", "chunkIdExpression"]),
      // ...其他钩子
    }
    this.hooks.startup.tap("MainTemplate", () => {})
    this.hooks.render.tap("MainTemplate", () => {})
    // ...
    getRenderManifest(options) {}
    render () {}
  }
}
```

可以看到，`MaintTemplate`也继承自`Tapable`，它创建的对象与`compiler`、`compilation`非常相像，它也有很多钩子和方法，钩子上被注册了回调。
