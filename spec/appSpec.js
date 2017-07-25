import tp from '..'
import isFunction from 'lodash/isFunction'

describe('trackpoint nop', function () {
    it ('should be a function', function () {
        const nop = tp.nop
        expect(isFunction(nop)).toBe(true)
    })

    it ('should work well', function () {
        const nop = tp.nop
        expect(nop).not.toThrow()
    })
})

describe('trackpoint before', function () {
    let soldier
    let pushSoldier

    beforeEach(function () {
        soldier = []
        pushSoldier = n => () => soldier.push(n)
    })
    it ('should curryable', function () {
        expect(isFunction(tp.before(tp.nop))).toBe(true)
    })

    it ('should trackFn eval before fn', function () {
        tp.before(pushSoldier('trackFn'), pushSoldier('fn'))()
        expect(soldier).toEqual(['trackFn', 'fn'])
    })

    it ('should ignore trackFn throw', function () {
        const beforeFn = tp.before(() => {throw new Error('stub throw')}, pushSoldier('fn'))
        expect(beforeFn).not.toThrow()
        expect(soldier).toEqual(['fn'])
    })
})

describe('trackpoint after', function () {
    let soldier
    let pushSoldier
    beforeEach(function () {
        soldier = []
        pushSoldier = n => () => soldier.push(n)
    })

    it ('should curryable', function () {
        expect(isFunction(tp.after(tp.nop))).toBe(true)
    })

    it ('should trackFn eval after fn', function () {
        tp.after(pushSoldier('trackFn'), pushSoldier('fn'))()
        expect(soldier).toEqual(['fn', 'trackFn'])
    })

    it ('should after thenable object', function (done) {
        const thenableFn = (n) => () => new Promise(function(resolve) {
            setTimeout(() => resolve(pushSoldier(n)()),300)
        })

        tp.after(pushSoldier('trackFn'), thenableFn('fn'))().then(() => {
            expect(soldier).toEqual(['fn', 'trackFn'])
        }).then(done)
    })

    it ('should ignore trackFn throw', function () {
        const afterFn = tp.after(() => {throw new Error('stub throw')}, pushSoldier('fn'))
        expect(afterFn).not.toThrow()
        expect(soldier).toEqual(['fn'])
    })
})

describe('trackpoint track', function () {
    let soldier
    let pushSoldier
    beforeEach(function () {
        soldier = []
        pushSoldier = n => () => soldier.push(n)
    })

    it ('should can as decorator with class method and work well', function () {
        class SomeComponent {
            @tp.track(tp.before(pushSoldier('trackFn')))
            onClick () {
                pushSoldier('fn')()
            }
        }

        const component = new SomeComponent
        expect(component.onClick).not.toThrow()
        expect(soldier).toEqual(['trackFn','fn'])
    })
})
