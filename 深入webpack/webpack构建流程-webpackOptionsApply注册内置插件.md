## WebpackOptionsApply

在`WebpackOptionsApply`的实现中可以发现这个继承了`OptionsApply`的子类内只提供了一个`process`方法：
```js
class WebpackOptionsApply extends OptionsApply {
	constructor() {
		super()
	}
  process(options, compiler) {
		compiler.outputPath = options.output.path
		compiler.recordsInputPath = options.recordsInputPath || options.recordsPath
		compiler.recordsOutputPath = options.recordsOutputPath || options.recordsPath
		compiler.name = options.name
		compiler.dependencies = options.dependencies

    switch (options.target) {
      case "web":
        JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin")
        FetchCompileWasmTemplatePlugin = require("./web/FetchCompileWasmTemplatePlugin")
        NodeSourcePlugin = require("./node/NodeSourcePlugin")
        new JsonpTemplatePlugin().apply(compiler)
        new FetchCompileWasmTemplatePlugin({
          mangleImports: options.optimization.mangleWasmImports
        }).apply(compiler)
        new FunctionModulePlugin().apply(compiler)
        new NodeSourcePlugin(options.node).apply(compiler)
        new LoaderTargetPlugin(options.target).apply(compiler)
        break
      // ... 其他case： webworker、node、async-node...
      default:
        throw new Error("Unsupported target '" + options.target + "'.")
    }

    // 加载模块并触发entry-option事件流
    new EntryOptionPlugin().apply(compiler)
    compiler.hooks.entryOption.call(options.context, options.entry)

    new CommonJsPlugin(options.module).apply(compiler)
		new LoaderPlugin().apply(compiler)
    // ...在compiler上挂载了其他plugin

    compiler.hooks.afterPlugins.call(compiler)
    // ...
    compiler.resolverFactory.hooks.resolveOptions.for("context")
			.tap("WebpackOptionsApply", resolveOptions => {
				return Object.assign({ fileSystem: compiler.inputFileSystem, resolveToContext: true }, cachedCleverMerge(options.resolve, resolveOptions))
			})
		compiler.resolverFactory.hooks.resolveOptions.for("loader")
      .tap("WebpackOptionsApply", resolveOptions => {
        return Object.assign({ fileSystem: compiler.inputFileSystem }, cachedCleverMerge(options.resolveLoader, resolveOptions))
			})
    compiler.hooks.afterResolvers.call(compiler)
		return options
  }
}
```

主要工作可以分为两类：注册内置插件、触发某些钩子。

`process`方法执行完，所有的回调都注册在了相应的钩子上，等待后续编译过程中钩子的触发。
