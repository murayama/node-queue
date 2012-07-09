# node.jsでredisを使用したqueue処理

## create client

```javascript
var q = MyQueue.createQueue('queue_name', 6379, '127.0.0.1');
```

or

```javascript
var rings = {'localhost:6379':1, 'localhost:6380':1, 'localhost:6381':1};
var q = MyQueue.shard(key, rings).createQueue('queue_name');
```

## enqueue 

```javascript
q.enqueue({data:'test'});
q.push({data:'test'});
```

## dequeue  

```javascript
q.dequeue(function (err, data) {
  //   
});
```

