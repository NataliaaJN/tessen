// @ts-check
// US-02: a theme exported from Theme Studio (acme.theme.json) becomes plain CSS that this app
// imports after the library's CSS. The library itself is not touched.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importTheme, toCss } from '@tessen-ui/theme';

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const theme = importTheme(readFileSync(resolve(cwd, 'acme.theme.json'), 'utf8'), 'acme.theme.json');
writeFileSync(resolve(cwd, 'src/acme-theme.generated.css'), toCss(theme));
console.log(`theme "${theme.name}" -> src/acme-theme.generated.css`);
