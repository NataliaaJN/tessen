import { defaultTheme, parseTheme } from './model.ts';
import type { Theme } from './model.ts';

export interface Preset {
  id: string;
  label: string;
  description: string;
  theme: Theme;
}

function preset(
  id: string,
  label: string,
  description: string,
  patch: Partial<Omit<Theme, 'overrides' | 'version' | 'fonts'>> & {
    fonts?: Partial<Theme['fonts']>;
  },
): Preset {
  const base = defaultTheme();
  return {
    id,
    label,
    description,
    theme: parseTheme({ ...base, ...patch, name: id, fonts: { ...base.fonts, ...patch.fonts } }),
  };
}

/** Four light and four dark starting points. Original to Tessen. */
export const PRESETS: readonly Preset[] = [
  preset('cobalto', 'Cobalto', 'El tema base de Tessen: azul cobalto, radio medio.', {}),
  preset('pizarra', 'Pizarra', 'Sobrio y preciso: gris azulado, esquinas casi rectas, compacto.', {
    accent: '#4F6B8F',
    radius: 2,
    density: 'compact',
  }),
  preset('bosque', 'Bosque', 'Verde profundo, esquinas amables y más aire.', {
    accent: '#1F8A5B',
    radius: 10,
    density: 'comfortable',
  }),
  preset('ambar', 'Ámbar', 'Cálido y orgánico: ámbar, esquinas muy redondeadas.', {
    accent: '#D9822B',
    radius: 14,
  }),
  preset('medianoche', 'Medianoche', 'Oscuro con acento cian; el modo oscuro de la marca.', {
    accent: '#38C6F4',
    previewMode: 'dark',
  }),
  preset('carbon', 'Carbón', 'Oscuro, violeta y compacto para herramientas densas.', {
    accent: '#8B6CF0',
    radius: 4,
    density: 'compact',
    previewMode: 'dark',
  }),
  preset('aurora', 'Aurora', 'Oscuro con verde azulado y esquinas suaves.', {
    accent: '#18B5A0',
    radius: 12,
    previewMode: 'dark',
  }),
  preset('brasa', 'Brasa', 'Oscuro, naranja intenso y esquinas rectas.', {
    accent: '#F26B2A',
    radius: 0,
    previewMode: 'dark',
  }),
];
