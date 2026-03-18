import { useRef, useEffect, ReactNode } from "react";

const RADIUS = 120;
const RADIUS_HERO = 160;
const PUSH = 28;
const PUSH_HERO = 70;

function wrapWordsInNode(node: Node): void {
  if (node.nodeType !== Node.TEXT_NODE) return;
  if ((node.parentElement as HTMLElement)?.closest(".blink-cursor")) return;

  const text = node.textContent || "";
  const parts = text.split(/(\s+)/);
  const fragment = document.createDocumentFragment();

  for (const part of parts) {
    if (/^\s*$/.test(part)) {
      fragment.appendChild(document.createTextNode(part));
    } else {
      const span = document.createElement("span");
      span.className = "landing-word";
      span.textContent = part;
      fragment.appendChild(span);
    }
  }

  const parent = node.parentNode!;
  const replacement = Array.from(fragment.childNodes);
  replacement.forEach((n) => parent.insertBefore(n, node));
  parent.removeChild(node);
}

export default function LandingTextEscape({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nodes = Array.from(container.childNodes);
    for (const node of nodes) {
      wrapWordsInNode(node);
    }

    const words = container.querySelectorAll(".landing-word");
    if (!words.length) return;

    let mouseX = -1e6;
    let mouseY = -1e6;
    let rafId: number | null = null;

    function update() {
      for (const word of words) {
        const rect = (word as HTMLElement).getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const dist = Math.hypot(dx, dy);

        const radius = (word as HTMLElement).closest(".hero-title") ? RADIUS_HERO : RADIUS;
        if (dist < radius && dist > 0) {
          const t = 1 - dist / radius;
          const push = (word as HTMLElement).closest(".hero-title") ? PUSH_HERO : PUSH;
          const mag = push * t * t;
          const nx = dx / dist;
          const ny = dy / dist;
          (word as HTMLElement).style.transform = `translate(${nx * mag}px, ${ny * mag}px)`;
        } else {
          (word as HTMLElement).style.transform = "";
        }
      }
      rafId = null;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [children]);

  return <span ref={containerRef}>{children}</span>;
}
