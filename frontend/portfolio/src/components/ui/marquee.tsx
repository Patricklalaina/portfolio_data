import { Children, type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  /** Direction items visually travel in. "right" = left-to-right movement. */
  direction?: "left" | "right";
  /** Seconds for one full loop — lower is faster. */
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
}

/**
 * Infinite horizontal scroller. Duplicates its children once so the loop is
 * seamless, and fades the edges with a mask so items don't hard-cut at the
 * container bounds. Respects prefers-reduced-motion (see index.css).
 */
export function Marquee({
  children,
  direction = "left",
  speed = 40,
  pauseOnHover = true,
  className,
  itemClassName,
}: MarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const items = Children.toArray(children);

  if (items.length === 0) return null;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
      }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        className={cn(
          "flex w-max",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
        )}
        style={{
          ["--marquee-duration" as string]: `${speed}s`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
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
    </div>
  );
}
