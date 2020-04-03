### 从构造函数Vue开始

```js
/*
* src/core/instance/init.js
*/

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
  // 创建Vue实例的入口，_init方法是在initMixin内实现的，本章主要阅读的正是initMixin
}

// 下面的每个方法可以看做装饰器，从几个角度为Vue增加原型上的属性和方法。

initMixin(Vue)
// 做了一件事情，在Vue原型上挂载了一个_init方法

stateMixin(Vue)
// 在Vue原型上挂载了 $data、$props、$set、$delete、$watch

eventsMixin(Vue)
// 在Vue原型上挂载了 $on、$once、$off、$emit

lifecycleMixin(Vue)
// 在Vue原型上挂载了 _update、$forceUpdate、$destroy

renderMixin(Vue)
// 挂载以下属性
// Vue.prototype.$nextTick
// Vue.prototype._render
// Vue.prototype._o = markOnce
// Vue.prototype._n = toNumber
// Vue.prototype._s = toString
// Vue.prototype._l = renderList
// Vue.prototype._t = renderSlot
// Vue.prototype._q = looseEqual
// Vue.prototype._i = looseIndexOf
// Vue.prototype._m = renderStatic
// Vue.prototype._f = resolveFilter
// Vue.prototype._k = checkKeyCodes
// Vue.prototype._b = bindObjectProps
// Vue.prototype._v = createTextVNode
// Vue.prototype._e = createEmptyVNode
// Vue.prototype._u = resolveScopedSlots
// Vue.prototype._g = bindObjectListeners

export default Vue
```

___
#### initMixin
```js
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // 每个Vue实例都会有一个递增唯一的id标识
    vm._uid = uid++


    // 非生产环境对性能进行监控
    let startTag, endTag
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // 所有Vue的实例都被标记_isVue = true，它的作用是避免实例被响应系统observe?
    vm._isVue = true

    // 对用于初始化实例的options做了一层处理，然后赋值给实例属性$options
    if (options && options._isComponent) {
      // _isComponent 是一个内部选项，在创建组件的时候才会生成
      // 优化内部组件的实例化，因为动态选项合并非常慢，而且没有一个内部组件选项需要特殊处理?
      initInternalComponent(vm, options)
    } else {
      // 根实例的$options处理入口
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }

    // 在非生产环境下设置渲染函数的作用域代理，其目的是在开发时提供更好的提示信息（如在模板内访问实例上不存在的属性，则会给出准确的报错信息）
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
  
    // expose real self
    vm._self = vm

    // 实例的生命周期相关变量初始化
    initLifecycle(vm)

    // 实例的事件监听初始化
    initEvents(vm)

    // 实例的编译render初始化
    initRender(vm)

    // 实例的beforeCreate生命钩子的回调
    callHook(vm, 'beforeCreate')

    // 实例在data/props初始化之前要进行绑定?
    initInjections(vm) // resolve injections before data/props
    
    // 实例state状态初始化
    initState(vm)

    // 实例在data/props之后要进行提供?
    initProvide(vm) // resolve provide after data/props

    // 实例的created生命钩子的回调
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    // 根据挂载点，调用挂载函数
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

#### mergeOptions
初始化通过`new Vue`创建的Vue实例的options。
```js
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```

#### resolveConstructorOptions
该函数主要判断构造函数是否存在父类，若存在父类需要对`vm.constructor.options`进行处理返回，若不存在直接返回`vm.constructor.options`。
```js
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}
```


#### initInternalComponent
处理子组件实例的options。

```js
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

```