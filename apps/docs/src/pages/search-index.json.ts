import type { APIRoute } from 'astro';
import { components, categoryLabel } from '../lib/data';
import { editorial } from '../lib/editorial';

// Small static index for the ⌘K palette: 40-odd entries do not need a search engine.
export const GET: APIRoute = () => {
  const entries = [
    { title: 'Get started', url: '/get-started/', kind: 'Guide', text: 'install vue react nuxt next tailwind' },
    { title: 'Guidelines', url: '/guidelines/', kind: 'Guide', text: 'principles accessibility content' },
    { title: 'Tokens', url: '/tokens/', kind: 'Foundation', text: 'colour spacing typography radius motion variables' },
    ...components.map((c) => ({
      title: c.name,
      url: `/components/${c.slug}/`,
      kind: categoryLabel(c.category),
      text: [editorial[c.slug]?.use ?? '', c.anatomy.join(' '), c.parts.react.join(' ')].join(' '),
    })),
  ];
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } });
};
