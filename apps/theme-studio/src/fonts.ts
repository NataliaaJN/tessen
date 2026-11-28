/** Font names offered by the quick mode. Studio does not download or bundle fonts: the app does. */
export const FONT_CHOICES = {
  sans: [
    'Manrope',
    'Inter',
    'IBM Plex Sans',
    'Source Sans 3',
    'DM Sans',
    'Roboto',
    'Open Sans',
    'Lato',
    'Noto Sans',
    'Segoe UI',
    'Helvetica Neue',
    'Arial',
  ],
  display: [
    'Manrope',
    'Outfit',
    'Inter',
    'Fraunces',
    'Playfair Display',
    'Merriweather',
    'Space Grotesk',
    'Sora',
    'Georgia',
  ],
  mono: ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Menlo', 'Consolas'],
} as const;

export const ACCENT_SWATCHES = [
  { label: 'Cobalto', hex: '#2B7BE0' },
  { label: 'Índigo', hex: '#5B5BD6' },
  { label: 'Violeta', hex: '#8B6CF0' },
  { label: 'Magenta', hex: '#C2409B' },
  { label: 'Rojo', hex: '#D94B4B' },
  { label: 'Naranja', hex: '#F26B2A' },
  { label: 'Ámbar', hex: '#D9822B' },
  { label: 'Verde', hex: '#1F8A5B' },
  { label: 'Verde azulado', hex: '#18B5A0' },
  { label: 'Cian', hex: '#38C6F4' },
  { label: 'Pizarra', hex: '#4F6B8F' },
] as const;
