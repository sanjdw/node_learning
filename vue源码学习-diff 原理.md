渲染真实DOM的开销是很大的，有的时候修改了某个数据，如果直接渲染到真实DOM上会引起整个DOM树的重绘和重排，diff运算能够帮助我们只更新修改的那一小部分DOM。
### Virtual DOM 相关
##### 1. Virtual DOM是什么？
我们先根据真实DOM生成一颗virtual DOM，当virtual DOM某个节点的数据改变后会生成一个新的Vnode，然后Vnode和oldVnode作对比，发现有不一样的地方就直接修改在真实的DOM上。

diff的过程就是调用名为patch的函数，比较新旧节点，一边比较一边给真实的DOM打补丁。
##### 2. Virtual DOM什么时候生成?
在初始化完选项，解析完模板之后，就需要挂载 DOM了。此时就需要生成 VNode，才能根据 VNode 生成 DOM 然后挂载
##### 3. 存储在哪里？
三个位置存储了vnode:
- parent
- _vnode
- $vnode

### diff运算
##### 1. 双端比较
```js
function patch (oldVnode, vnode) {
  // 判断两个节点是否值得比较
  // 值得比较则检查子节点
  // 不值得比较则用新节点替换旧节点
  if (sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode)
  } else {
    const parentEle = api.parentElement(oldVnode.el)
    createEle(vnode)
    if (parentEle) {
      api.insertBefore(parentEle, vnode.el, oldVnode.el)
      api.removeChild(parentEle, oldVnode.el)
      oldVnode = null
    }
  }
  return vnode
}

function sameVnode (oldVnode, vnode) {
  reuturn (
    oldVnode.key === vnode.key && (
      (
        oldVnode.tag === vnode.tag &&
        oldVnode.isComment === vnode.isComment &&
        isDef(oldVnode.data) === isDef(vnode.data) &&
        sameInputType(oldVnode, vnode)
      ) || (
        isTrue(oldVnode.isAsyncPlaceholder) &&
        oldVnode.asyncFactory === vnode.asyncFactory &&
        isUndef(vnode.asyncFactory.error)
      )
    )
  )
}

// 逐步找到更新前后 vdom 的差异，然后将差异反应到 DOM 上
function patchVnode (oldVnode, vnode) {
  const el = vnode.el = oldVnode.el
  const oldCh = oldVnode.children
  const ch = vnode.children
  if (oldVnode === vnode) return
  // 如果
  if (oldVnode.text && vnode.text && oldVnode.text !== vnode.text) {
    api.setTextContent(el, vnode.text)
  } else {
    if (oldCh && ch && oldCh !== ch) {
      updateChildren(el, oldVnode, vnode)
    } else if (ch) {
      createEle(vnode)
    } else if (oldCh) {
      api.removeChildren(el)
    }
  }
}

function updateChildren () {}
```
##### 2. 设置了key与不设置key的区别
在diff运算中，当新节点与旧节点在经过**头尾交叉**对比后没有匹配时，会根据新节点的key去对比旧节点数组中的key，从而找到相应的旧节点，如果没找到就认为是一个新增节点。

##### 3. 优化
vue 2.0采用了上述的 **双端比较法** 作为diff运算，而vue 3.0则借鉴了`inferno.js`的`LIS`(最长递增子序列)思想。

___
#### 参考:
1. [【Vue原理】Diff-白话版](https://zhuanlan.zhihu.com/p/81752104)
2. [解析vue2.0的diff算法](https://github.com/aooy/blog/issues/2)
3. [vue patch 源码](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js)