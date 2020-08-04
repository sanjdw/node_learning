## 初始化complier的输入输出文件系统以及监视文件系统

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
