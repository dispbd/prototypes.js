const NP = Number.prototype;

NP.round = function(decimals) {
  var val = Number(Math.round(Math.abs(this) + 'e' + decimals) + 'e-' + decimals);
  return this < 0 ? -val : val;
}

NP.round2 = function(precision) {
  var m = Math.pow(10, precision) || 1;
  return Math.round(this * m) / m;
};

NP.between = function(condition, otherwise) {

  var val = this;

  for (var key in condition) {

    var arr = key.split('-');

    var a = arr[0] ? +arr[0] : null;
    var b = arr[1] ? +arr[1] : null;

    if (a != null && b !== null) {
      if (val >= a && val <= b)
        return condition[key];
    } else if (a != null) {
      if (val >= a)
        return condition[key];
    } else if (b != null)
      if (val <= b)
        return condition[key];
  }

  return otherwise;
};


NP.floor = function(decimals) {
  return Math.floor(this * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

NP.fixed = function(decimals) {
  return +this.toFixed(decimals);
};

NP.padLeft = function(max, c) {
  return this.toString().padLeft(max, c || '0');
};

NP.padRight = function(max, c) {
  return this.toString().padRight(max, c || '0');
};

NP.currency = function(currency, a, b, c) {
  var curr = DEF.currencies[currency || 'default'];
  return curr ? curr(this, a, b, c) : this.format(2);
};

NP.format = function(decimals, separator, separatorDecimal) {

  var self = this;
  var num = self.toString();
  var dec = '';
  var output = '';
  var minus = num[0] === '-' ? '-' : '';
  if (minus)
    num = num.substring(1);

  var index = num.indexOf('.');

  if (typeof(decimals) === 'string') {
    var tmp = separator;
    separator = decimals;
    decimals = tmp;
  }

  if (separator === undefined)
    separator = ' ';

  if (index !== -1) {
    dec = num.substring(index + 1);
    num = num.substring(0, index);
  }

  index = -1;
  for (var i = num.length - 1; i >= 0; i--) {
    index++;
    if (index > 0 && index % 3 === 0)
      output = separator + output;
    output = num[i] + output;
  }

  if (decimals || dec.length) {
    if (dec.length > decimals)
      dec = dec.substring(0, decimals || 0);
    else
      dec = dec.padRight(decimals || 0, '0');
  }

  if (dec.length && separatorDecimal === undefined)
    separatorDecimal = separator === '.' ? ',' : '.';

  return minus + output + (dec.length ? separatorDecimal + dec : '');
};

NP.parseDate = function(plus) {
  return new Date(this + (plus || 0));
};