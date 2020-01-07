#### JavaScript是单线程的
```js
while (true) {}
console.log(1)
```
这样一行代码运行在浏览器中，由于JavaScript是单线程的，`while (true) {}`阻塞了当前窗口的JavaScript线程，`console.log(1)`永远得不到执行。

```java
class ThreadDemo extends Thread {
   private Thread t;
   private String threadName;
   
   ThreadDemo( String name) {
      threadName = name;
      System.out.println("Creating " +  threadName );
   }
   
   public void run() {
      System.out.println("Running " +  threadName );
      try {
         for(int i = 4; i > 0; i--) {
            System.out.println("Thread: " + threadName + ", " + i);
            // 让线程睡眠一会
            Thread.sleep(1000);
         }
      } catch (InterruptedException e) {
         System.out.println("Thread " +  threadName + " interrupted.");
      }
      System.out.println("Thread " +  threadName + " exiting.");
   }
   
   public void start () {
      System.out.println("Starting " +  threadName );
      if (t == null) {
         t = new Thread (this, threadName);
         t.start ();
      }
   }
}
 
public class TestThread {
   public static void main(String args[]) {
      ThreadDemo T2 = new ThreadDemo( "Thread-2");
      ThreadDemo T1 = new ThreadDemo( "Thread-1");
      T1.start();
      T2.start();
   }   
}
```
JavaScript

#### 浏览器是多进程的
JavaScript运行在浏览器中是单线程的，而浏览器不是单线程的，它甚至是多进程的。

#### Web Worker