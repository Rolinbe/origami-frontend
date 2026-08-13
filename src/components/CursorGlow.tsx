import { useEffect, useRef } from "react";

export const CursorGlow = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const state = useRef({
    dotX: -200,
    dotY: -200,
    ringX: -200,
    ringY: -200,
    tx: -200,
    ty: -200,
    hovering: false,
    raf: null as number | null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const s = state.current;

    const onMove = (event: MouseEvent) => {
      s.tx = event.clientX;
      s.ty = event.clientY;
      const target = event.target as HTMLElement | null;
      s.hovering = !!target?.closest(
        "a, button, [role='button'], input, select, textarea, label, [role='menuitem'], [role='option']"
      );
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${s.tx}px, ${s.ty}px, 0) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      s.ringX += (s.tx - s.ringX) * 0.14;
      s.ringY += (s.ty - s.ringY) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${s.ringX}px, ${s.ringY}px, 0) translate(-50%, -50%) scale(${s.hovering ? 1.7 : 1})`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${s.ringX}px, ${s.ringY}px, 0) translate(-50%, -50%)`;
      }
      s.raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    s.raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = null;
    };
  }, []);

  return (
    <>
      {/* Halo lumineux (suivi lent) */}
      <div ref={haloRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[4]">
        <div
          className="h-[420px] w-[420px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, hsl(221 83% 53% / 0.12), transparent 62%)",
          }}
        />
      </div>

      {/* Anneau (traînée lissée) */}
      <div ref={ringRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60]">
        <div
          className="h-9 w-9 rounded-full border-2 border-primary/70"
          style={{
            transition: "border-color 0.3s ease",
            boxShadow: "0 0 14px hsl(221 83% 53% / 0.35)",
          }}
        />
      </div>

      {/* Point (exact) */}
      <div ref={dotRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60]">
        <div
          className="h-2 w-2 rounded-full"
          style={{
            background: "hsl(221 83% 55%)",
            boxShadow: "0 0 10px 2px hsl(221 83% 53% / 0.6)",
          }}
        />
      </div>
    </>
  );
};