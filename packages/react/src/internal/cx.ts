/** Joins class names, skipping empty values. The component's own class always comes first. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
