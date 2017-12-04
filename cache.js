function Cache(capacity, aging) {
  this.capacity = capacity || Number.MAX_VALUE;
  this.aging = aging || this.remove;

  this.hash = {};
  this.length = 0;
  this.head = {};
  this.head.p = this.head.n = this.head;

  function link(n, p) {
    p.n = n; n.p = p;
  }
  function refresh(head, e) {
    if (e != head.n) {
      link(e.n, e.p);
      link(head.n, e);
      link(e, head);
    }
  }
  this.get = function(k) {
    var entry = this.hash[k];
    if (!entry) return null;
    refresh(this.head, entry);
    return entry.v;
  };
  this.put = function(k, v) {
    if (v === undefined) return this;
    var entry = this.hash[k];
    if (!entry) {
      entry = this.head.n.p = this.hash[k] = {k: k, v: v, p: this.head, n: this.head.n};
      this.head.n = entry;
      if (this.head.p == this.head) {this.head.p = entry;}
      if (++this.length > this.capacity) this.aging(this.head.p.k);
      return this;
    }
    refresh(this.head, entry);
    entry.v = v;
    return this;
  };
  this.remove = function(k) {
    var entry = this.hash[k];
    if (!entry) return this;
    link(entry.n, entry.p);
    delete this.hash[k];
    --this.length;
    return this;
  };
  this.removeAll = function() {
    this.hash = {};
    this.length = 0;
    this.head = {};
    this.head.p = this.head.n = this.head;
    return this;
  };
  this.foreach = function(cb) {
    var entry = this.head.n;
    while (entry != this.head) {
      cb(entry.k, entry.v);
      entry = entry.n;
    }
    return {capacity: this.capacity, length: this.length};
  };
};

module.exports = Cache;

/* 
Usage:

  var cache = new Cache(5, k=>{console.log('cache aging: ', k, cache.get(k)); cache.remove(k);});
  cache.put('1', Date.now());
  cache.put('2', Date.now());
  cache.put('3', Date.now());
  cache.put('4', Date.now());
  cache.put('5', Date.now());
  console.log(cache.get('1'));
  console.log(cache.get('2'));
  console.log(cache.get('3'));
  cache.put('6', Date.now());
  cache.foreach((k, v)=>{console.log(k, v);})
*/