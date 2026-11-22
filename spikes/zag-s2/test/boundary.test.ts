// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * Zag must stay behind TESSEN: no `@zag-js/*` type or name may appear in what a consumer can see.
 * Here: the type of every public export is printed with the TypeScript compiler and must not
 * mention Zag, a machine, a service or an `api` object.
 */
const root = fileURLToPath(new URL('..', import.meta.url));

function publicSurface(entry: string): string[] {
  const program = ts.createProgram([entry], {
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    allowImportingTsExtensions: true,
    noEmit: true,
    types: [],
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry)!;
  const symbol = checker.getSymbolAtLocation(source)!;
  return checker.getExportsOfModule(symbol).map((exported) => {
    const target =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const isType = (target.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) !== 0;
    const type = isType
      ? checker.getDeclaredTypeOfSymbol(target)
      : checker.getTypeOfSymbolAtLocation(target, source);
    // Fully qualified, so a type coming from `@zag-js/*` prints its package path.
    const text = checker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType,
    );
    return `${exported.name}: ${text}`;
  });
}

describe.each(['vue', 'react'])('%s public surface', (framework) => {
  const entry = `${root}src/${framework}/index.${framework === 'vue' ? 'ts' : 'ts'}`;
  const surface = publicSurface(entry);

  it('exports every component', () => {
    const names = surface.map((line) => line.split(':')[0]);
    for (const name of [
      'Select',
      'Combobox',
      'Menu',
      'Popover',
      'Dialog',
      'Tooltip',
      'DatePicker',
    ]) {
      expect(names).toContain(name);
    }
  });

  it('mentions no Zag type, machine, service or api object', () => {
    for (const line of surface) {
      expect(line, line.slice(0, 80)).not.toMatch(
        /zag-js|@zag|machine|Service<|\bapi\b|\bPropTypes\b/i,
      );
    }
  });

  it('only implementation files import @zag-js, never the entry point', () => {
    expect(readFileSync(entry, 'utf8')).not.toMatch(/@zag-js/);
    const files = readdirSync(`${root}src/${framework}`).filter((f) => f !== `index.ts`);
    const withZag = files.filter((f) =>
      /@zag-js/.test(readFileSync(`${root}src/${framework}/${f}`, 'utf8')),
    );
    expect(withZag.length).toBeGreaterThan(0); // the boundary is the implementation files
  });
});
