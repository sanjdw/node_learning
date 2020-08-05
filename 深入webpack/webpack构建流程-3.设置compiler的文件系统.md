## 设置complier的文件系统
这一步的操作主要是应用Node.js风格的文件系统到`compiler`对象，以方便后续的文件寻找和读取。

new NodeEnvironmentPlugin().apply(compiler)

```js
class NodeEnvironmentPlugin {
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

    // 注册NodeEnvironmentPlugin
    compiler.hooks.beforeRun.tap("NodeEnvironmentPlugin", compiler => {
      if (compiler.inputFileSystem === inputFileSystem) inputFileSystem.purge();
    });
  }
}
