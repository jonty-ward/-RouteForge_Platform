import type { Application } from 'pixi.js';

export type EasingFunction = (t: number) => number;

export const easeLinear: EasingFunction = (t) => t;
export const easeInOutQuad: EasingFunction = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOutCubic: EasingFunction = (t) => 1 - Math.pow(1 - t, 3);

export interface TweenOptions<T extends object> {
  to: Partial<Record<keyof T, number>>;
  duration: number;
  easing?: EasingFunction;
  onUpdate?: (target: T, progress: number) => void;
  onComplete?: () => void;
}

export interface TweenControl {
  stop: () => void;
  isRunning: boolean;
}

export function createTween<T extends object>(
  app: Application,
  target: T,
  options: TweenOptions<T>,
): TweenControl {
  const easing = options.easing ?? easeLinear;
  const duration = Math.max(1, options.duration);
  const to = options.to as Partial<Record<keyof T, number>>;
  const from: Partial<Record<keyof T, number>> = {};

  const keys = Object.keys(to) as Array<keyof T>;
  keys.forEach((key) => {
    const value = target[key];
    if (typeof value === 'number') {
      from[key] = value;
    }
  });

  let elapsed = 0;
  let running = true;

  const tick = () => {
    if (!running) return;

    elapsed += app.ticker.deltaMS;
    const progress = Math.min(1, elapsed / duration);
    const eased = easing(progress);

    keys.forEach((key) => {
      const start = from[key];
      const end = to[key];
      if (typeof start === 'number' && typeof end === 'number') {
        const current = start + (end - start) * eased;
        (target as any)[key] = current;
      }
    });

    options.onUpdate?.(target, progress);

    if (progress >= 1) {
      stop();
      options.onComplete?.();
    }
  };

  const stop = () => {
    if (!running) return;
    running = false;
    app.ticker.remove(tick);
  };

  app.ticker.add(tick);

  return {
    stop,
    get isRunning() {
      return running;
    },
  };
}
