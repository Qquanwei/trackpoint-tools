import curry from 'lodash/fp/curry'
import curryN from 'lodash/fp/curryN'
import attempt from 'lodash/fp/attempt'
import isError from 'lodash/fp/isError'
import isFunction from 'lodash/fp/isFunction'
import isArray from 'lodash/fp/isArray'
import _once from 'lodash/fp/once'
import propSet from 'lodash/fp/set'
import reduce from 'lodash/fp/reduce'
import memoize from 'lodash/fp/memoize'
import mapValues from 'lodash/fp/mapValues'

function isThenable (f) {
    return f && isFunction(f.then)
}

// eval trackFn before fn
export const before = curryN(2, (trackFn, fn) => function (...args) {
  try {
    isFunction(trackFn) && trackFn.apply(this, args)
  } catch(e) {
    console.error(e)
  }

  return fn.apply(this, args)
})

// eval trackFn after fn
export const after = curryN(2, (trackFn, fn) => function (...args) {
  const r = fn.apply(this, args)

  const self = this

  const evalF = () => {
    try {
      trackFn.apply(self, args)
    } catch (e) {
      console.error(e)
    }
  }

  if (isThenable(r)) {
    return r.then(rr => {
      evalF()
      return rr
    })
  }

  evalF()
  return r
})

// track by decorator
/* class SomeComponent {
 *     @track(before(() => console.log('hello, trackpoint')))
 *     onClick = () => {
 *         ...
 *     }
 * }*/
export const track = partical => (target, key, descriptor) => {
  if (!isFunction (partical)) {
    throw new Error('trackFn is not a function ' + partical)
  }
  const value = function (...args) {
    return partical.call(this, descriptor.value, this).apply(this, args)
  }
  if (descriptor.initializer) {
    return propSet('initializer', function() {
      const value = descriptor.initializer.apply(this);
      return function (...args) {
        return partical.call(this, value, this).apply(this, args);
      }
    }, descriptor);
  }
  return propSet('value', value, descriptor)
}

// composeWith convergeFn by ops[array]
export const composeWith = curry((convergeFn, ops) => {
  if (isFunction (ops)) {
    ops = [ops]
  }

  // type check
  if (!isFunction(convergeFn) ||!isArray(ops) ) {
    return console.error('args type incorrect, expect convergeFn is function and ops is array')
  }

  const compose = reduce((acc, i) => {
    if (!acc) {
      return acc || i
    }
    return i.call(null, acc)
  }, null)


  return curryN(1, (fn, target) => function (...args) {
    const memoizeFn = memoize(fn)
    const _r = convergeFn(
      compose(ops)
        .apply(this, [memoizeFn])
        .apply(this, args)
    ).apply(this, args)
    return memoizeFn.apply(this, args)
  })
})
export const createCounter = () => {
  let scopeCounter = 0
  return fn => function (...args) {
    fn.apply(this, args)
    scopeCounter = scopeCounter + 1
    return scopeCounter
  }
}
export const time = fn => function (...args) {
    const begin = +Date.now()
    const result = fn.apply(this, args)
    // result will be cached by memoize, so return new promise
    if (isThenable(result)) {
        return result.then(() => +Date.now() - begin)
    }
    return +Date.now() - begin
}

export const evolve = curry(evols => fn => function (...args) {
  const self = this
  const memoizeFn = memoize(fn)
  return mapValues((value) => {
    return value(memoizeFn).apply(self, args)
  }, evols)
})

export const identity = curry(fn => function (...args) {
  return fn.apply(this, args)
})

// do work nothing
export const nop = () => {}

export const once = _once

export default {
  before,
  after,
  track,
  nop,
  once,
  composeWith,
  time,
  evolve,
  identity,
  createCounter
}
