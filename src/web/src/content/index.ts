import { en } from './en';

/**
 * Structural schema for all locales, derived from English. Any future locale file
 * must satisfy this type, so a missing or renamed key fails the build.
 */
export type Content = typeof en;

/**
 * The active locale's content. Today this is always English; when real i18n lands,
 * resolve the visitor's locale here (and widen the type to `Content`).
 */
export const content = en;

/**
 * Resolve `{token}` placeholders in a translatable string against `vars`.
 *
 * @example format('Thanks {name}', { name: 'Sam' }) // 'Thanks Sam'
 * @example format('© {year} Matt', { year: 2026 })  // '© 2026 Matt'
 */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in vars ? String(vars[token]) : match,
  );
}
