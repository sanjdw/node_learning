运用你所掌握的数据结构，设计和实现一个`LRU`(最近最少使用) 缓存机制。它应该支持以下操作：读取数据`get`和写入数据`put`。
- 读取数据`value = get(key)`：如果关键字`key`已经存在，则返回其对应的数据`value`；如果关键字不存在，则返回`-1`。为了简单起⻅，假设数据`value`都是非负整数。
- 写入数据`put(key, value`：如果关键字`key`已经存在，则更新其对应的数据`value`；如果关键字不存在，则插入数据。当缓存容量达到上限时，应该在插入新数据之前删除最久未使用的数据，从而为新的数据留出空间。

#### 1. 哈希表 + 队列
可以借鉴Vue的`keep-alive`的实现，通过维护一个队列以及一个哈希表：
```js
class LRUCache {
  constructor (capacity) {
    this.capacity = capacity
    this.cache = Object.create(null)
    this.keys = []
  }

  get (key) {
    if (this.cache(key) !== undefined) {
      const value = this.cache[key]
      this._removeKey(key)
      this.keys.push(key)
      return this.cache[key]
    } else {
      return -1
    }
  }

  put (key, value) {
    if (this.cache[key]) {
      this.cache[key] = value
      this._removeKey(key)
      this.keys.push(key)
    } else {
      if (this.capacity === this.keys.length) {
        // 超出最大缓存空间，需要将队列第一个移出
        const _key = this.keys[0]
        this._removeKey(_key)
        this.cache[_key] = null
      }
      this.cache[key] = value
      this.keys.push(key)
    }
  }

  _removeKey (key) {
    const index = this.keys.indexOf(key)
    this.keys.splice(index, 1)
  }
}
```

列表将`key`按其最近使用顺序，哈希表则维护了`key`与其值的映射关系。

#### 2. 哈希表 + 双向链表
在上面的实现中，不论是`get`还是`put`都涉及了对队列的遍历的操作，这导致读写操作的时间复杂度都在`O(n)`，如果希望把它们降到`O(1)`，可以使用双向链表替代队列：
```js
class Node {
  constructor (key, value, prev, next) {
    this.key = key
    this.value = value
    this.prev = prev
    this.next = next
  }
}

class DoubleLinkedList {
  constructor () {
    this.head = null
    this.tail = null
    this.size = 0
  }

  // 节点本身不在链表中
  addHead (node) {
    if (this.head) {
      this.head.prev = node
      node.next = this.head
      this.head = node
    } else {
      this.head = this.tail = node
    }
    this.size++
  }

  // 删除尾结点
  deleteTail () {
    const tail = this.tail

    if (tail) {
      // 倒数第二个节点
      const _tail = tail.pre

      if (_tail) {
        _tail.next = null
        this.tail = _tail
      } else {
        this.head = this.tail = null
      }
      this.size--
    }
  }

  // 节点本身在链表中
  moveToHead (node) {
    // node已经是头节点
    if (node === this.head) return

    node.pre = null
    this.head.pre = node
    node.next = this.head
    this.head = node
  }
}

class LRUCache {
  constructor (capacity) {
    this.capacity = capacity
    this.cache = Object.create(null)
    this.keys = new DoubleLinkedList()
  }

  get (key) {
    const node = this.cache[key]

    if (node) {
      this.keys.moveToHead(node)
      return node.value
    } else {
      return -1
    }
  }

  put (key, value) {
    if (this.cache[key]) {
      const node = this.cache[key]
      node.value = value
      this.keys.moveToHead(node)
    } else {
      if (this.capacity === this.keys.size) {
        this.cache[this.keys.tail.key] = null
        this.keys.deleteTail()
      }

      const node = new Node(key, value)
      this.keys.addHead(node)
      this.cache[key] = node
    }
  }
}
```
