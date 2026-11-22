import type { APIRoute } from 'astro';
import { components, categoryLabel } from '../lib/data';
import { editorial } from '../lib/editorial';

// Índice estático pequeño para la paleta ⌘K: unas 40 entradas no necesitan un buscador.
export const GET: APIRoute = () => {
  const entries = [
    { title: 'Empezar', url: '/get-started/', kind: 'Guía', text: 'instalar instalación vue react nuxt next tailwind' },
    { title: 'Guías', url: '/guidelines/', kind: 'Guía', text: 'principios accesibilidad contenido layout tema' },
    { title: 'Tokens', url: '/tokens/', kind: 'Fundamento', text: 'color espaciado tipografía radio movimiento variables' },
    ...components.map((c) => ({
      title: c.name,
      url: `/components/${c.slug}/`,
      kind: categoryLabel(c.category),
      text: [editorial[c.slug]?.use ?? '', c.anatomy.join(' '), c.parts.react.join(' ')].join(' '),
    })),
  ];
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } });
};
