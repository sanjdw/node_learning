## contains方法

在JavaScript中有一个`contains`方法，是用于判断dom的包含关系。

	var dom1 = document.getElementById("dom1");
	dom1.contains(document.getElementById("dom2")) // 返回true或者false
contain方法的参数是**Node类型**。

此外，node节点的classList也有`contains`方法，用来判断是否包含某个类名：

    document.getElementById("name").classList.contains("classname")
    //true or false
