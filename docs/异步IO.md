##  Node的异步I/O

### 事件循环

Node在进程启动的时候，会创建一个类似`while(true)`的循环，每次执行一次循环体的过程，我们称为`Tick`。每次如果Tick中存在事件待处理，就会取出事件并执行回调，然后进行下一个循环，直到没有事件处理，退出进程。

![](https://picgo-1305798447.cos.ap-guangzhou.myqcloud.com/img/202212212255315.png)

那么，如何判断是否有事件要处理？此时我们就需要引入**观察者**的概念。也就是这些观察者可以知道是否有要处理的事件。

> 事件循环是一个典型的生成者消费者模型，异步I/O、网络请求这些都是事件的生成者，而事件循环每一个Tick则是取出事件执行回调，充当消费者的角色。

### 请求对象

在进行异步I/O操作时，会产生中间产物——**请求对象**。所有的状态都保存在这个对象中，包括送入线程池等待执行以及完成I/O操作完毕后的回调处理。

![](https://picgo-1305798447.cos.ap-guangzhou.myqcloud.com/img/202212212305705.png)

### 总结

事件循环、观察者、请求对象、I/O线程池这四者共同构成了Node异步I/O模型的基本要素。

> 异步I/O的单线程和线程池，并不悖论。
> 
> 事实上除了JavaScript是单线程的以外，Node其实是多线程的，只是I/O线程使用的CPU很少。
> 
> 另外，除了用户代码无法并行执行之外，所有的I/O操作（磁盘I/O和网络I/O）都是可以并行的。

## 非I/O的异步API

setTimeout、setInterval、setImmediate、process.nextTick

### 定时器

调用setTimeout或者setInterval时创建的定时器会被插入到定时器观察者内部的一个红黑树中。每次Tick执行时，会从红黑树中迭代取出定时器对象，检查是否超过规定时间，如果超过，形成一个事件，执行相应的回调函数。

> 定时器并非都是精准的。尽管事件循环非常快，但是如果某一循环占用时间过长，那么下次循环时，说不定已经超时很久了。

![](https://picgo-1305798447.cos.ap-guangzhou.myqcloud.com/img/202212221110897.png)

### process.nextTick

类似`setTimeout(fn, 0)`，但使用`process.nextTick`更加轻量。

每次调用`process.nextTick`，只会将回调函数放入队列中，在下一次Tick取出执行。

定时器中使用红黑树，操作时间复杂度为O(lg(n))，nextTick的时间复杂度是O(1)。

### setImmediate

类似`nextTick`，`nextTick`的优先级高于`setImmediate`。

原因在于：事件循环对观察者的检查是有先后顺序的，`process.nextTick`属于idle观察者，`setImmediate`属于check观察者。在每一轮循环检查中，idle观察者先于I/O观察者，I/O观察者先于check观察者。

```js
process.nextTick(function () { console.log('nextTick延迟执行');
});
setImmediate(function () {
console.log('setImmediate延迟执行'); });
console.log('正常执行');
```

结果是：

```text
正常执行
nextTick延迟执行
setImmediate延迟执行
```

实际中，`process.nextTick`的回调函数保存在一个数组中，`setImmediate`的结果则是存储在一个链表中。在一轮循环中，`process.nextTick`回取出来所有的回调函数执行，但`setImmediate`则是取出链表中的一个进行执行。

```js
// 加入延迟nextTick()的回调函数
process.nextTick(function () {
	console.log('nextTick延迟执行1'); 
});
process.nextTick(function () { 
	console.log('nextTick延迟执行2');
}); 
// 加入两个setImmediate()的回调函数
setImmediate(function () {
	console.log('setImmediate延迟执行1'); 
	// 进入下次循环 
	process.nextTick(function () {
		console.log('强势插入'); 
	});
});
setImmediate(function () {
	console.log('setImmediate延迟执行2'); 
});
console.log('正常执行');
```

结果是：

```text
正常执行
nextTick延迟执行1
nextTick延迟执行2
setImmediate延迟执行1
强势插入
setImmediate延迟执行2
```

之所以这么设计，是为了保证每轮循环能够较快地执行结束，防止CPU占用过多而阻塞后续I/O调用的情况。

## Node构建Web服务器

![](https://picgo-1305798447.cos.ap-guangzhou.myqcloud.com/img/202212221131266.png)

### 服务器模型

- 几种经典的服务器模型
	- 同步式：一次处理一个请求，其余请求处于等待状态
	- 每进程/每请求：为每个请求启动一个进程，可以处理多个请求，但是不具备扩展性，资源只有那么多
	- 每线程/每请求：进程换成线程，更轻量，但依然存在内存占用过多的问题。

Node使用事件驱动的方式，无须为每个请求创建额外的对应线程，可以省掉创建线程和摧毁线程的开销，同时由于线程较少，上下文的切换代价很低。

知名服务器Nginx，也摒弃了多线程的方式，采用了和Node相同的事件驱动，不同之处在于Nginx采用纯c编写，性能较高，但仅适合做Web服务器，用于反向代理或负载均衡等服务，在处理具体业务方面较为欠缺。

