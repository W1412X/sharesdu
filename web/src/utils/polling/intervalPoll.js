/**
 * 可复用定时轮询，便于与业务 tick 解耦、统一启停与清理。
 */
export function createIntervalPoll({
  intervalMs,
  tick,
  immediate = true,
  shouldRun = () => true,
} = {}) {
  let timer = null;

  const run = async () => {
    if (!shouldRun()) return;
    try {
      await tick();
    } catch (e) {
      console.warn('[intervalPoll] tick', e);
    }
  };

  return {
    start() {
      this.stop();
      if (immediate) {
        void run();
      }
      if (!intervalMs || intervalMs < 0) {
        return;
      }
      timer = setInterval(() => {
        void run();
      }, intervalMs);
    },
    stop() {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}
