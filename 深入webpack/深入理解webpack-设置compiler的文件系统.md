## 设置complier的文件系统
这一步的操作主要是应用Node.js风格的文件系统到`compiler`对象，以方便后续的文件寻找和读取：
```js
new NodeEnvironmentPlugin().apply(compiler)
```

`NodeEnvironmentPlugin`属于webpack的内置插件：
```js
class NodeEnvironmentPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.infrastructureLogger = createConsoleLogger(
      Object.assign(
        {
          level: "info",
          debug: false,
          console: nodeConsole
        },
        this.options.infrastructureLogging
      )
    );
    compiler.inputFileSystem = new CachedInputFileSystem(
      new NodeJsInputFileSystem(),
      60000
    );
    const inputFileSystem = compiler.inputFileSystem;
    compiler.outputFileSystem = new NodeOutputFileSystem();
    compiler.watchFileSystem = new NodeWatchFileSystem(
      compiler.inputFileSystem
    );

    // 在beforeRun钩子上注册了回调
    compiler.hooks.beforeRun.tap("NodeEnvironmentPlugin", compiler => {
      if (compiler.inputFileSystem === inputFileSystem) inputFileSystem.purge();
    });
  }
}
```
