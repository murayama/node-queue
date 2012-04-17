var redis = require('redis');

exports = module.exports = MyQueue;

function MyQueue(name,redis) {
  this.queue_name = "queue:" + name;
  this.lock_queue_name = "queue:" + name + ":lock";
  this.error_queue_name = "queue:" + name + ":error";
  this.client = redis;
}

MyQueue.prototype.push = function(message) {
  var data = JSON.stringify({timestamp: +new Date(), pid: process.pid, message: message});
  return this.client.lpush(this.queue_name, data);
}
MyQueue.prototype.enqueue = MyQueue.prototype.push;

MyQueue.prototype.pop = function(fn) {
  var self = this;
  this.client.rpoplpush(this.queue_name, this.lock_queue_name,function(err,data) {
    if (err) {
      return false;
    }
    var json = JSON.parse(data);
    var result = fn(json);

    if (!result) {
      self.client.lpush(self.error_queue_name,data);
    }
    self.client.lrem(self.lock_queue_name, 1, data);
  });
}
MyQueue.prototype.dequeue = MyQueue.prototype.pop;

MyQueue.createQueue = function(name,port,host) {

  var redis_client;
  if (this.redis_client) {
    redis_client = this.redis_client; 
  } else {
    redis_client = redis.createClient(port,host);
  }
  var q = new MyQueue(name,redis_client);
  return q;
}

MyQueue.shard = function(key,rings) {
  var hash_ring = new (require('hash_ring'))(rings);
  var node = hash_ring.getNode(key).split(':');
  var host = node[0];
  var port = node[1];
  this.redis_client = redis.createClient(port,host);
  return this;
}
