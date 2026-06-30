import { useEffect, useRef } from 'react';

const LINES = ['MATT', 'IGNACZAK'];

// 8×8 Bayer matrix (values 0–63) for ordered dithering.
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7,
  39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

type Pt = { x: number; y: number; z: number; nx: number; ny: number; nz: number };

/**
 * Rasterize the name once and extrude every lit pixel into a thick slab (front
 * face + front-half bevels), each point carrying a surface normal for lighting.
 */
function buildPoints(): Pt[] {
  const W = 520;
  const H = 230;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 72px monospace';
  ctx.letterSpacing = '6px';
  ctx.fillText(LINES[0] ?? '', W / 2, H * 0.31);
  ctx.fillText(LINES[1] ?? '', W / 2, H * 0.71);

  const data = ctx.getImageData(0, 0, W, H).data;
  const lit = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < W && y < H && (data[(y * W + x) * 4] ?? 0) > 128;

  const pts: Pt[] = [];
  const T = 10; // half-thickness of the extrusion

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (!lit(x, y)) continue;
      const cx = x - W / 2;
      const cy = H / 2 - y; // canvas Y points down; flip so up is +y

      pts.push({ x: cx, y: cy, z: T, nx: 0, ny: 0, nz: 1 });

      const gx = (lit(x - 1, y) ? 1 : 0) - (lit(x + 1, y) ? 1 : 0);
      const gy = (lit(x, y - 1) ? 1 : 0) - (lit(x, y + 1) ? 1 : 0);
      if (gx !== 0 || gy !== 0) {
        const nx = gx;
        const ny = -gy;
        const len = Math.hypot(nx, ny, 0.6) || 1;
        for (let z = 0; z <= T; z += 2) {
          pts.push({ x: cx, y: cy, z, nx: nx / len, ny: ny / len, nz: 0.6 / len });
        }
      }
    }
  }
  return pts;
}

/** Resolve the inherited phosphor color (a CSS token) to RGB via a 1px canvas. */
function resolveColor(el: HTMLElement): [number, number, number] {
  const c = getComputedStyle(el).color;
  const cv = document.createElement('canvas');
  cv.width = 1;
  cv.height = 1;
  const cx = cv.getContext('2d');
  if (!cx) return [130, 230, 150];
  cx.fillStyle = c;
  cx.fillRect(0, 0, 1, 1);
  const d = cx.getImageData(0, 0, 1, 1).data;
  return [d[0] ?? 130, d[1] ?? 230, d[2] ?? 150];
}

export function AsciiName({ label }: { label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const OW = 480; // output pixel width
    const OH = 188; // output pixel height
    canvas.width = OW;
    canvas.height = OH;

    // Fixed 3D pose so the extrusion's depth reads while the name stays still.
    const A = 0.14;
    const B = 0.11;
    const cosA = Math.cos(A);
    const sinA = Math.sin(A);
    const cosB = Math.cos(B);
    const sinB = Math.sin(B);

    // Rotate all points once, find bounds for an auto-fit scale.
    type R = [number, number, number, number, number, number]; // x, y, z, nx, ny, nz
    const rot: R[] = [];
    let maxX = 1;
    let maxY = 1;
    for (const p of buildPoints()) {
      const x1 = p.x * cosB + p.z * sinB;
      const z1 = -p.x * sinB + p.z * cosB;
      const y2 = p.y * cosA - z1 * sinA;
      const z2 = p.y * sinA + z1 * cosA;
      const nx1 = p.nx * cosB + p.nz * sinB;
      const nz1 = -p.nx * sinB + p.nz * cosB;
      const ny2 = p.ny * cosA - nz1 * sinA;
      const nz2 = p.ny * sinA + nz1 * cosA;
      rot.push([x1, y2, z2, nx1, ny2, nz2]);
      if (Math.abs(x1) > maxX) maxX = Math.abs(x1);
      if (Math.abs(y2) > maxY) maxY = Math.abs(y2);
    }
    const M = 0.92 * Math.min(OW / (2 * maxX), OH / (2 * maxY));

    // Project + z-buffer the nearest surface per output pixel; store its world
    // position and normal so the animation only re-lights.
    const N = OW * OH;
    const zbuf = new Float32Array(N).fill(-Infinity);
    const has = new Uint8Array(N);
    const pX = new Float32Array(N);
    const pY = new Float32Array(N);
    const pZ = new Float32Array(N);
    const nX = new Float32Array(N);
    const nY = new Float32Array(N);
    const nZ = new Float32Array(N);
    for (const r of rot) {
      const xp = Math.round(OW / 2 + r[0] * M);
      const yp = Math.round(OH / 2 - r[1] * M);
      if (xp < 0 || xp >= OW || yp < 0 || yp >= OH) continue;
      const idx = xp + yp * OW;
      if (r[2] > (zbuf[idx] ?? -Infinity)) {
        zbuf[idx] = r[2];
        has[idx] = 1;
        pX[idx] = r[0];
        pY[idx] = r[1];
        pZ[idx] = r[2];
        nX[idx] = r[3];
        nY[idx] = r[4];
        nZ[idx] = r[5];
      }
    }

    const [pr, pg, pb] = resolveColor(canvas);
    const img = ctx.createImageData(OW, OH);
    const buf = img.data;

    const draw = (t: number) => {
      // Point light orbiting in front of the name (world units, so it scales).
      const lpx = Math.cos(t) * maxX * 0.85;
      const lpy = 20 + Math.sin(t * 1.3) * maxY * 0.8;
      const lpz = maxX * 1.3;

      buf.fill(0);
      for (let idx = 0; idx < N; idx++) {
        if (!has[idx]) continue;
        let lx = lpx - (pX[idx] ?? 0);
        let ly = lpy - (pY[idx] ?? 0);
        let lz = lpz - (pZ[idx] ?? 0);
        const ll = Math.hypot(lx, ly, lz) || 1;
        lx /= ll;
        ly /= ll;
        lz /= ll;
        const dot = (nX[idx] ?? 0) * lx + (nY[idx] ?? 0) * ly + (nZ[idx] ?? 0) * lz;
        // Keep the whole letter lit enough to read; gamma sharpens the gradient.
        const intensity = 0.35 + 0.65 * Math.pow(Math.max(0, dot), 0.7);
        const col = idx % OW;
        const row = (idx / OW) | 0;
        const th = ((BAYER8[(row & 7) * 8 + (col & 7)] ?? 0) + 0.5) / 64;
        if (intensity <= th) continue; // ordered dithering: drop sub-threshold pixels
        const o = idx * 4;
        buf[o] = pr;
        buf[o + 1] = pg;
        buf[o + 2] = pb;
        buf[o + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(0.8);
      return;
    }

    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.018;
      draw(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className="crt-screen block w-full rounded-base border-2 border-border p-2 shadow-shadow"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
