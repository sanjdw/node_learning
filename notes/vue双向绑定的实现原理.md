## vue双向绑定的实现原理

有了对`访问器属性`的基本认识以后，就可以去看一看vue的双向绑定是怎样实现的。

先来看这段代码，这是双向绑定的非常简单的一个实现：

    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>vm双向绑定</title>
    </head>
    <body>
    <div>输入:<input type="text" id="in"></div>
    <div>输出：<span id="out"></span></div>
    <script>
        var obj ={};

        Object.defineProperty(obj,"data",{
            set:function(newValue){
                document.getElementById("in").value = newValue;
                document.getElementById("out").textContent = newValue;
            }
        });

        if(window.addEventListener){
            document.getElementById("in").addEventListener("keyup",function(event){
                obj.data = event.target.value;
            });
        }else if(window.attachEvent){
            document.getElementById("in").attachEvent("onkeyup",function(event){
                obj.data = event.target.value;
                console.log("IE");
            });
        }
    </script>
    </body>
    </html>

  利用对象`obj`的`data`属性的`getter`和`setter`拦截，当Javascript中`obj`的`data`属性值被改变时候触发dom值的改变，**model->view**。
  并给input绑定了监听键盘事件，当dom值改变的时候，触发`setter`，**view->model**。

   我们最终要实现的是像vue这样的双向绑定：

    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>vm双向绑定</title>
    </head>
    <body>
    <div id="app">
        <input type="text" id="a" v-model="msg1">
        {{msg1}}
    </div>
    <script>
        function compile(node,vm){
            var reg = /\{\{(.*)\}\}/;
            if(node.nodeType == 1){      //元素节点，先从v-model=""中将vm实例data中的属性名读出，然后对该节点value根据data属性值赋值
                var attr = node.attributes;
                for(var i=0;i<attr.length;i++){
                    if(attr[i].nodeName == 'v-model'){//input
                        var name =  attr[i].nodeValue;
                        if(window.addEventListener){
                            node.addEventListener("input",function(e){// view->model
                                vm[name] = e.target.value;
                            });
                        }else{
                            node.attachEvent("oninput",function(e){
                                vm[name] = e.target.value;
                            });
                        }
                        node.value = vm[name];
                        node.removeAttribute("v-model");
                    }else if (attr[i].nodeName == 'v-text') {
                        var name =  attr[i].nodeValue;
                        node.textContent = vm.data[name];
                        node.removeAttribute("v-text");
                    }
                }
            }
            if(node.nodeType == 3){      //文本节点，从{{}}中将vm实例data中的属性名读出，然后赋值
                if(reg.test(node.nodeValue)){
                    var name = RegExp.$1;
                    name = name.trim();
    
                    new Watcher(vm,node,name);
                }
            }
        }
    
        function nodeToFragment(node,vm){
            var flag = document.createDocumentFragment();
            var child;
    
            while(child = node.firstChild){
                compile(child,vm);
                if(document.append){
                    flag.append(child);
                }else{
                    flag.appendChild(child);
                }
    
            }
            return flag;
        }
    
        function accessor(obj,attr,val){
            var dep = new Dep();
            Object.defineProperty(obj,attr,{
                get:function(){
                    if(Dep.target)  dep.addSub(Dep.target);
                    return val;
                },
                set:function(new_val){
                    if(val === new_val)
                        return;
                    val = new_val;
                    //发布
                    dep.notify();
                }
            });
        }
    
        function observe(obj,vm){
            Object.keys(obj).forEach(function(attr){//遍历实例对象vm的data中的属性访问器
                accessor(vm,attr,obj[attr]);
            });
        }
    
        function Watcher(vm,node,name){
            Dep.target = this;
            this.name = name;
            this.node = node;
            this.vm = vm;
            this.update();
            Dep.target = null;
        }
    
        Watcher.prototype = {
            update:function(){
                this.node.nodeValue = this.vm[this.name];
            }
        };
    
        function Dep(){
            this.subs = [];
        }
    
        Dep.prototype = {
            addSub:function(sub){
                this.subs.push(sub);
            },
    
            notify:function(){
                this.subs.forEach(function(sub){
                    sub.update();
                });
            }
        }
    
        function Vue(options){
            this.data = options.data;
            var data  =this.data;
    
            observe(data,this);
    
            var id = options.el,
                dom = nodeToFragment(document.getElementById(id),this);
    
            document.getElementById(id).appendChild(dom);
        }
    
        var vm = new Vue({
            el:'app',
            data:{
                msg1:"world!"
            }
        });
    </script>
    </body>
    </html>
