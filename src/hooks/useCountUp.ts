import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  enabled?: boolean;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const useCountUp = (
  target: number,
  { duration = 900, delay = 0, enabled = true }: UseCountUpOptions = {},
): number => {
  const [value, setValue] = useState(target);
  const raf = useRef<number | null>(null);
  const valueRef = useRef(target);
  const wasDisabled = useRef(!enabled);

  valueRef.current = value;

  useEffect(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }

    if (!enabled) {
      wasDisabled.current = true;
      setValue(target);
      return;
    }

    if (wasDisabled.current) {
      wasDisabled.current = false;
      setValue(target);
      return;
    }

    const from = valueRef.current;
    if (from === target) return;

    const startAt = performance.now() + delay;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const tick = (now: number) => {
      if (now < startAt) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(1, (now - startAt) / duration);
      const eased = easeOutCubic(progress);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        raf.current = null;
      }
    };

    timeout = setTimeout(() => {
      raf.current = requestAnimationFrame(tick);
    }, Math.min(delay, 16));

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (timeout) clearTimeout(timeout);
    };
  }, [target, duration, delay, enabled]);

  return value;
};