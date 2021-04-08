"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.once = exports.nop = exports.identity = exports.evolve = exports.time = exports.createCounter = exports.composeWith = exports.track = exports.after = exports.before = void 0;

var _curry = _interopRequireDefault(require("lodash/fp/curry"));

var _curryN = _interopRequireDefault(require("lodash/fp/curryN"));

var _attempt = _interopRequireDefault(require("lodash/fp/attempt"));

var _isError = _interopRequireDefault(require("lodash/fp/isError"));

var _isFunction = _interopRequireDefault(require("lodash/fp/isFunction"));

var _isArray = _interopRequireDefault(require("lodash/fp/isArray"));

var _once2 = _interopRequireDefault(require("lodash/fp/once"));

var _set = _interopRequireDefault(require("lodash/fp/set"));

var _reduce = _interopRequireDefault(require("lodash/fp/reduce"));

var _memoize = _interopRequireDefault(require("lodash/fp/memoize"));

var _mapValues = _interopRequireDefault(require("lodash/fp/mapValues"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function isThenable(f) {
  return f && (0, _isFunction["default"])(f.then);
} // eval trackFn before fn


var before = (0, _curryN["default"])(2, function (trackFn, fn) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    try {
      (0, _isFunction["default"])(trackFn) && trackFn.apply(this, args);
    } catch (e) {
      console.error(e);
    }

    return fn.apply(this, args);
  };
}); // eval trackFn after fn

exports.before = before;
var after = (0, _curryN["default"])(2, function (trackFn, fn) {
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var r = fn.apply(this, args);
    var self = this;

    var evalF = function evalF() {
      try {
        trackFn.apply(self, args);
      } catch (e) {
        console.error(e);
      }
    };

    if (isThenable(r)) {
      return r.then(function (rr) {
        evalF();
        return rr;
      });
    }

    evalF();
    return r;
  };
}); // track by decorator

/* class SomeComponent {
 *     @track(before(() => console.log('hello, trackpoint')))
 *     onClick = () => {
 *         ...
 *     }
 * }*/

exports.after = after;

var track = function track(partical) {
  return function (target, key, descriptor) {
    if (!(0, _isFunction["default"])(partical)) {
      throw new Error('trackFn is not a function ' + partical);
    }

    var value = function value() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return partical.call(this, descriptor.value, this).apply(this, args);
    };

    if (descriptor.initializer) {
      return (0, _set["default"])('initializer', function () {
        var value = descriptor.initializer.apply(this);
        return function () {
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          return partical.call(this, value, this).apply(this, args);
        };
      }, descriptor);
    }

    return (0, _set["default"])('value', value, descriptor);
  };
}; // composeWith convergeFn by ops[array]


exports.track = track;
var composeWith = (0, _curry["default"])(function (convergeFn, ops) {
  if ((0, _isFunction["default"])(ops)) {
    ops = [ops];
  } // type check


  if (!(0, _isFunction["default"])(convergeFn) || !(0, _isArray["default"])(ops)) {
    return console.error('args type incorrect, expect convergeFn is function and ops is array');
  }

  var compose = (0, _reduce["default"])(function (acc, i) {
    if (!acc) {
      return acc || i;
    }

    return i.call(null, acc);
  }, null);
  return (0, _curryN["default"])(1, function (fn, target) {
    return function () {
      var memoizeFn = (0, _memoize["default"])(fn);

      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      var _r = convergeFn(compose(ops).apply(this, [memoizeFn]).apply(this, args)).apply(this, args);

      return memoizeFn.apply(this, args);
    };
  });
});
exports.composeWith = composeWith;

var createCounter = function createCounter() {
  var scopeCounter = 0;
  return function (fn) {
    return function () {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      fn.apply(this, args);
      scopeCounter = scopeCounter + 1;
      return scopeCounter;
    };
  };
};

exports.createCounter = createCounter;

var time = function time(fn) {
  return function () {
    var begin = +Date.now();

    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    var result = fn.apply(this, args); // result will be cached by memoize, so return new promise

    if (isThenable(result)) {
      return result.then(function () {
        return +Date.now() - begin;
      });
    }

    return +Date.now() - begin;
  };
};

exports.time = time;
var evolve = (0, _curry["default"])(function (evols) {
  return function (fn) {
    return function () {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }

      var self = this;
      var memoizeFn = (0, _memoize["default"])(fn);
      return (0, _mapValues["default"])(function (value) {
        return value(memoizeFn).apply(self, args);
      }, evols);
    };
  };
});
exports.evolve = evolve;
var identity = (0, _curry["default"])(function (fn) {
  return function () {
    for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    return fn.apply(this, args);
  };
}); // do work nothing

exports.identity = identity;

var nop = function nop() {};

exports.nop = nop;
var once = _once2["default"];
exports.once = once;
var _default = {
  before: before,
  after: after,
  track: track,
  nop: nop,
  once: once,
  composeWith: composeWith,
  time: time,
  evolve: evolve,
  identity: identity,
  createCounter: createCounter
};
exports["default"] = _default;
