首先复习一下基本该概念，`git`本地数据管理，大概可以分为三个区：
- 工作区
- 暂存区
- 本地仓库

![git三个工作区](https://pic.downk.cc/item/5e9fcd63c2a9a83be547667b.png)
 
#### 查看commit历史记录
```git
git log
```
还带上`--pretty=oneline`或`--online`显示简略信息，如

```git
git log --pretty=online
```

![git log --pretty=online](https://pic.downk.cc/item/5e9fde76c2a9a83be554f215.jpg)

#### 查看命令历史记录
```git
git reflog
```

#### 撤销对文件的修改
```git
git checkout -- [filename]  
```

#### 创建分支
```git
git branch -b [branchname]
// 等价于下面
git branch [branchname]
git checkout [branchname]
```

#### 从指定分支拉代码
```git
git clone -b [branchname] [gitAddress]
```

___
#### <font color="red">版本回退</font>
```git
git reset [mode] [commit]
```

该命令用于回退本地仓库当前分支下的版本，并可以选择是否重置暂存区、工作区的修改。

`mode`参数可选：
- `--soft`
将HEAD引用指向指定`commit`，暂存区和工作区的内容不变

- `--mixed`（默认）
HEAD引用指向指定`commit`，暂存区内容重置，而工作区内容不变

- `--hard`
HEAD引用指向指定`commit`，并且暂存区、工作区全部重置

`commit`参数可选：
- `SHA1`
使用 SHA1 值回退到指定的版本，可实用`git log`查看`commit hash`

- `HEAD`
  - `HEAD`表示当前版本（默认参数)
  - 上一个版本为`HEAD^`，上上一个版本为`HEAD^^`，以此类推
  - 上 100 个版本，简写为`HEAD~100`

- `HEAD@{n}`
  Git在`1.8.5`版本之后，加入了此功能，它通过一个链表记录`HEAD`的移动路径，链表头部的`HEAD@{0}`即`HEAD`指针。这个功能可以用于回退到一个早已忘记的commit。

  这个功能一般配合`git reflog`命令使用。

___
#### <font color="red">移植commit：commitcherry-pick</font>
1. 找到需要移植的commit对应的哈希值（如：4946569a3067c4c7f7b483034cbb64b42ced0156）
2. 切到需要此次commit的branch(如 git checkout dev)
3. 在dev分支:
    ```git
    git cherry-pick 4946569a3067c4c7f7b483034cbb64b42ced0156
    ```
它可以将在其他分支上的commit修改，移植到当前的分支。

使用的场景——有的时候在某个分支上commit完之后发现需求开发在错误的分支上，可以切到目的bracn根据commit对应的`hash`将commit移植过来。

___
#### 合并分支
假设现在在dev分支上，要把代码合到master上
```git
git checkout master
git merge dev 
```

#### 删除分支
删除本地分支
```git
git branch -D [branchname]
```

删除远程分支
```git
git branch origin :[branchname]
```

___
#### <font color="red">将本地的修改保存起来，并且将当前代码切换到HEAD提交上</font>
什么意思？比如开发了一半要同步远程代码。如果直接`git pull`的话如果有冲突会提示你本地的修改没有`commit`，需要`commit`之后再拉代码。但是功能还未开发完，可以用`git stash`将修改先保存起来。

**`git stash`是针对整个git工程来进行保存的，它不会区分`branch`**。

比如在a分支上，
```git
git stash save "sss"
```
暂存了一个修改，那么当切换到b分支，使用
```git
git stash pop
```
就能把在a分支保存的`"sss"`这个修改同步到b分支上。所以当我们需要在不同的分支上取出不同的分支上保存的修改，那么就用到了`git stash list`，这个命令可以把在所有分支上暂存的信息显示出来：

![git stash list](https://pic.downk.cc/item/5ea02700c2a9a83be58fdcdb.jpg)

然后我们通过`git stash apply stash@{n}`来选择恢复哪个暂存。

这是一条非常实用的指令，在工作经常遇到这样的情况——正在一个分支进行开发，又要切到另一个分支改bug。

___
#### <font color="red">操作最近提交过的commit信息</font>
1. 合并最近的commit
    ```git
    git commit --amend
    ```
    本人这条命令常用的场景是：自以为fix了一个bug，commit之后提交测试，测试反馈bug未修复，重新修改代码`commit`，希望将此次commit与前一次commit合并为一次commit。

    ![git commit --amend](https://pic.downk.cc/item/5ea173b2c2a9a83be5fd7a45.jpg)

    会提示是否更新上一次`commit message`。

2. 修改最近的commit
    ```git
    git commit --amend -m 'change commit message'
    ```
    ![git commit --amend -m 'commit message'](https://pic.downk.cc/item/5ea17655c2a9a83be5009cba.jpg)

第一个合并`commit`也是非常实用的指令。
