# fps-watcher

一个轻量的用于监控浏览器 fps 的工具，可以简单地设置 fps 阈值和告警机制。

## 基本用法

### 实时监控 fps 的变化

```typescript
import FpsWatcher, { FpsCallback } from '@zwj9297/fps-watcher';

const watcher = new FpsWatcher();

const onFpsChanged: FpsCallback = ({ fps }) => {
  if (fps < 30) {
    /** do something */
  }
};
watcher.on('changed', onFpsChanged);

// 开始监控
watcher.watch();

setTimeout(() => {
  // 停止监控
  watcher.watchEnd();
}, 5000);
```

### 设置 fps 告警阈值

```typescript
import FpsWatcher, { FpsEvent, FpsCallback } from '@zwj9297/fps-watcher';

const watcher = new FpsWatcher();

// 设置告警阈值
const smoothEvent: FpsEvent = { name: 'smooth', min: 30 };
watcher.defineEvent(smoothEvent);

const LagEvent: FpsEvent = { name: 'lag', min: 10, max: 30 };
watcher.defineEvent(LagEvent);

const LaggiestEvent: FpsEvent = { name: 'laggiest', max: 10 };
watcher.defineEvent(LaggiestEvent);

// 注册告警回调函数
const onSmooth: FpsCallback = ({ fps }) => {
  /** do something after restore smoothness */
};
watcher.on(smoothEvent.name, onSmooth);

const onLag: FpsCallback = ({ fps }) => {
  /** do something for lag */
};
watcher.on(LagEvent.name, onLag);

const onLaggiest: FpsCallback = ({ fps }) => {
  /** do something for laggiest */
};
watcher.on(LaggiestEvent.name, onLaggiest);
```
