## 注册配置的plugin
这一步遍历配置的`plugins`数组，依次调用插件的`apply`方法，并给插件传入`compiler`实例的引用，使插件可以监听`compiler`的生命周期钩子：
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

这里我们结合一个插件`clean-webpack-plugin`，看一看插件的`aplly`方法接收了`compiler`后做了哪些处理。

### 以clean-webpack-plugin为例
在`clean-webpack-plugin`实现的`apply`方法内调用`compiler`的`plugin`方法：
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
      // compiler的done钩子上注册回调
      hooks.done.tap('clean-webpack-plugin', stats => {
        this.handleDone(stats);
      });
    } else {
      compiler.plugin('done', stats => {
        this.handleDone(stats);
      });
    }
  }

  handleDone(stats) {
    const assets = stats.toJson().assets || [];
    const assetList = assets.map(asset => {
      return asset.name;
    });
    const staleFiles = this.currentAssets.filter(previousAsset => {
      const assetCurrent = assetList.includes(previousAsset) === false;
      return assetCurrent;
    });

    this.currentAssets = assetList.sort();
    const removePatterns = [];

    if (this.cleanStaleWebpackAssets === true && staleFiles.length !== 0) {
      removePatterns.push(...staleFiles);
    }
    if (this.cleanAfterEveryBuildPatterns.length !== 0) {
      removePatterns.push(...this.cleanAfterEveryBuildPatterns);
    }

    if (removePatterns.length !== 0) {
      this.removeFiles(removePatterns);
    }
  }
}
```

可以看到，`CleanWebpackPlugin`在`apply`方法内为`compiler`的生命周期钩子`done`注册了回调，而`complier.hooks.done`钩子的声明及触发是在`compiler`的初始化阶段就定义好了的。

这样，当`compiler.hooks.done`钩子触发时，插件内定义的`handleDone`方法便得以执行，清空构建输出目录下的文件，这也正是`clean-webpack-plugin`插件的核心功能。
