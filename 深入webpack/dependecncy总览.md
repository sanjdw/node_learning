之前在分析`webpackOptionsApply`注册内置插件时提到过`SingleEntryPlugin`，对于如下配置：
```js
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  // ...
}
```

`compiler.hooks.entryOption`钩子被触发时会为`compiler`注册`SingleEntryPlugin`：
```js
new SingleEntryPlugin('path/to/project', './src/index.js', 'main').apply(compiler)
```

![SingleEntryPlugin实例](https://pic.downk.cc/item/5f590b57160a154a674dd369.jpg)

而`SingleEntryPlugin`会在`compiler.hooks.make`钩子上注册任务：

```js
class SingleEntryPlugin {
  constructor(context, entry, name) {
    this.context = context
    this.entry = entry
    this.name = name
  }

  apply(compiler) {
    compiler.hooks.make.tapAsync(
      "SingleEntryPlugin",
      (compilation, callback) => {
        const { entry, name, context } = this

        const dep = SingleEntryPlugin.createDependency(entry, name)
        compilation.addEntry(context, dep, name, callback)
      }
    )
  }

  static createDependency(entry, name) {
    const dep = new SingleEntryDependency(entry)
    dep.loc = { name }
    return dep
  }
}
```

`make`钩子接收`compilation`参数，在调用`compilation.addEntry`开启编译工作前，需要一个`dep`参数。而这个`dep`又是通过构造函数`SingleEntryDependency`创建的：
```js
class SingleEntryDependency extends ModuleDependency {
	constructor(request) {
		super(request)
	}

	get type() {
		return "single entry"
	}
}

class ModuleDependency extends Dependency {
  constructor(request) {
    super()
    this.request = request
    this.userRequest = request
  }

  getResourceIdentifier() {
    return `module${this.request}`
  }
}

class Dependency {
  constructor() {
    this.module = null
    this.weak = false
    this.optional = false
    this.loc = undefined
  }

  getReference() {
    if (!this.module) return null
    return new DependencyReference(this.module, true, this.weak)
  }

  updateHash(hash) {
    hash.update((this.module && this.module.id) + "")
  }

  disconnect() {
    this.module = null
  }
}
```

![dep](https://pic.downk.cc/item/5f590d81160a154a674ec349.jpg)
