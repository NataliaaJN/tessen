// Runnable examples live in src/examples/<slug>/<id>.{vue,tsx}; the same id exists in both.
export interface Example {
  id: string;
  vue: string;
  react: string;
}

const vue = import.meta.glob<string>('../examples/*/*.vue', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const react = import.meta.glob<string>('../examples/*/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function parse(path: string): { slug: string; id: string } {
  const m = /examples\/([^/]+)\/([^/]+)\.\w+$/.exec(path);
  return { slug: m![1]!, id: m![2]! };
}

const keys = (group: Record<string, string>) =>
  new Set(
    Object.keys(group).map((p) => {
      const { slug, id } = parse(p);
      return `${slug}/${id}`;
    }),
  );

// A demo without its twin would silently show one framework only: fail the build instead.
const v = keys(vue);
const r = keys(react);
const unpaired = [...new Set([...v, ...r])].filter((k) => !v.has(k) || !r.has(k));
if (unpaired.length > 0) {
  throw new Error(`Examples must exist in both Vue and React: ${unpaired.join(', ')}`);
}

export function examplesFor(slug: string): Example[] {
  const byId = new Map<string, Example>();
  for (const [group, key] of [
    [vue, 'vue'],
    [react, 'react'],
  ] as const) {
    for (const [path, source] of Object.entries(group)) {
      const p = parse(path);
      if (p.slug !== slug) continue;
      byId.set(p.id, { vue: '', react: '', ...byId.get(p.id), id: p.id, [key]: source });
    }
  }
  return [...byId.values()];
}
