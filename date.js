const regexpDATE = /(\d{1,2}\.\d{1,2}\.\d{4})|(\d{4}-\d{1,2}-\d{1,2})|(\d{1,2}:\d{1,2}(:\d{1,2})?)/g;
const regexpDATEFORMAT = /YYYY|yyyy|YY|yy|MMMM|MMM|MM|M|dddd|DDDD|DDD|ddd|DD|dd|D|d|HH|H|hh|h|mm|m|ss|s|a|ww|w/g;
const datetimeformat = {};

window.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
window.DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
window.pmam = function(value) {
  return value >= 12 ? value - 12 : value;
};

const DP = Date.prototype;

DP.nextMonth = function() {
  let dt = new Date(this);
  dt.setDate(1);
  dt.setDate(dt.getDate() + 32);
  dt.setDate(1);

  return dt;
};

DP.setTimeZone = function(timezone) {

  var dt = new Date(this.toLocaleString('en-US', { timeZone: timezone }));

  var offset = dt + '';
  var index = offset.indexOf('GMT');
  var op = offset.substring(index + 3, index + 4);
  var count = offset.substring(index + 4, index + 9);
  var h = +count.substring(0, 2);
  var m = +count.substring(2);

  if (op === '+') {
    h && dt.setHours(dt.getHours() + h);
    m && dt.setMinutes(dt.getMinutes() + m);
  } else {
    h && dt.setHours(dt.getHours() - h);
    m && dt.setMinutes(dt.getMinutes() - m);
  }

  return dt;
};

/**
 * Date difference
 * @param  {Date/Number/String} date Optional.
 * @param  {String} type Date type: minutes, seconds, hours, days, months, years
 * @return {Number}
 */
DP.diff = function(date, type) {

  if (arguments.length === 1) {
    type = date;
    date = Date.now();
  } else {
    var to = typeof(date);
    if (to === 'string')
      date = Date.parse(date);
    else if (window.isDate(date))
      date = date.getTime();
  }

  var r = this.getTime() - date;

  switch (type) {
    case 's':
    case 'ss':
    case 'second':
    case 'seconds':
      return Math.ceil(r / 1000);
    case 'm':
    case 'mm':
    case 'minute':
    case 'minutes':
      return Math.ceil((r / 1000) / 60);
    case 'h':
    case 'hh':
    case 'hour':
    case 'hours':
      return Math.ceil(((r / 1000) / 60) / 60);
    case 'd':
    case 'dd':
    case 'day':
    case 'days':
      return Math.ceil((((r / 1000) / 60) / 60) / 24);
    case 'M':
    case 'MM':
    case 'month':
    case 'months':
      // avg: 28 days per month
      return Math.ceil((((r / 1000) / 60) / 60) / (24 * 28));

    case 'y':
    case 'yyyy':
    case 'year':
    case 'years':
      // avg: 28 days per month
      return Math.ceil((((r / 1000) / 60) / 60) / (24 * 28 * 12));
  }

  return NaN;
};

DP.add = function(type, value) {

  var self = this;

  if (type.constructor === Number)
    return new Date(self.getTime() + (type - type % 1));

  if (value === undefined) {
    var arr = type.split(' ');
    type = arr[1];
    value = window.parseInt(arr[0]);
  }

  var dt = new Date(self.getTime());

  switch (type) {
    case 's':
    case 'ss':
    case 'sec':
    case 'second':
    case 'seconds':
      dt.setUTCSeconds(dt.getUTCSeconds() + value);
      return dt;
    case 'm':
    case 'mm':
    case 'minute':
    case 'min':
    case 'minutes':
      dt.setUTCMinutes(dt.getUTCMinutes() + value);
      return dt;
    case 'h':
    case 'hh':
    case 'hour':
    case 'hours':
      dt.setUTCHours(dt.getUTCHours() + value);
      return dt;
    case 'd':
    case 'dd':
    case 'day':
    case 'days':
      dt.setUTCDate(dt.getUTCDate() + value);
      return dt;
    case 'w':
    case 'ww':
    case 'week':
    case 'weeks':
      dt.setUTCDate(dt.getUTCDate() + (value * 7));
      return dt;
    case 'M':
    case 'MM':
    case 'month':
    case 'months':
      dt.setUTCMonth(dt.getUTCMonth() + value);
      return dt;
    case 'y':
    case 'yyyy':
    case 'year':
    case 'years':
      dt.setUTCFullYear(dt.getUTCFullYear() + value);
      return dt;
  }
  return dt;
};

