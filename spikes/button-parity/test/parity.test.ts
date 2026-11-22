import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { buttonContract } from '../src/core/button.contract.ts';
import type { NeutralProps } from '../src/core/contract.ts';
import TButton from '../src/vue/Button.vue';
import { reactAdapter } from './react.adapter.tsx';
import { vueAdapter } from './vue.adapter.ts';

/** Same DOM regardless of attribute order: serialise root + children with sorted attributes. */
function normalise(element: Element): string {
  const attrs = Array.from(element.attributes)
    .map((a) => `${a.name}="${a.value}"`)
    .sort()
    .join(' ');
  const children = Array.from(element.childNodes)
    .filter((n) => n.nodeType !== Node.COMMENT_NODE)
    .map((n) => (n.nodeType === Node.TEXT_NODE ? (n.textContent ?? '') : normalise(n as Element)))
    .join('');
  return `<${element.localName} ${attrs}>${children}</${element.localName}>`;
}

const matrix: NeutralProps[] = [];
for (const variant of buttonContract.props.find((p) => p.name === 'variant')!.values!)
  for (const tone of ['default', 'danger'])
    for (const size of ['sm', 'md', 'lg']) matrix.push({ label: 'Save', variant, tone, size });
matrix.push(
  { label: 'Save', block: true },
  { label: 'Save', disabled: true },
  { label: 'Save', loading: true },
  { label: 'Save', loading: true, leading: 'L', trailing: 'T' },
  { label: 'Save', type: 'submit', leading: 'L' },
  { label: '' },
);

describe('Parity · identical DOM in Vue and React', () => {
  for (const props of matrix) {
    it(JSON.stringify(props), () => {
      const vue = vueAdapter.mount(props);
      const vueHtml = normalise(vue.root);
      vue.unmount();
      const react = reactAdapter.mount(props);
      const reactHtml = normalise(react.root);
      react.unmount();
      expect(vueHtml).toBe(reactHtml);
    });
  }
});

/** Prop names declared by the React `ButtonProps` interface, via the TypeScript compiler API. */
function reactPropNames(): string[] {
  const file = createRequire(import.meta.url).resolve('../src/react/Button.tsx');
  const options: ts.CompilerOptions = {
    jsx: ts.JsxEmit.ReactJSX,
    allowImportingTsExtensions: true,
    skipLibCheck: true,
    noEmit: true,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2023,
  };
  const program = ts.createProgram([file], options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file)!;
  const decl = source.statements.find(
    (s): s is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(s) && s.name.text === 'ButtonProps',
  )!;
  return checker.getPropertiesOfType(checker.getTypeAtLocation(decl)).map((s) => s.name);
}

describe('P1 · API parity against the contract', () => {
  const contractProps: string[] = buttonContract.props.map((p) => p.name);

  it('Vue declares every contract prop', () => {
    const declared = Object.keys((TButton as unknown as { props: Record<string, unknown> }).props);
    expect(contractProps.filter((p) => !declared.includes(p))).toEqual([]);
  });

  it('React declares every contract prop', () => {
    const declared = reactPropNames();
    expect(contractProps.filter((p) => !declared.includes(p))).toEqual([]);
  });

  it('Vue declares nothing beyond the contract', () => {
    const declared = Object.keys((TButton as unknown as { props: Record<string, unknown> }).props);
    expect(declared.filter((p) => !contractProps.includes(p))).toEqual([]);
  });
});
