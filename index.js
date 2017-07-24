import {
    once,
    curry,
    isFunction,
    attempt,
    isError
} from 'lodash'

function isThenable (f) {
    return isFunction(f.then)
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

export once

export default {
    before,
    after,
    once
}
