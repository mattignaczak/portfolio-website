import { useEffect, useRef, useState } from 'react';

/** The accent color string for the dots + the base dot opacity for the active theme. */
interface ThemeColors {
  /** Any valid CSS color (we feed it through `withAlpha` for fades). */
  color: string;
  /** Resting opacity of a dot at rest, 0–1. */
  opacity: number;
}

/**
 * Re-attach an alpha channel to one of our CSS color tokens. Works for the
 * `oklch(L C H)` / `rgb(r g b)` function forms our theme uses (and strips any
 * existing alpha first), so the goo/glow fades don't depend on a specific color
 * format the way the upstream `.replace('1)', ...)` hack did.
 */
function withAlpha(color: string, alpha: number): string {
  const open = color.indexOf('(');
  if (open === -1) return color; // named color / hex — leave as-is
  const fn = color.slice(0, open);
  const body = color.slice(open + 1, color.lastIndexOf(')'));
  const inner = body.slice(0, body.indexOf('/') === -1 ? body.length : body.indexOf('/')).trim();
  return `${fn}(${inner} / ${alpha})`;
}

/**
 * Read the live theme (accent token + light/dark state) and return the dot
 * color + base opacity to render the grid with. Re-run whenever `.dark` flips.
 *
 * Starting point for tuning: the dots use the `--main` accent, slightly more
 * opaque in dark mode (where the background is darker, so they need more punch).
 */
function readThemeColors(): ThemeColors {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const main = getComputedStyle(root).getPropertyValue('--main').trim();
  return {
    color: main || 'oklch(45.5% 0.26 288)',
    opacity: isDark ? 0.34 : 0.22,
  };
}

/**
 * A full-viewport interactive fractal dot grid (adapted from cult-ui's
 * `bg-animated-fractal-grid`). A field of dots ripples outward from the pointer
 * in a wave, with a soft glow on the displaced dots. Built to fit this site:
 *
 * - Theme-driven: dot color + opacity come from the accent token via
 *   `readThemeColors()` and re-read when the `.dark` class toggles — no
 *   hardcoded colors, no dark-mode-breaking `multiply` blend.
 * - Cheap: rendered at 1× into a `fixed` canvas, throttled to ~30fps, with the
 *   dot grid thinned out (`skip`) on smaller screens.
 * - Respects `prefers-reduced-motion` (one static frame, no pointer reactivity)
 *   and pauses while the tab is hidden. Sits behind all content (`-z-10`).
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const DOT_SIZE = 4; // px diameter of a dot at rest
    const FRAME_MS = 1000 / 30; // throttle target
    const WAVE_INTENSITY = 24; // px max displacement at the pointer
    const WAVE_RADIUS = 220; // px reach of the ripple
    const OFFSCREEN = -10000;

    let width = 0;
    let height = 0;
    let spacing = 28; // gap between dots; widened on small screens
    let skip = 1; // render every Nth dot (perf throttle on small screens)
    let theme: ThemeColors = { color: 'oklch(45.5% 0.26 288)', opacity: 0.3 };

    // Pointer in px; chased with a little lag so the ripple feels fluid.
    let pointerX = OFFSCREEN;
    let pointerY = OFFSCREEN;
    let targetX = OFFSCREEN;
    let targetY = OFFSCREEN;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Thin the grid + widen spacing on smaller / lower-power screens.
      if (width < 768) {
        spacing = 42;
        skip = 3;
      } else if (width < 1024) {
        spacing = 35;
        skip = 2;
      } else {
        spacing = 28;
        skip = 1;
      }
    };

    const draw = (time: number) => {
      pointerX += (targetX - pointerX) * 0.12;
      pointerY += (targetY - pointerY) * 0.12;

      ctx.clearRect(0, 0, width, height);
      const { color, opacity } = theme;
      const fade = withAlpha(color, 0);
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      for (let i = 0; i < cols; i += skip) {
        for (let j = 0; j < rows; j += skip) {
          const x = i * spacing;
          const y = j * spacing;
          const dx = x - pointerX;
          const dy = y - pointerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let dotX = x;
          let dotY = y;

          if (dist < WAVE_RADIUS) {
            // Inside the ripple: displace the dot along its radial, then glow it.
            const strength = (1 - dist / WAVE_RADIUS) ** 2;
            const angle = Math.atan2(dy, dx);
            const offset = Math.sin(dist * 0.05 - time * 0.005) * WAVE_INTENSITY * strength;
            dotX += Math.cos(angle) * offset;
            dotY += Math.sin(angle) * offset;

            const glowRadius = DOT_SIZE * (1 + strength);
            const gradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, glowRadius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, fade); // same hue at 0 alpha → no dark halo
            ctx.globalAlpha = Math.min(1, opacity * (1 + strength));
            ctx.fillStyle = gradient;
          } else {
            ctx.globalAlpha = opacity;
            ctx.fillStyle = color;
          }

          ctx.beginPath();
          ctx.arc(dotX, dotY, DOT_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let lastDraw = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < FRAME_MS) return; // throttle to ~30fps
      lastDraw = now;
      draw(now);
    };
    const start = () => {
      if (reduceMotion) {
        draw(0); // single static frame, pointer parked offscreen
      } else if (!raf) {
        lastDraw = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    theme = readThemeColors();
    resize();
    start();
    setReady(true); // trigger the CSS fade-in

    const onResize = () => {
      resize();
      if (reduceMotion) draw(0);
    };
    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    const onPointerLeave = () => {
      targetX = OFFSCREEN;
      targetY = OFFSCREEN;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const themeObserver = new MutationObserver(() => {
      theme = readThemeColors();
      if (reduceMotion) draw(0);
    });

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    if (!reduceMotion) {
      window.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
