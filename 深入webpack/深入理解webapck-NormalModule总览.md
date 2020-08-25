## Normalmodule

```js
class NormalModule extends Module {
  constructor({type, request, userRequest, rawRequest, loaders, resource, matchResource, parser, generator, resolveOptions}) {
    super(type, getContext(resource));

    this.request = request
    this.userRequest = userRequest
    this.rawRequest = rawRequest
    this.binary = type.startsWith("webassembly")
    this.parser = parser
    this.generator = generator
    this.resource = resource;
    this.matchResource = matchResource
    this.loaders = loaders
    if (resolveOptions !== undefined) this.resolveOptions = resolveOptions

    this.error = null
    this._source = null
    this._buildHash = ""
  }
  createLoaderContext () {}
  getCurrentLoader () {}
  createSource () {}
  build () {}
  // ...
}
```

### build 方法
```js
build(options, compilation, resolver, fs, callback) {
  this.built = true
  this._source = null
  this._ast = null
  this._buildHash = ""
  this.buildMeta = {}

  return this.doBuild(options, compilation, resolver, fs, () => {
    this._cachedSources.clear()

    const handleParseResult = result => {
      this._lastSuccessfulBuildMeta = this.buildMeta
      this._initBuildHash(compilation)
      return callback()
    }

      // 这里会将source转为 AST，递归分析出所有的依赖
    const result = this.parser.parse(
      this._ast || this._source.source(),
      { current: this, module: this, compilation: compilation, options: options },
      (result) => {
        handleParseResult(result)
      }
    )
    if (result !== undefined) {
      handleParseResult(result)
    }
  })
}
```

### doBuild
```js
doBuild(options, compilation, resolver, fs, callback) {
  const loaderContext = this.createLoaderContext(resolver, options, compilation, fs)
  // 运行配置文件中配置的loader，比如babel-loader，然后返回处理完毕后的源码(JS)
  runLoaders(
    { resource: this.resource, loaders: this.loaders, context: loaderContext, readResource: fs.readFile.bind(fs) },
    result => {
      if (result) {
        this.buildInfo.cacheable = result.cacheable
        this.buildInfo.fileDependencies = new Set(result.fileDependencies)
        this.buildInfo.contextDependencies = new Set(result.contextDependencies)
      }

      const resourceBuffer = result.resourceBuffer
      const source = result.result[0]
      const sourceMap = result.result.length >= 1 ? result.result[1] : null
      const extraInfo = result.result.length >= 2 ? result.result[2] : null

			// createSource 会将 runLoader 得到的结果转为字符串以便后续处理
      this._source = this.createSource(
        this.binary ? asBuffer(source) : asString(source),
        resourceBuffer,
        sourceMap
      )
      this._ast =
        typeof extraInfo === "object" &&
        extraInfo !== null &&
        extraInfo.webpackAST !== undefined
          ? extraInfo.webpackAST
          : null
      return callback()
    }
  )
}
```

`doBuild`主要作用是选择合适的`loader`去加载`resource`，转换为js模块，再返回转换后的文件以便后续继续处理

### createSource
创建源码