DP.extend = function(date) {
  var dt = new Date(this);
  var match = date.match(regexpDATE);

  if (!match)
    return dt;

  for (var i = 0, length = match.length; i < length; i++) {
    var m = match[i];
    var arr, tmp;

    if (m.indexOf(':') !== -1) {

      arr = m.split(':');
      tmp = +arr[0];
      tmp >= 0 && dt.setUTCHours(tmp);

      if (arr[1]) {
        tmp = +arr[1];
        tmp >= 0 && dt.setUTCMinutes(tmp);
      }

      if (arr[2]) {
        tmp = +arr[2];
        tmp >= 0 && dt.setUTCSeconds(tmp);
      }

      continue;
    }

    if (m.indexOf('-') !== -1) {
      arr = m.split('-');

      tmp = +arr[0];
      tmp && dt.setUTCFullYear(tmp);

      if (arr[1]) {
        tmp = +arr[1];
        tmp >= 0 && dt.setUTCMonth(tmp - 1);
      }

      if (arr[2]) {
        tmp = +arr[2];
        tmp >= 0 && dt.setUTCDate(tmp);
      }

      continue;
    }

    if (m.indexOf('.') !== -1) {
      arr = m.split('.');

      if (arr[2]) {
        tmp = +arr[2];
        !isNaN(tmp) && dt.setUTCFullYear(tmp);
      }

      if (arr[1]) {
        tmp = +arr[1];
        !isNaN(tmp) && dt.setUTCMonth(tmp - 1);
      }

      tmp = +arr[0];
      !isNaN(tmp) && dt.setUTCDate(tmp);

      continue;
    }
  }

  return dt;
};

/**
 * Format datetime
 * @param {String} format
 * @return {String}
 */
DP.format = function(format, resource) {

  if (!format)
    return this.getUTCFullYear() + '-' + (this.getUTCMonth() + 1).toString().padLeft(2, '0') + '-' + this.getUTCDate().toString().padLeft(2, '0') + 'T' + this.getUTCHours().toString().padLeft(2, '0') + ':' + this.getUTCMinutes().toString().padLeft(2, '0') + ':' + this.getUTCSeconds().toString().padLeft(2, '0') + '.' + this.getUTCMilliseconds().toString().padLeft(3, '0') + 'Z';

  if (datetimeformat[format])
    return datetimeformat[format](this, resource);

  var key = format;
  var half = false;

  if (format && format[0] === '!') {
    half = true;
    format = format.substring(1);
  }

  var beg = '\'+';
  var end = '+\'';
  var before = [];

  var ismm = false;
  var isdd = false;
  var isww = false;

  format = format.replace(regexpDATEFORMAT, function(key) {
    switch (key) {
      case 'yyyy':
      case 'YYYY':
        return beg + 'd.getFullYear()' + end;
      case 'yy':
      case 'YY':
        return beg + 'd.getFullYear().toString().substring(2)' + end;
      case 'MMM':
        ismm = true;
        return beg + '(mm).substring(0, 3)' + end;
      case 'MMMM':
        ismm = true;
        return beg + '(mm)' + end;
      case 'MM':
        return beg + '(d.getMonth() + 1).toString().padLeft(2, \'0\')' + end;
      case 'M':
        return beg + '(d.getMonth() + 1)' + end;
      case 'ddd':
      case 'DDD':
        isdd = true;
        return beg + '(dd).substring(0, 2).toUpperCase()' + end;
      case 'dddd':
      case 'DDDD':
        isdd = true;
        return beg + '(dd)' + end;
      case 'dd':
      case 'DD':
        return beg + 'd.getDate().toString().padLeft(2, \'0\')' + end;
      case 'd':
      case 'D':
        return beg + 'd.getDate()' + end;
      case 'HH':
      case 'hh':
        return beg + (half ? 'window.pmam(d.getHours()).toString().padLeft(2, \'0\')' : 'd.getHours().toString().padLeft(2, \'0\')') + end;
      case 'H':
      case 'h':
        return beg + (half ? 'window(d.getHours())' : 'd.getHours()') + end;
      case 'mm':
        return beg + 'd.getMinutes().toString().padLeft(2, \'0\')' + end;
      case 'm':
        return beg + 'd.getMinutes()' + end;
      case 'ss':
        return beg + 'd.getSeconds().toString().padLeft(2, \'0\')' + end;
      case 's':
        return beg + 'd.getSeconds()' + end;
      case 'w':
      case 'ww':
        isww = true;
        return beg + (key === 'ww' ? 'ww.toString().padLeft(2, \'0\')' : 'ww') + end;
      case 'a':
        var b = "'PM':'AM'";
        return beg + '(d.getHours() >= 12 ? ' + b + ')' + end;
    }
  });

  ismm && before.push('var mm = window.MONTHS[d.getMonth()];');
  isdd && before.push('var dd = window.DAYS[d.getDay()];');
  isww && before.push('var ww = new Date(+d);ww.setHours(0, 0, 0);ww.setDate(ww.getDate() + 4 - (ww.getDay() || 7));ww = Math.ceil((((ww - new Date(ww.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);');

  datetimeformat[key] = new Function('d', 'resource', before.join('\n') + 'return \'' + format + '\';');
  return datetimeformat[key](this, resource);
};

DP.toUTC = function(ticks) {
  var dt = this.getTime() + this.getTimezoneOffset() * 60000;
  return ticks ? dt : new Date(dt);
};

// +v2.2.0 parses JSON dates as dates and this is the fallback for backward compatibility
DP.parseDate = function() {
  return this;
};