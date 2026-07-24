import { Children, useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoScrollRowProps {
  children: ReactNode;
  /** Auto-scroll speed in pixels/second. Movement direction is always left-to-right (content drifts right). */
  speed?: number;
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
}

/**
 * A horizontally scrolling row that auto-advances on its own, but is fully
 * manually navigable: drag/swipe, mouse wheel, or the arrow buttons all work
 * and immediately take over from the automatic scroll. This matters when the
 * row holds clickable content (like certificate cards) — a viewer shouldn't
 * have to wait for the animation to bring a specific item into view.
 */
export function AutoScrollRow({
  children,
  speed = 30,
  className,
  itemClassName,
  showArrows = true,
}: AutoScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // "pending" = pointer is down but we haven't decided yet whether this is a
  // tap or a drag. "active" = movement crossed the threshold, we're dragging.
  const pointerState = useRef<"idle" | "pending" | "active">("idle");
  const dragStart = useRef({ x: 0, scrollLeft: 0, pointerId: 0 });
  const wasDragging = useRef(false);
  const didInitPosition = useRef(false);
  const items = Children.toArray(children);

  const DRAG_THRESHOLD = 6;

  const pauseTemporarily = (ms = 3000) => {
    setIsPaused(true);
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => setIsPaused(false), ms);
  };

  useEffect(() => {
    if (items.length === 0) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    let last = performance.now();

    const step = (now: number) => {
      const el = scrollRef.current;
      if (el) {
        const half = el.scrollWidth / 2;
        if (!didInitPosition.current && half > 0) {
          // Start mid-loop so both directions of manual scroll have room to move.
          el.scrollLeft = half;
          didInitPosition.current = true;
        }
        const dt = (now - last) / 1000;
        if (!isPaused && pointerState.current !== "active" && half > 0) {
          el.scrollLeft -= speed * dt;
          if (el.scrollLeft <= 0) el.scrollLeft += half;
        }
      }
      last = now;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, items.length, speed]);

  useEffect(() => () => resumeTimeout.current && clearTimeout(resumeTimeout.current), []);

  const scrollByAmount = (dir: 1 | -1) => {
    pauseTemporarily();
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  // Pointer down only *arms* a potential drag — it does NOT capture the
  // pointer or pause auto-scroll yet. Capturing immediately on down is what
  // breaks plain clicks (notably in Safari, which can suppress the
  // subsequent click event once setPointerCapture has been called), so a tap
  // on a "View"/"Verify" button must be able to complete untouched.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    pointerState.current = "pending";
    dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft, pointerId: e.pointerId };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || pointerState.current === "idle") return;

    const dx = e.clientX - dragStart.current.x;

    if (pointerState.current === "pending") {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      // Threshold crossed — this is now a genuine drag. Capture from here on.
      pointerState.current = "active";
      setIsPaused(true);
      el.setPointerCapture(dragStart.current.pointerId);
    }

    el.scrollLeft = dragStart.current.scrollLeft - dx;
  };

  const endDrag = () => {
    if (pointerState.current === "active") {
      // Suppress the click that would otherwise fire on whatever element is
      // under the pointer at release (e.g. a certificate's "Verify" link).
      wasDragging.current = true;
      pauseTemporarily();
    }
    pointerState.current = "idle";
  };

  const onClickCapture = (e: MouseEvent) => {
    if (wasDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDragging.current = false;
    }
  };

  if (items.length === 0) return null;

  return (
    <div className={cn("relative group/scrollrow", className)}>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          if (pointerState.current !== "active") setIsPaused(false);
        }}
        onWheel={() => pauseTemporarily()}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => pauseTemporarily()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {[items, items].map((group, groupIdx) => (
          <div key={groupIdx} aria-hidden={groupIdx === 1} className="flex shrink-0">
            {group.map((child, idx) => (
              <div key={idx} className={itemClassName}>
                {child}
              </div>
            ))}
          </div>
        ))}
      </div>

      {showArrows && items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount(-1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 flex items-center justify-center bg-background/90 border border-border text-muted-foreground hover:text-primary hover:border-primary/50 opacity-0 group-hover/scrollrow:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount(1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 flex items-center justify-center bg-background/90 border border-border text-muted-foreground hover:text-primary hover:border-primary/50 opacity-0 group-hover/scrollrow:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
