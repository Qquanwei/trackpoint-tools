# 不能再让埋点继续侵入我们的逻辑了，我们需要做点什么

## trackpoint-tools

埋点逻辑往往是侵入性的，我们需要将这块代码拆分出去。
幸运的是es6,es7 给我们提供了可能。



## API 列表

所有的API都满足curryable, 所有的trackFn 都不会影响正常逻辑执行。

### before(trackFn, fn)

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

### after(trackFn, fn)

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

### once(fn)

same as lodash/once
[lodash/once](https://lodash.com/docs/4.17.4#once)

## 贡献

欢迎fork, 有新的想法可以直接提PR
