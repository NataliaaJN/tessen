import type { ContrastPair, TokenData, TokenRecord } from '@tessen-ui/theme';
import pairsDoc from '@tessen-ui/tokens/contrast-pairs.json';
import tokensDoc from '@tessen-ui/tokens/tokens.json';

/** The token table and the contrast pairs the repository itself verifies (`pnpm tokens:check`). */
export const tokenData = tokensDoc as unknown as TokenData;
export const contrastPairs = (pairsDoc as { pairs: ContrastPair[] }).pairs;

export const primitiveColors: TokenRecord[] = tokenData.tokens.filter(
  (t) => t.layer === 'primitive' && t.type === 'color',
);
export const semanticColors: TokenRecord[] = tokenData.tokens.filter(
  (t) => t.layer === 'semantic' && t.type === 'color' && t.aliases && t.aliases['light'],
);

/** Primitive scale names in palette order, e.g. `neutral`, `brand`, `accent`... */
export const scaleNames: string[] = [
  ...new Set(
    primitiveColors
      .map((t) => t.path.split('.')[1] as string)
      .filter((n) => n !== 'white' && n !== 'black'),
  ),
];

/** `color.text.primary` -> `text` group, for the tree. */
export const semanticGroup = (path: string): string => path.split('.')[1] as string;
