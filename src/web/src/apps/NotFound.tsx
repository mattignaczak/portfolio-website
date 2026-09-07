import { Link } from 'react-router-dom';
import { content } from '../content';

const { notFound } = content;

/**
 * Catch-all route. Only reachable because CloudFront rewrites unknown paths to
 * the SPA shell (see infra/lib/cloudfront/spa-routing.js) — without that
 * rewrite, a bad URL never reaches the client router at all.
 *
 * Not in `PAGES`: it is a fallback, not a nav link.
 */
export function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl">{notFound.heading}</h1>
      <p className="text-sm">{notFound.intro}</p>
      <Link to="/" className="inline-block font-mono text-sm hover:underline">
        {notFound.backHome}
      </Link>
    </div>
  );
}
