### 比较已经add进缓存区的文件改动
在将代码`add`进暂存区（staging area）之前我一般习惯使用：
```bash
git diff <filename>
```

确认工作区的改动，然后`add -> commit`。有些时候会忘记已经`add`进暂存区的改动，不知道如何写`commit message`，此时可以加上`--cached`参数：
```bash
git diff --cached <filname>
```

### 比较branch
之前我习惯在`push`之后，提`pull request`时查看文件改动，今天发现可以直接比较分支——比如当前开发分支`feature/20200831`合并到`master`分支：
```bash
git diff feature/20200831 master
```

### 绕过eslint commit
下午在项目中新开了一个测试分支，只是用来分析小程序业务代码的运行流程的，想要`push`后回家看一下，由于项目配置了`eslint`检查，通过`--no-verify`参数绕过：
```bash
git commit -m 'style: ****' --no-verify
```
