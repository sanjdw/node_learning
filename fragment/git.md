# git在几种常用情况下的命令

- **在本地新建一个仓库，推到github上**

    1.在项目路径下，

        git init
    2.然后到自己的github上去，右上角**new repository**新建一个仓库，仓库名最好与本地项目名一致。

    3.将本地仓库与github上的仓库关联起来：

        git remote add origin git@github.com:sanjdw/project.git
        //这里的sanjdw是我的github用户名，你在这里需要填上你自己的github账户名
        //project是我当前项目(仓库)的名字，这里请填上你自己的项目(仓库)名
    4.项目搭建完以后，push到自己的github上去。
        git add/commit就不讲了

        git push -u origin master
        //注意这里的参数  -u: git就会把本地的master分支和github上的master分支关联起来，以后再push的时候就不需要这个参数了

- **在公司的电脑上把项目push到github上，回到家clone下来**

     1.

-  版本回退
git reset --hard [commit_id]， 提供一个 commit_id , 即可恢复到此次 commit 之后的状态。
git reset --hard HEAD^， 快速恢复到前一个版本， HEAD^ 表示当前版本的前一个版本，HEAD^^ 为往前数第二个版本...

- 查看commit记录
需要查看 commit_id 来回退版时， git log
已经回退之前的某版本后，git log 查看不到在此之后的 commit 记录
需要用 git reflog 
git log --graph 可以查看分支合并图

- 撤销对文件的修改
git checkout -- [filename]  
git reset HEAD [filename] 也可以

- 创建分支
git branch -b [branchname]
相当于
git branch [branchname]
git checkout [branchname]

- 合并分支
假设现在在 dev 分支上，要把代码合到 master 上
git checkout master
git merge dev 

- 删除分支
本地 git branch -D [branchname]
远程 git branch origin :[branchname]

- 修改提交过的 commit 的 author 信息
author邮箱不正确无法push到远程仓库
git commit --amend --author="username&lt;mailname@✘✘✘.com&gt;"