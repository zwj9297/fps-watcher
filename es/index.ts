export interface FpsEvent {
  name: string,
  max?: number,
  min?: number
}

export type FpsCallback = (params: { name: string, fps: number }) => void;

const CHANGED_EVENT_KEY = 'changed';

const TIME_UNIT = 1000;

const [raf, cancelRaf] = (function() {
  if ('requestAnimationFrame' in globalThis) {
    return [globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame];
  } else {
    const requestAnimationFrame = (callback: Function) => setTimeout(callback, 17);
    const cancelAnimationFrame = (handle: number) => clearTimeout(handle);
    return [requestAnimationFrame, cancelAnimationFrame];
  }
})();

class FpsWatcher {
  private lastRecordedTime = 0;
  private prevFps = 0;
  private curFps = 0;
  private rafId: ReturnType<typeof raf> | null = null;
  private readonly events: Map<string, FpsEvent> = new Map();
  private readonly callbacks: Map<string, FpsCallback[]> = new Map();
  
  defineEvent(evt: FpsEvent) {
    this.events.set(evt.name, evt);
    if (!this.callbacks.has(evt.name)) {
      this.callbacks.set(evt.name, []);
    }
  }
  cancelDefineEvent(evt: FpsEvent) {
    this.events.delete(evt.name);
  }
  private loop(count = 0) {
    if (this.rafId) {
      this.clear();
    }
    this.rafId = raf(() => {
      count++;
      const curRecordedTime = performance.now();
      if (curRecordedTime - this.lastRecordedTime > TIME_UNIT) {
        this.prevFps = this.curFps;
        this.curFps = Math.round(count * TIME_UNIT / (curRecordedTime - this.lastRecordedTime));
        if (this.prevFps !== this.curFps) {
          this.emit(CHANGED_EVENT_KEY);
          this.events.forEach(({ min = 0, max = Infinity, name }) => {
            if (this.prevFps > max || this.prevFps <= min) {
              if (this.curFps <= max && this.curFps > min) {
                this.emit(name);
              }
            }
          });
        }
        this.lastRecordedTime = curRecordedTime;
        count = 0;
      }
      this.clear();
      this.loop(count);
    });
  }
  private clear() {
    if (this.rafId) {
      cancelRaf(this.rafId);
      this.rafId = null;
    }
  }
  watch() {
    this.lastRecordedTime = performance.now();
    this.prevFps = 0;
    this.curFps = 0;
    this.loop();
  }
  watchEnd() {
    this.clear();
  }
  on(name: string, callback: FpsCallback) {
    const callbacks = this.callbacks.get(name) ?? [];
    callbacks.push(callback);
    this.callbacks.set(name, callbacks);
  }
  off(name: string, callback: FpsCallback) {
    if (!this.callbacks.has(name)) {
      return;
    }
    const callbacks = this.callbacks.get(name)!;
    const index = callbacks.indexOf(callback);
    if (index < 0) {
      return;
    }
    callbacks.splice(index, 1);
  }
  private emit(name: string) {
    const fps = this.curFps;
    const callbacks = this.callbacks.get(name) ?? [];
    for (const callback of callbacks) {
      try {
        callback({ name, fps });
      } catch(err) {
        console.error(err);
      }
    }
  }
}

export { FpsWatcher as default };
