import * as esbuild from 'esbuild';
import * as path from 'path';

/**
 * Bundles `spa-routing.ts` into the plain JavaScript that CloudFront publishes.
 *
 * CloudFront Functions have no module system: the uploaded source must declare
 * a bare top-level `function handler(event)`. esbuild can't emit that from an
 * ES module directly, so we bundle to an IIFE assigned to a private global and
 * append a thin top-level delegate:
 *
 *   var __spaRouting = (() => { ...bundled module...; return exports; })();
 *   function handler(event) { return __spaRouting.handler(event); }
 *
 * That keeps the source a normal, strictly-typechecked TS module (importable by
 * the tests) while still shipping something the runtime accepts.
 */

/** cloudfront-js-2.0 is ECMAScript 2020. Emitting anything newer — optional
 *  chaining assignment, `??=`, class fields — is accepted at deploy time and
 *  then fails on every viewer request, so this must not drift upward. */
export const CLOUDFRONT_JS_TARGET = 'es2020';

const GLOBAL_NAME = '__spaRouting';
const ENTRY_POINT = path.join(__dirname, 'spa-routing.ts');

/**
 * Synchronous on purpose: CDK's construct tree is built synchronously, so the
 * code string has to exist by the time `new cloudfront.Function()` is called.
 */
export function buildSpaRoutingCode(): string {
  const result = esbuild.buildSync({
    entryPoints: [ENTRY_POINT],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: GLOBAL_NAME,
    target: CLOUDFRONT_JS_TARGET,
    platform: 'neutral',
    // Readability over bytes: the published source is what you read in the
    // CloudFront console when debugging, and we are far under the 10 KB cap.
    minify: false,
    legalComments: 'none',
    footer: {
      js: `function handler(event) { return ${GLOBAL_NAME}.handler(event); }`,
    },
  });

  const output = result.outputFiles[0];
  if (!output) {
    throw new Error(`esbuild produced no output for ${ENTRY_POINT}`);
  }

  return output.text;
}
