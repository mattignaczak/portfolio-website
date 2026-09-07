import * as vm from 'vm';
import {
  handler,
  isFileRequest,
  type CloudFrontViewerRequestEvent,
} from '../lib/cloudfront/spa-routing';
import { buildSpaRoutingCode, CLOUDFRONT_JS_TARGET } from '../lib/cloudfront/build-spa-routing';

/**
 * Spec for the CloudFront Function that makes deep links work.
 *
 * Before it existed, every route except `/` returned 403 from S3 on a hard load:
 * CloudFront forwarded `/resume` as a literal object key, and the OAC policy
 * (GetObject without ListBucket) makes S3 report a missing key as AccessDenied.
 *
 * Two layers are tested, because they fail in different ways:
 *   1. the logic, imported directly as TypeScript — fast and typechecked;
 *   2. the *bundled* output, evaluated as text — catches a broken esbuild
 *      wiring that would synth and deploy fine, then 500 on every request.
 */

/** Run the handler and return the URI CloudFront would forward to the origin. */
function rewrite(uri: string): string {
  const event: CloudFrontViewerRequestEvent = { request: { uri } };
  return handler(event).uri;
}

/** Every `PAGES` path plus the parameterized post route — the URLs that 403'd. */
const SPA_ROUTES = [
  '/projects',
  '/blog',
  '/resume',
  '/contact',
  '/blog/hello-world',
  '/blog/event-driven-notifications',
];

/** Real objects Vite emits into `dist/`, or that live in `public/`. */
const REAL_FILES = [
  '/index.html',
  '/resume.pdf',
  '/avatar.png',
  '/favicon.ico',
  '/assets/index-Dgl7klpg.css',
  '/assets/index-C8a3hl6d.js',
  '/assets/hanken-grotesk-latin-wght-normal-CaVRRdDk.woff2',
  '/projects/screenshot.png',
];

describe('spa-routing rewrite logic', () => {
  describe('navigation requests reach the SPA shell', () => {
    it.each(SPA_ROUTES)('rewrites %s to /index.html', (uri) => {
      expect(rewrite(uri)).toBe('/index.html');
    });

    it('rewrites the root path', () => {
      // `defaultRootObject` also covers `/`, but a viewer-request trigger can
      // run before that substitution. Handling it here is correct either way.
      expect(rewrite('/')).toBe('/index.html');
    });

    it('rewrites a path with a trailing slash', () => {
      expect(rewrite('/blog/')).toBe('/index.html');
    });

    it('rewrites an unknown path so the SPA renders its own 404', () => {
      // The client router owns "not found" — see the `*` route in App.tsx.
      expect(rewrite('/no-such-page')).toBe('/index.html');
    });

    it('rewrites a slug that contains a dot', () => {
      // A dot alone does not make something a file: `why-node.js-is-fine` is a
      // plausible post slug, and passing it through would 403 a real post.
      expect(rewrite('/blog/why-node.js-is-fine')).toBe('/index.html');
    });
  });

  describe('real files pass through untouched', () => {
    it.each(REAL_FILES)('leaves %s alone', (uri) => {
      expect(rewrite(uri)).toBe(uri);
    });

    it('lets a missing asset stay a genuine error instead of serving the shell', () => {
      // This is the entire reason for a rewrite function rather than a blanket
      // `403/404 -> /index.html` error response: a typo'd bundle path must fail
      // loudly, not return HTML with status 200 and a blank screen.
      expect(rewrite('/assets/does-not-exist.js')).toBe('/assets/does-not-exist.js');
    });

    it('classifies by extension, not by the presence of a dot', () => {
      expect(isFileRequest('/assets/app.js')).toBe(true);
      expect(isFileRequest('/blog/why-node.js-is-fine')).toBe(false);
    });
  });
});

describe('spa-routing published code', () => {
  const code = buildSpaRoutingCode();

  it('targets a version the cloudfront-js-2.0 runtime accepts', () => {
    // Raising this deploys cleanly and then fails to compile on the runtime,
    // which answers every request with 503. There is no synth-time signal.
    expect(CLOUDFRONT_JS_TARGET).toBe('es2015');
  });

  it('declares a bare top-level `handler`, as the runtime requires', () => {
    // CloudFront Functions have no module system; the runtime calls a global
    // `handler`. The build strips the `export` keywords to leave this behind.
    expect(code).toMatch(/^function handler\(event\)/m);
    expect(code).not.toMatch(/\bexport\b/);
  });

  it('emits no bundler wrapper', () => {
    // Regression gate for a real 503. `bundle: true` wrapped this module in
    // esbuild's CommonJS interop helpers because it has exports. One of them
    // uses `for...of`, which cloudfront-js-2.0 rejects with
    // `SyntaxError: Token "of" not supported in this version`, so the function
    // failed to compile and every viewer request returned 503.
    expect(code).not.toMatch(/for\s*\([^)]*\bof\b/);
    expect(code).not.toMatch(/Object\.defineProperty|__toCommonJS|__copyProps/);
    expect(code).not.toMatch(/\(\(\)\s*=>/);
  });

  it('stays small enough to read in the CloudFront console', () => {
    // Transpiled output should be roughly the size of the source. A jump here
    // means a wrapper crept back in.
    expect(Buffer.byteLength(code, 'utf8')).toBeLessThan(1024);
  });

  it('references no Node or browser globals the runtime lacks', () => {
    expect(code).not.toMatch(/\brequire\s*\(/);
    expect(code).not.toMatch(/^\s*(import|export)\s/m);
    expect(code).not.toMatch(/\b(process|Buffer|fetch|setTimeout|window|document)\b/);
  });

  it('fits well inside the 10 KB published-code limit', () => {
    expect(Buffer.byteLength(code, 'utf8')).toBeLessThan(10 * 1024);
  });

  it('behaves identically to the TypeScript source once evaluated', () => {
    // Evaluate the shipped text in a fresh V8 context. Unlike `new Function`,
    // this has no access to Node's globals — no `require`, no `process`, no
    // `Buffer` — which is a close stand-in for the CloudFront sandbox: code
    // that reaches for them throws here instead of in production.
    const bundledHandler = vm.runInNewContext(`${code}\nhandler;`, {}) as (
      event: CloudFrontViewerRequestEvent,
    ) => { uri: string };

    expect(bundledHandler({ request: { uri: '/resume' } }).uri).toBe('/index.html');
    expect(bundledHandler({ request: { uri: '/resume.pdf' } }).uri).toBe('/resume.pdf');
  });
});
