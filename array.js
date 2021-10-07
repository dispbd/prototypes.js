const AP = Array.prototype;

AP.toObject = function(name, remove = true) {

  var self = this;
  var obj = {};

  for (var i = 0; i < self.length; i++) {
    var item = self[i];
    if (name) {
      obj[item[name]] = item;
      if (remove) delete obj[item[name]][name];
    } else
      obj[item] = true;
  }

  return obj;
};

AP.remove = function(cb, value) {

  var self = this;
  var arr = [];
  var isFN = typeof(cb) === 'function';
  var isV = value !== undefined;

  for (var i = 0, length = self.length; i < length; i++) {

    if (isFN) {
      !cb.call(self, self[i], i) && arr.push(self[i]);
      continue;
    }

    if (isV) {
      self[i] && self[i][cb] !== value && arr.push(self[i]);
      continue;
    }

    self[i] !== cb && arr.push(self[i]);
  }
  return arr;
};

AP.simple = function(property, child) {
  var self = this;
  var result = [];

  if (property)
    for (var i = 0; i < self.length; i++) {
      let value = self[i];
      if (child)
        for (var j = 0; j < value[property].length; j++) {
          let value_child = value[property][j];
          result.push(value_child[child]);
        }
      else
        result.push(value[property]);
    }

  return result;
};

/**
 * Take items from array
 * @param {Number} count
 * @return {Array}
 */
AP.take = function(count) {
  var arr = [];
  var self = this;
  for (var i = 0; i < self.length; i++) {
    arr.push(self[i]);
    if (arr.length >= count)
      return arr;
  }
  return arr;
};

/**
 * First item in array
 * @param {Object} def Default value.
 * @return {Object}
 */
AP.first = function(def) {
  var item = this[0];
  return item === undefined ? def : item;
};

/**
 * Last item in array
 * @param {Object} def Default value.
 * @return {Object}
 */
AP.last = function(def) {
  var item = this[this.length - 1];
  return item === undefined ? def : item;
};

/**
 * Find items in Array
 * @param {Function(item, index) or String/Object} cb
 * @param {Object} value Optional.
 * @return {Array}
 */
AP.findAll = function(cb, value) {

  var self = this;
  var selected = [];
  var isFN = typeof(cb) === 'function';
  var isV = value !== undefined;

  for (var i = 0, length = self.length; i < length; i++) {

    if (isFN) {
      cb.call(self, self[i], i) && selected.push(self[i]);
      continue;
    }

    if (isV) {
      self[i] && self[i][cb] === value && selected.push(self[i]);
      continue;
    }

    self[i] === cb && selected.push(self[i]);
  }

  return selected;
};

AP.findValue = function(cb, value, path, def) {
  var index = this.findIndex(cb, value);
  if (index !== -1) {
    var item = this[index][path];
    return item == null ? def : item;
  }
  return def;
};

AP.findItem = function(cb, value) {
  var self = this;
  var index = self.findIndex(cb, value);
  if (index === -1)
    return null;
  return self[index];
};

AP.findIndex = function(cb, value) {

  var self = this;
  var isFN = typeof(cb) === 'function';
  var isV = value !== undefined;

  for (var i = 0, length = self.length; i < length; i++) {

    if (isFN) {
      if (cb.call(self, self[i], i))
        return i;
      continue;
    }

    if (isV) {
      if (self[i] && self[i][cb] === value)
        return i;
      continue;
    }

    if (self[i] === cb)
      return i;
  }

  return -1;
};
AP.random = function(item) {
  if (item)
    return this.length > 1 ? this[exports.random(this.length - 1)] : this[0];
  for (var i = this.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
  return this;
};

AP.limit = function(max, fn, callback, index) {

  if (index === undefined)
    index = 0;

  var current = [];
  var self = this;
  var length = index + max;

  for (var i = index; i < length; i++) {
    var item = self[i];

    if (item !== undefined) {
      current.push(item);
      continue;
    }

    if (!current.length) {
      callback && callback();
      return self;
    }

    fn(current, () => callback && callback(), index, index + max);
    return self;
  }

  if (!current.length) {
    callback && callback();
    return self;
  }

  fn(current, function() {
    if (length < self.length)
      self.limit(max, fn, callback, length);
    else
      callback && callback();
  }, index, index + max);

  return self;
};