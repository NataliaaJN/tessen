// Acceso tipado a los datos generados por tooling/docs-gen (src/generated, no se versiona).

export interface PropDoc {
  name: string;
  type: 'enum' | 'boolean' | 'string';
  values?: string[];
  default?: string | boolean;
  required: boolean;
  vue: string;
}

export interface ComponentDoc {
  name: string;
  slug: string;
  names: { vue: string; react: string };
  category: string;
  tier: string;
  engine: 'native' | 'zag';
  apgPattern: string;
  anatomy: string[];
  frameworks: { vue: boolean; react: boolean };
  parts: { vue: string[]; react: string[] };
  props: PropDoc[];
  behaviours: { id: string; describe: string }[];
  example: { vue: string; react: string };
}

const modules = import.meta.glob<ComponentDoc>('../generated/components/*.json', {
  eager: true,
  import: 'default',
});

export const components: ComponentDoc[] = Object.values(modules).sort(
  (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
);

export function byCategory(): [string, ComponentDoc[]][] {
  const map = new Map<string, ComponentDoc[]>();
  for (const c of components) map.set(c.category, [...(map.get(c.category) ?? []), c]);
  return [...map];
}

const CATEGORY_LABELS: Record<string, string> = {
  actions: 'Acciones',
  'data-display': 'Visualización de datos',
  display: 'Visualización',
  feedback: 'Retroalimentación',
  forms: 'Formularios',
  layout: 'Layout',
  navigation: 'Navegación',
  overlays: 'Superposiciones',
  overlay: 'Superposiciones',
  media: 'Medios',
  input: 'Entradas',
  inputs: 'Entradas',
  utility: 'Utilidades',
  utilities: 'Utilidades',
  disclosure: 'Despliegue',
};

export const categoryLabel = (c: string) =>
  CATEGORY_LABELS[c] ?? c.replace(/-/g, ' ').replace(/^./, (m) => m.toUpperCase());
