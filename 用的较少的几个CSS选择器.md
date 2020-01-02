## 几个用的比较少的CSS选择器

1. 邻近元素选择器

```css
ul + p {
    color: red;
}
```

**只选中紧接在ul元素后的第一个兄弟p元素**。

2. 直接后代选择器

```css
#container > ul {
  border: 1px solid black;
}
```
与
```css
#container ul {
  border: 1px solid black;
}
```
区别是前者只会选中直接后代，如
```css
<div id="container">
  <ul>
    <li> List Item
      <ul>
      <li> Child </li>
      </ul>
    </li>
    <li> List Item </li>
    <li> List Item </li>
    <li> List Item </li>
  </ul>
</div>
```
`#container > ul`只会定义id为`container`的div里的第一代子元素ul，而不会定义第一个li里的第二代子元素ul。

3. 兄弟选择器
```css
ul ~ p {
  color: red;
}
```
兄弟选择器和邻近选择器(`ul + p`)很像，但没有那么严格。`ul + p`只会选择紧接在ul元素后的第一个兄弟元素p，但兄弟选择器更广泛，在上面的例子中，只要在ul后的p兄弟元素都会被选中。

4. first-child 、first-of-type 、 nth-child(n) 与 nth-of-type(n)


5. 通过正则匹配前后缀等。
- 
  ```css
  a[href*="nettuts"]
  ```
- 
  ```css
  a[href^="http"]
  ```
- 
  ```css
  a[href$="http"]
  ```



6. 否定伪类
```css
div:not(#container) {
  color: blue;
}
```
否定伪类非常有用。比如，希望选中所有的div元素，除了一个id为`container`的div。
