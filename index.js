import {
    once,
    curry,
    isFunction,
    attempt,
    isError
} from 'lodash'
import propSet from 'lodash/fp/set'

function isThenable (f) {
    return f && isFunction(f.then)
}
function evalWithNoCatch(fn, args) {
    const _r = attempt(fn, args)
    if (isError(_r)) {
        console.error(_r)
    }
    return _r
}

// eval trackFn before fn
export const before = curry((trackFn, fn) => (...args) => {
    isFunction(trackFn) && evalWithNoCatch(trackFn, args)
    return fn.apply(this, args)
})

// eval trackFn after fn
export const after = curry((trackFn, fn) => (...args) => {
    const r = fn.apply(this, args)
    if (isThenable(r)) {
        return r.then(rr => {
            evalWithNoCatch(trackFn, args)
            return rr
        })
    }
    evalWithNoCatch(trackFn, args)
    return r
})

// track by decorator
/* class SomeComponent {
 *     @track(before(() => console.log('hello, trackpoint')))
 *     onClick = () => {
 *         ...
 *     }
 * }*/
export const track = curry(partical => (target, key, descriptor) => {
    return propSet('value', partical(descriptor.value), descriptor)
})

// do work nothing
export const nop = () => {}

export default {
    before,
    after,
    track,
    nop
}
