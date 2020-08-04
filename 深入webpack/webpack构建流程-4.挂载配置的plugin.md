## 挂载配置的plugin
将compiler作为参数传入插件实现的apply方法，使插件可以监听compiler后续的所有事件：
```js
if (options.plugins && Array.isArray(options.plugins)) {
  for (const plugin of options.plugins) {
    if (typeof plugin === "function") {
      plugin.call(compiler, compiler);
    } else {
      plugin.apply(compiler);
    }
  }
}
```

#### 以clean-webpack-plugin为例
在clean-webpack-plugin实现的apply方法内调用compiler的plugin方法：
```js
class CleanWebpackPlugin {
  constructor (options = {}) {
    this.dry = options.dry
    this.verbose = this.dry === true || options.verbose === true || false
    // ...
    this.cleanOnceBeforeBuildPatterns = Array.isArray(options.cleanOnceBeforeBuildPatterns) ? options.cleanOnceBeforeBuildPatterns : ['**/*'];
    this.currentAssets = []
  }

  apply(compiler) {
    this.outputPath = compiler.options.output.path;

    const hooks = compiler.hooks;

    if (this.cleanOnceBeforeBuildPatterns.length !== 0) {
      if (hooks) {
        // 在compiler的emit钩子上注册clean-webpack-plugin回调
        hooks.emit.tap('clean-webpack-plugin', compilation => {
          this.handleInitial(compilation);
        });
      } else {
        compiler.plugin('emit', (compilation, callback) => {
          try {
            this.handleInitial(compilation);
            callback();
          } catch (error) {
            callback(error);
          }
        });
      }
    }

    if (hooks) {
      // compiler的done钩子上注册clean-webpack-plugin回调
      hooks.done.tap('clean-webpack-plugin', stats => {
        this.handleDone(stats);
      });
    } else {
      compiler.plugin('done', stats => {
        this.handleDone(stats);
      });
    }
  }
}
```
