import { useEffect, useRef, useState } from "react";

/**
 * Client-side infinite scroll helper.
 * - Tracks how many items of `total` are visible.
 * - Resets to `pageSize` when the identity `resetKey` changes
 *   (e.g. active tab or search query changes).
 * - Returns a `sentinelRef` to attach to a DOM node placed at the end of
 *   the list; when it enters the viewport, `visible` grows by `pageSize`.
 */
export function useInfiniteVisible({
  total,
  pageSize = 24,
  resetKey,
}: {
  total: number;
  pageSize?: number;
  resetKey?: unknown;
}) {
  const [visible, setVisible] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset when the underlying list identity or filter changes
  useEffect(() => {
    setVisible(pageSize);
  }, [resetKey, pageSize]);

  // Clamp when total shrinks below current visible
  useEffect(() => {
    setVisible((v) => Math.min(Math.max(v, pageSize), Math.max(total, pageSize)));
  }, [total, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (visible >= total) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible((v) => Math.min(v + pageSize, total));
          }
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible, total, pageSize]);

  return {
    visible: Math.min(visible, total),
    sentinelRef,
    hasMore: visible < total,
  };
}
