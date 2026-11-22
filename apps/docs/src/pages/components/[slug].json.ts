import type { APIRoute, GetStaticPaths } from 'astro';
import { components } from '../../lib/data';

// Machine-readable contract of each component (llms.txt links here).
export const getStaticPaths: GetStaticPaths = () =>
  components.map((c) => ({ params: { slug: c.slug }, props: { doc: c } }));

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(props.doc, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
