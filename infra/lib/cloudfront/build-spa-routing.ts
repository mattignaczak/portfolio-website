import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Compiles `spa-routing.ts` into the JavaScript that CloudFront publishes.
 *
 * This *transpiles*; it does not bundle. `spa-routing.ts` imports nothing, so
 * there is no dependency graph to resolve — and `bundle: true` was actively
 * harmful here. For a module with exports it wraps the output in esbuild's
 * CommonJS interop helpers, one of which uses `for...of`. The runtime rejects
 * that token, the function fails to compile, and CloudFront answers every
 * request with 503. Transpiling emits the declarations as written instead.
 */

/**
 * The `cloudfront-js-2.0` runtime is **not** ES2020, despite the name. It is
 * ECMAScript 5.1 plus a limited set of later features. `for...of` is ES2015 and
 * the runtime still rejects it, so this target is a floor, not a guarantee:
 * it stops esbuild emitting anything newer, but it cannot describe the runtime
 * exactly. Keep `spa-routing.ts` conservative as well.
 *
 * es5 is not an option — esbuild cannot downlevel `const` without the scope
 * analysis that only bundling provides, and bundling is what broke this.
 *
 * A local test cannot prove this value is safe. Verify against the real runtime:
 *   aws cloudfront test-function --name <fn> --if-match <etag> --stage LIVE \
 *     --region us-east-1 --event-object fileb://event.json
 */
export const CLOUDFRONT_JS_TARGET = 'es2015';

const ENTRY_POINT = path.join(__dirname, 'spa-routing.ts');

/**
 * `spa-routing.ts` exports its declarations so the tests can import them, but
 * CloudFront Functions have no module system and reject an `export` keyword.
 * Removing the prefix leaves plain top-level declarations — including the bare
 * `function handler` that the runtime calls.
 */
const EXPORT_KEYWORD = /^export /gm;

/**
 * Synchronous on purpose: CDK builds its construct tree synchronously, so the
 * code string must exist by the time `new cloudfront.Function()` is called.
 */
export function buildSpaRoutingCode(): string {
  const source = fs.readFileSync(ENTRY_POINT, 'utf8');

  const result = esbuild.transformSync(source.replace(EXPORT_KEYWORD, ''), {
    loader: 'ts',
    target: CLOUDFRONT_JS_TARGET,
    // Readability over bytes: this is what you read in the CloudFront console
    // when debugging, and the file is far under the 10 KB limit.
    minify: false,
    legalComments: 'none',
  });

  return result.code;
}
