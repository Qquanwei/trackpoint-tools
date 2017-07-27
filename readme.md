[![Build Status](https://travis-ci.org/Qquanwei/trackpoint-tools.svg?branch=master)](https://travis-ci.org/Qquanwei/trackpoint-tools)
[![npm](https://img.shields.io/npm/v/trackpoint-tools.svg)](https://www.npmjs.com/package/trackpoint-tools)


# 不能再让埋点继续侵入我们的逻辑了，我们需要做点什么

## trackpoint-tools

埋点逻辑往往是侵入性的，我们需要将这块代码拆分出去。
幸运的是es6,es7 给我们提供了可能。

```
npm i trackpoint-tools --save
```

使用trackpoint-tools你可能会用下面的方式写埋点信息, 完全不侵入原有逻辑

```
class SomeComponent {
  @track(composeWith(ms => (element) => ajax.post(url, {ms, name: element.name}), time))
  onClick (element) {
    return element.someMethod()
  }
}
```

## API 列表

* [before](#before)
* [after](#after)
* [once](#once)
* [track](#track)
* [nop](#nop)
* [composeWith](#composeWith)
* [evolve](#evolve)
* [time](#time)
* [identity](#identity)
* [createCounter](#createCounter)


所有的API都满足curryable, 所有的trackFn 都不会影响正常逻辑执行。

trackFn 指实际执行逻辑的跟踪函数， fn为普通的业务函数。

### <a name="before"></a> before(trackFn, fn)

```
import { before } from 'trackpoint-tools'

class SomeComponent {
    onClick = before((name) => console.log('seed some ', name))((name) => {
       // normal
       console.log('normal click ', name)
    })
}
```

onClick('me')

->

```
  seed some me
  normal click me
```

### <a name="after"></a>after(trackFn, fn)

```
import { after } from 'trackpoint-tools'

class SomeComponent {
  onClick = after(() => console.log('send after'))(() => {
    // normal
    console.log('normal click')
  })
}
```

onClick

->

```
    normal click
    send after

```


Using Promise

```
import { after } from 'trackpoint-tools'

class SomeComponent {
    onClick = after(() => console.log('send after'))(() => {
         return ajax.post(...).then(() => {
             console.log('normal click')
         })
    })
}
```

onClick

->

```
    normal click
    send after

```

### <a name="once"></a>once(fn)

same as lodash/once
[lodash/once](https://lodash.com/docs/4.17.4#once)


### <a name="track"></a>track(fn)

借助es7的decorator提案可以让我们以一种非常优雅的方式使用高阶函数， track用来将普通的class函数包装成decorator
使用起来非常简单

babel plugin: https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy

```
class SomeComponent {
  @track(before(() => console.log('before')))
  onClick () {
    console.log('click')
  }

  @track(after(() => console.log('after')))
  onClickAjax () {
    return ajax.get(...').then(() => {
        console.log('request done')
    })
  }
}
```

->

```
 before
 click
```

->

```
 request done
 after
```

### <a name="nop"></a> nop()

do nothing , empty function

### <a name="composeWith"></a> composeWith(convergeFn, [ops])

composeWith 类似after, 主要执行收集执行期间性能的操作, 并将参数传给普通trackFn更高一阶函数

ops会被展开为 `fn -> (...args) -> {}`, 执行顺序为从右到左，如果只有一项操作
可省略数组直接传入ops函数


```
class SomeComponent {
  @track(composeWith(m => (...args) => console.log(m + 'ms'), [time]))
  onClick () {
     ...
     ...
     return 0
  }
}
```

->

```
 somecomponent.onClick() // return 0 . output 100ms

```

### <a name="evolve"></a> evolve(evols)

evols是一个求值对象，value为实际求值操作(例如time, identity).
与composeWith结合使用.

注意，evolve中每个操作都有可能跟踪fn，但是fn只能执行一次，所以只有fn第一次执行才能进行有效的性能计算。
所以需要将性能计算写在evols的第一行(但其实顺序并不能保障 [ref](https://github.com/lodash/lodash/blob/npm/mapValues.js#L27))。

例如

```
const evols = {
  timeMs: trackpoint.time,
  value: trackpoint.identity
}

const trackFn = ({timeMs, value}) => (...args) => {
  console.log('timeMs ', timeMs)
  console.log('value ', value)
}

const evolve = trackpoint,evolve

class SomeComponent {
  @track(composeWith(trackFn, evolve(evols)))
  onClick() {
    // some sync operation, about 300ms
    return 101
  }
}
```

output->

```
timeMs 301
value 101
```

### <a name="time"></a> time(fn) -> (...) -> ms

测量普通函数与thenable函数执行时间, 单位毫秒

```
 time(() => console.log('out'))() // return 1
```

### <a name="identity"></a> identity(fn) -> (...) -> value

输出fn的执行结果

### <a name="createCounter"></a> createCounter() -> (fn) -> (...) -> value

创建一个计数器，可以用来统计fn函数被调用的次数

```
const trackFn = ({count}) => (...args) => console.log('count is:', count)
const fn = () => { console.log('why always click me?')}


const composeFn = composeWith(trackFn, evolve({count: createCounter()}))(fn)

composeFn()
// why always click me?
// count is 1
composeFn()
// why always click me?
// count is 2
...
...
```

## 关于 this

## TL;DR

推荐使用es7的decorator
大量流程控制虽然为高阶函数, 但实际调用的参数皆为用户输入的参数

## 贡献

欢迎fork, 有新的想法可以直接提PR

* build

`npm run build`

* test

`npm run test`
