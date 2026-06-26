import { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  driftX: number; // resting velocity the blob eases back toward
  driftY: number;
  radius: number; // base radius; actual size is scaled by its life phase
  color: string;
  age: number; // ms lived
  maxAge: number; // ms lifespan before respawn
}

/**
 * A full-viewport "lava lamp": metaball blobs that drift, swell, and melt into
 * one another. Built to be cheap:
 *
 * - The whole field is simulated and rendered at low resolution (`SCALE`) into
 *   a small offscreen buffer; the goo filter (blur + alpha threshold) runs on
 *   that small buffer, then CSS upscales the canvas — so the expensive blur
 *   touches ~20% of the pixels and the upscale hides the low res (goo is soft).
 * - The loop is throttled to ~30fps (a lava lamp doesn't need 60), with motion
 *   scaled by real delta-time so it isn't slower for it.
 * - The canvas backing store is 1× (no retina) — pointless sharpness for a blur.
 *
 * Colors come from the theme's accent + chart tokens (follows the light/dark
 * toggle), and the blobs billow away from the pointer. Sits behind all content
 * (`fixed`, `-z-10`). Respects `prefers-reduced-motion` (one static frame, no
 * loop, no cursor reactivity) and pauses while the tab is hidden.
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Small offscreen buffer the blobs are drawn into before the goo pass.
    const buffer = document.createElement('canvas');
    const bctx = buffer.getContext('2d');
    if (!bctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const BLOB_COUNT = 6;
    const SCALE = 0.45; // internal render resolution (CSS upscales to full size)
    const FRAME_MS = 1000 / 30; // throttle target
    const INFLUENCE_RADIUS = 220; // px — cursor push reach
    const PUSH = 0.9; // velocity impulse at the cursor
    const MAX_SPEED = 6;
    const OFFSCREEN = -10000;

    let width = 0;
    let height = 0;
    let bw = 1; // buffer (and canvas backing) width in px
    let bh = 1;
    let isDark = false;
    let palette = ['oklch(60% 0.2 288)'];

    // Eased pointer that chases the real one for a lifelike lag.
    let pointerX = OFFSCREEN;
    let pointerY = OFFSCREEN;
    let targetX = OFFSCREEN;
    let targetY = OFFSCREEN;

    let blobs: Blob[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    /** Pull accent + chart colors from the live theme, and set glow strength. */
    const readTheme = () => {
      const root = document.documentElement;
      isDark = root.classList.contains('dark');
      const styles = getComputedStyle(root);
      const colors = ['--main', '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5']
        .map((name) => styles.getPropertyValue(name).trim())
        .filter(Boolean);
      if (colors.length) palette = colors;
      // The blobs are opaque for crisp metaball edges; fade the whole layer here.
      canvas.style.opacity = isDark ? '0.8' : '0.45';
    };

    /** (Re)seed a blob. `initial` randomizes age so they don't pulse in unison. */
    const spawn = (blob: Blob, initial: boolean) => {
      blob.x = rand(0, width);
      blob.y = rand(0, height);
      blob.radius = rand(110, 240);
      blob.color = palette[Math.floor(Math.random() * palette.length)] ?? palette[0] ?? '#fff';
      const speed = rand(0.05, 0.16);
      const angle = rand(0, Math.PI * 2);
      blob.driftX = Math.cos(angle) * speed;
      blob.driftY = Math.sin(angle) * speed;
      blob.vx = blob.driftX;
      blob.vy = blob.driftY;
      blob.maxAge = rand(10000, 20000);
      blob.age = initial ? rand(0, blob.maxAge) : 0;
    };

    const buildBlobs = () => {
      blobs = Array.from({ length: BLOB_COUNT }, () => {
        const blob: Blob = {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          driftX: 0,
          driftY: 0,
          radius: 0,
          color: '',
          age: 0,
          maxAge: 1,
        };
        spawn(blob, true);
        return blob;
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      bw = Math.max(1, Math.ceil(width * SCALE));
      bh = Math.max(1, Math.ceil(height * SCALE));
      // Small backing store; CSS stretches it to the full viewport.
      canvas.width = bw;
      canvas.height = bh;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      buffer.width = bw;
      buffer.height = bh;
    };

    let last = 0;
    const twoRadiusSq = 2 * INFLUENCE_RADIUS * INFLUENCE_RADIUS;

    const draw = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16; // clamp big tab-switch gaps
      last = now;
      const frame = dt / 16; // normalize motion to ~60fps units

      pointerX += (targetX - pointerX) * 0.12;
      pointerY += (targetY - pointerY) * 0.12;

      // 1) Accumulate solid blobs into the low-res buffer (no filter yet).
      bctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      bctx.clearRect(0, 0, width, height);
      for (const blob of blobs) {
        blob.age += dt;
        if (blob.age >= blob.maxAge) spawn(blob, false);
        const lifeScale = Math.sin(Math.PI * (blob.age / blob.maxAge)); // 0 → 1 → 0

        // Cursor force field: billow the velocity away with a Gaussian falloff.
        const dx = blob.x - pointerX;
        const dy = blob.y - pointerY;
        const distSq = dx * dx + dy * dy;
        const influence = Math.exp(-distSq / twoRadiusSq);
        if (influence > 0.002) {
          const dist = Math.sqrt(distSq) || 1;
          blob.vx += (dx / dist) * PUSH * influence;
          blob.vy += (dy / dist) * PUSH * influence;
        }

        // Ease velocity back to the resting drift, then integrate + clamp.
        blob.vx += (blob.driftX - blob.vx) * 0.03;
        blob.vy += (blob.driftY - blob.vy) * 0.03;
        const speed = Math.hypot(blob.vx, blob.vy);
        if (speed > MAX_SPEED) {
          blob.vx = (blob.vx / speed) * MAX_SPEED;
          blob.vy = (blob.vy / speed) * MAX_SPEED;
        }
        blob.x += blob.vx * frame;
        blob.y += blob.vy * frame;

        // Wrap around the edges so the field stays populated.
        const r = blob.radius;
        if (blob.x < -r) blob.x = width + r;
        else if (blob.x > width + r) blob.x = -r;
        if (blob.y < -r) blob.y = height + r;
        else if (blob.y > height + r) blob.y = -r;

        const drawRadius = blob.radius * lifeScale;
        if (drawRadius < 1) continue;
        bctx.fillStyle = blob.color;
        bctx.beginPath();
        bctx.arc(blob.x, blob.y, drawRadius, 0, Math.PI * 2);
        bctx.fill();
      }

      // 2) Composite the small field through the goo filter (cheap at low res).
      ctx.clearRect(0, 0, bw, bh);
      ctx.filter = 'url(#lava-goo)';
      ctx.drawImage(buffer, 0, 0);
      ctx.filter = 'none';
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
        draw(0);
      } else if (!raf) {
        last = 0;
        lastDraw = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    readTheme();
    resize();
    buildBlobs();
    start();

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
      readTheme();
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
    <>
      {/* Goo filter: blur fuses neighboring blobs, the alpha threshold snaps the
          smear into a single gooey surface with metaball necks. */}
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id="lava-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
            />
          </filter>
        </defs>
      </svg>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />
    </>
  );
}
