import { useEffect, useRef, useState } from 'react';

/** prototype `countTo`: 900 ms, ease-out cubic */
export const COUNT_MS = 900;

export interface CountToOptions {
  reduced: boolean;
  /** changing it counts again from 0 (e.g. each time the screen comes into view) */
  replay?: unknown;
  /** the first value counts up from 0 (default) or shows at once */
  fromZero?: boolean;
}

/**
 * A number that counts to `target` (prototype `counts()`): from 0 on mount and on each `replay`
 * when `fromZero`, otherwise from the number shown. With Reduce Motion it jumps.
 */
export const useCountTo = (
  target: number,
  { reduced, replay, fromZero = true }: CountToOptions,
) => {
  const [value, setValue] = useState(reduced || !fromZero ? target : 0);
  const current = useRef(value);
  const lastReplay = useRef(replay);
  useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return undefined;
    }
    let from = current.current;
    if (lastReplay.current !== replay) {
      lastReplay.current = replay;
      if (fromZero) {
        from = 0;
      }
    }
    if (from === target) {
      current.current = target;
      setValue(target);
      return undefined;
    }
    const start = Date.now();
    let raf = 0;
    const step = () => {
      const x = Math.min(1, (Date.now() - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - x, 3);
      const next = Math.round(from + (target - from) * eased);
      current.current = next;
      setValue(next);
      if (x < 1) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, replay, fromZero]);
  return value;
};

export default useCountTo;
