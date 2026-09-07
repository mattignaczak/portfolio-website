/**
 * CloudFront Function (viewer-request) — SPA deep-link routing.
 *
 * ## Why this exists
 *
 * The site is a single-page app: Vite emits exactly one `index.html`, and
 * react-router resolves `/resume` or `/blog/<slug>` on the client. CloudFront
 * knows none of that. Without this function it forwards `/resume` to S3 as an
 * object key named `resume`, which does not exist — and because the Origin
 * Access Control policy grants `s3:GetObject` but not `s3:ListBucket`, S3
 * answers 403 AccessDenied rather than 404. Every deep link, refresh, and
 * shared URL therefore fails, while in-app navigation keeps working because it
 * never leaves the browser.
 *
 * ## Runtime constraints
 *
 * This module is bundled by `build-spa-routing.ts` and uploaded as source text
 * to CloudFront's `cloudfront-js-2.0` runtime. That runtime is ECMAScript 2020,
 * but it is **not Node**: no modules, no `require`, no network, no timers, and
 * a hard 10 KB limit on the published code. Keep this file self-contained — an
 * import would be inlined by the bundler at best, and blow the size limit or
 * reference a missing global at worst.
 */

/** The subset of the viewer-request event this function reads and mutates. */
export interface CloudFrontViewerRequest {
  /** Absolute request path, always starting with `/`. Rewriting this changes
   *  which S3 object CloudFront fetches — the whole point of this function. */
  uri: string;
}

export interface CloudFrontViewerRequestEvent {
  request: CloudFrontViewerRequest;
}

const HAS_EXTENSION = /\.[a-zA-Z0-9]+$/;

/**
 * Entry point. CloudFront calls this for every viewer request on the default
 * behavior, before the cache lookup — so a rewritten URI shares one cache entry
 * across all SPA routes instead of fragmenting the cache per path.
 */
export function handler(event: CloudFrontViewerRequestEvent): CloudFrontViewerRequest {
  const request = event.request;

  if (!isFileRequest(request.uri)) {
    request.uri = '/index.html';
  }

  return request;
}

/**
 * Does this URI address a real file in the bucket, rather than an SPA route?
 *
 * `true`  → pass through to S3 untouched. A hit serves the file; a miss stays a
 *           genuine error, which is what makes a typo'd bundle path fail loudly
 *           instead of returning the HTML shell with status 200.
 * `false` → rewrite to `/index.html` and let react-router resolve it.
 *
 * @param uri Absolute request path, always starting with `/`.
 */
export function isFileRequest(uri: string): boolean {
  return HAS_EXTENSION.test(uri);
}
