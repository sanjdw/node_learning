#### 版本回退
```git
git reset --hard [commit_id]
```
提供一个 commit_id , 即可恢复到此次 commit 之后的状态。
```git
git reset --hard HEAD^
```
快速恢复到前一个版本， HEAD^ 表示当前版本的前一个版本，HEAD^^ 为往前数第二个版本...

#### 查看commit记录
需要查看 commit_id 来回退版时
```git
git log
```
已经回退之前的某版本后，`git log`查看不到在此之后的 commit 记录
需要用 `git reflog `
```git
git log --graph
```
可以查看分支合并图

#### 撤销对文件的修改
```git
git checkout -- [filename]  
git reset HEAD [filename] // 也可以
```

#### 创建分支
```git
git branch -b [branchname]
```
相当于
```git
git branch [branchname]
git checkout [branchname]
```
#### 合并分支

假设现在在 dev 分支上，要把代码合到 master 上
```git
git checkout master
git merge dev 
```

#### 删除分支
本地
```git
git branch -D [branchname]
```
远程
```git
git branch origin :[branchname]
```

#### 修改提交过的 commit 的 author 信息
author邮箱不正确无法push到远程仓库
```git
git commit --amend --author="username<mailname@✘✘✘.com>"
```
#### 将本地的修改保存起来,并且将当前代码切换到HEAD提交上
什么意思？比如开发了一半要同步远程代码。如果直接 git pull 的话如果有冲突会提示你本地的修改没有 commit，需要你 commit 之后再拉代码。但是你的功能还未做完，可以 git stash 将修改先隐藏起来：
```git
git pull origin [branchname]
```
// 提示失败，巴拉巴拉
```git
git stash
git pull origin [branchname]
git stash pop // 将隐藏的之前的修改pop出来
```
继续开发，需要merge。如果没有冲突不需要merge的话那么最初 git pull 也不会失败