import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const useCountUp = (
  target: number,
  { duration = 900, delay = 0 }: UseCountUpOptions = {},
): number => {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const startAt = performance.now() + delay;
    const previous = raf.current;
    if (previous) {
      cancelAnimationFrame(previous);
      raf.current = null;
    }

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const tick = (now: number) => {
      if (now < startAt) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(1, (now - startAt) / duration);
      const eased = easeOutCubic(progress);
      setValue(Math.round(eased * target));
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
  }, [target, duration, delay]);

  return value;
};