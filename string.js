const regexLogin = /^.*[a-zа-я]+.*$/gmi;
const regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gm;

const SP = String.prototype;

SP.replaceall = function(replaceThis, withThis) {
  withThis = withThis.replace(/\$/g, "$$$$");
  return this.replace(new RegExp(replaceThis.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&])/g, "\\$&"), "g"), withThis);
};

SP.padLeft = function(max, c) {
  var self = this;
  var len = max - self.length;
  if (len < 0)
    return self;
  if (c === undefined)
    c = ' ';
  while (len--)
    self = c + self;
  return self;
};

SP.toDate = function() {
  let date = this;

  try {
    if (date.indexOf('T') > 0) {
      let arr = date.split('T')[0].split('-');
      let year = arr[0].toString().length > 2 ? arr[0] : '20' + arr[0].toString();
      return new Date(`${year}-${arr[1]}-${arr[2]}`);
    } else {
      let arr = date.split('.');
      let year = arr[2].toString().length > 2 ? arr[2] : '20' + arr[2].toString();
      // let newDate = new Date(`${year}-${arr[1]}-${arr[0]}`)
      // return noNumber ? newDate : +newDate;
      return new Date(`${year}-${arr[1]}-${arr[0]}`)
    }
  } catch (error) {
    return this
  }
};


function parseDateFormat(format, val) {

  var tmp = [];
  var tmpformat = [];
  var prev = '';
  var prevformat = '';
  var allowed = { y: 1, Y: 1, M: 1, m: 1, d: 1, D: 1, H: 1, s: 1, a: 1, w: 1 };

  for (var i = 0; i < format.length; i++) {

    var c = format[i];

    if (!allowed[c])
      continue;

    if (prev !== c) {
      prevformat && tmpformat.push(prevformat);
      prevformat = c;
      prev = c;
    } else
      prevformat += c;
  }

  prev = '';

  for (var i = 0; i < val.length; i++) {
    var code = val.charCodeAt(i);
    if (code >= 48 && code <= 57)
      prev += val[i];
  }

  prevformat && tmpformat.push(prevformat);

  var f = 0;
  for (var i = 0; i < tmpformat.length; i++) {
    var l = tmpformat[i].length;
    tmp.push(prev.substring(f, f + l));
    f += l;
  }

  var dt = {};

  for (var i = 0; i < tmpformat.length; i++) {
    var type = tmpformat[i];
    if (tmp[i])
      dt[type[0]] = +tmp[i];
  }

  var h = dt.h || dt.H;

  if (h != null) {
    var ampm = val.match(REG_TIME);
    if (ampm && ampm[0].toLowerCase() === 'pm')
      h += 12;
  }

  return new Date((dt.y || dt.Y) || 0, (dt.M || 1) - 1, dt.d || dt.D || 0, h || 0, dt.m || 0, dt.s || 0);
}

SP.parseDate = function(format) {

  if (format)
    return parseDateFormat(format, this);

  var self = this.trim();
  var lc = self.charCodeAt(self.length - 1);

  // Classic date
  if (lc === 41)
    return new Date(self);

  // JSON format
  if (lc === 90)
    return new Date(Date.parse(self));

  var arr = self.indexOf(' ') === -1 ? self.split('T') : self.split(' ');
  var index = arr[0].indexOf(':');
  var length = arr[0].length;

  if (index !== -1) {
    var tmp = arr[1];
    arr[1] = arr[0];
    arr[0] = tmp;
  }

  if (arr[0] === undefined)
    arr[0] = '';

  var noTime = arr[1] === undefined ? true : arr[1].length === 0;

  for (var i = 0; i < length; i++) {
    var c = arr[0].charCodeAt(i);
    if (c === 45 || c === 46 || (c > 47 && c < 58))
      continue;
    if (noTime)
      return new Date(self);
  }

  if (arr[1] === undefined)
    arr[1] = '00:00:00';

  var firstDay = arr[0].indexOf('-') === -1;

  var date = (arr[0] || '').split(firstDay ? '.' : '-');
  var time = (arr[1] || '').split(':');
  var parsed = [];

  if (date.length < 4 && time.length < 2)
    return new Date(self);

  index = (time[2] || '').indexOf('.');

  // milliseconds
  if (index !== -1) {
    time[3] = time[2].substring(index + 1);
    time[2] = time[2].substring(0, index);
  } else
    time[3] = '0';

  parsed.push(+date[firstDay ? 2 : 0]); // year
  parsed.push(+date[1]); // month
  parsed.push(+date[firstDay ? 0 : 2]); // day
  parsed.push(+time[0]); // hours
  parsed.push(+time[1]); // minutes
  parsed.push(+time[2]); // seconds
  parsed.push(+time[3]); // miliseconds

  var def = new Date();

  for (var i = 0, length = parsed.length; i < length; i++) {
    if (isNaN(parsed[i]))
      parsed[i] = 0;

    var value = parsed[i];
    if (value !== 0)
      continue;

    switch (i) {
      case 0:
        if (value <= 0)
          parsed[i] = def.getFullYear();
        break;
      case 1:
        if (value <= 0)
          parsed[i] = def.getMonth() + 1;
        break;
      case 2:
        if (value <= 0)
          parsed[i] = def.getDate();
        break;
    }
  }

  return new Date(parsed[0], parsed[1] - 1, parsed[2], parsed[3], parsed[4] - new Date().getTimezoneOffset(), parsed[5]);
};

SP.isNumber = function(isDecimal) {

  var self = this;
  var length = self.length;

  if (!length)
    return false;

  isDecimal = isDecimal || false;

  for (var i = 0; i < length; i++) {
    var ascii = self.charCodeAt(i);

    if (isDecimal) {
      if (ascii === 44 || ascii === 46) {
        isDecimal = false;
        continue;
      }
    }

    if (ascii < 48 || ascii > 57)
      return false;
  }

  return true;
};


SP.isBoolean = function() {
  var self = this.toLowerCase();
  return (self === 'true' || self === 'false') ? true : false;
};