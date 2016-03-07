/*****
Public
*****/
const self = {
	out: require('./out.js'),
	run: require('./run.js')
};

self.list = {};

// Shuffle a list, or create a list of shuffled numbers
self.list.shuffle = function(list) {
	var newList;
  if (list.length == null && list >= 0) {
    newList = Array(list).fill(0).map(function(val, i) {
      return i;
    });
  } else {
		newList = list.slice();
	}
  for (var i = newList.length - 1; i > 0; i--) {
    var j = Math.random() * (i + 1) | 0;
		var tmp = newList[i];
		newList[i] = newList[j];
    newList[j] = tmp;
  }
  return newList;
};

// Divide a list into groups for tournaments
self.list.divide = function(list, num) {
	num = num || 2;
  var i = list.length;
  var groups = [];
  while (i >= num && num > 0) {
    groups.push(list.slice(i-num, i));
		i=i-num;
  }
  return groups;
};

// Makes deep copies of objects
self.deepCopy = function(obj) {
  var newObj, val;
  if (Array.isArray(obj)) {
    newObj = [];
    for (val of obj.keys()) {
      newObj[val] = self.deepCopy(obj[val]);
    }
  } else if (typeof obj === 'object') {
    newObj = {};
    for (val of Object.keys(obj)) {
      newObj[val] = self.deepCopy(obj[val]);
    }
  } else {
    newObj = obj;
  }
  return newObj;
};

// Takes an array of object keys and an object and returns a copy of the object containing only those keys
self.arrayObjectMap = function(arr, obj) {
	var newObj = {};
	arr.forEach(function(val) {
		newObj[val] = self.deepCopy(obj[val]);
	});
	return newObj;
};

/*****
Export
*****/
module.exports = self;
