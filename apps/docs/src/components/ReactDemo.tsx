// Hydratable wrapper: renders the React example `src/examples/<slug>/<id>.tsx`.
import type { ComponentType } from 'react';

const modules = import.meta.glob<{ default: ComponentType }>('../examples/*/*.tsx', {
  eager: true,
});

export default function ReactDemo({ slug, id }: { slug: string; id: string }) {
  const Example = modules[`../examples/${slug}/${id}.tsx`]?.default;
  return Example ? <Example /> : null;
}
