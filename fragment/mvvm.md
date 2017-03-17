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
        <title>vue</title>
    </head>
    <body>
    <div id="app">
        <input type="text" id="a" v-model="mesg2">
        {{msg}}
    </div>
    <div id="father"></div>
    <script>
        function compile(node,vm){
            var reg = /\{\{(.*)\}\}/;
            if(node.nodeType == 1){
                var attr = node.attributes;
                for(var i=0;i<attr.length;i++){
                    if(attr[i].nodeName == 'v-model'){
                        var name =  attr[i].nodeValue;
                        node.value = vm.data[name];
                        node.removeAttribute("v-model");
                    }
                }
            }
            if(node.nodeType == 3){
                if(reg.test(node.nodeValue)){
                    var name = RegExp.$1;
                    name = name.trim();
                    node.nodeValue = vm.data[name];
                }
            }
        }

	function nodeToFragment(node,vm){
		var flag = document.createDocumentFragment();
		var child;

		while(child = node.firstChild){
			compile(child,vm);
			flag.append(child);
		}
		return flag;
	}

	function Vue(options){
		this.data = options.data;
		var id = options.el;
		var dom = nodeToFragment(document.getElementById(id),this);

		document.getElementById(id).appendChild(dom);
	}

	var vm = new Vue({
		el:'app',
		data:{
			msg:"world!",
			mesg2:'hello'
		}
	});


    </script>
    <!-- <script>
        var vm =new Vue({
            el:"#app",
            data:{
                msg:"hello world!"
            }
        });
    </script> -->
    </body>
    </html>