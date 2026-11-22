import { render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import * as React from 'react';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { buttonContract } from '../src/core/button.contract.ts';
import { generateSnippet } from '../src/core/codegen.ts';
import type { NeutralProps } from '../src/core/contract.ts';
import { Button } from '../src/react/Button.tsx';
import TButton from '../src/vue/Button.vue';
import { reactAdapter } from './react.adapter.tsx';
import { vueAdapter } from './vue.adapter.ts';

const examples: NeutralProps[] = [
  { label: 'Save' },
  { label: 'Delete', variant: 'outline', tone: 'danger', size: 'lg' },
  { label: 'Pay', block: true, type: 'submit' },
  { label: 'Wait', loading: true },
  { label: 'Off', disabled: true, variant: 'ghost' },
  { label: 'Next', variant: 'secondary', leading: 'L', trailing: 'T' },
];

describe('Codegen · exact text', () => {
  it('omits defaults and uses each framework idiom', () => {
    expect(generateSnippet(buttonContract, 'vue', { label: 'Save' })).toBe(
      '<TButton>Save</TButton>',
    );
    expect(generateSnippet(buttonContract, 'react', { label: 'Save' })).toBe(
      '<Button>Save</Button>',
    );
    expect(
      generateSnippet(buttonContract, 'vue', {
        label: 'Go',
        variant: 'outline',
        loading: true,
        leading: 'L',
      }),
    ).toBe(
      '<TButton variant="outline" loading>\n  <template #leading>L</template>\n  Go\n</TButton>',
    );
    expect(
      generateSnippet(buttonContract, 'react', {
        label: 'Go',
        variant: 'outline',
        loading: true,
        leading: 'L',
      }),
    ).toBe('<Button variant="outline" loading leadingIcon="L">Go</Button>');
  });
});

describe('P4 · generated snippets compile and render what the direct component renders', () => {
  // Vue's template compiler condenses the newlines of a multi-line snippet into one collapsible
  // space around the label (` Next `). It has no visual effect, so text is compared trimmed.
  const html = (el: Element) =>
    el.outerHTML.replaceAll(/<!--.*?-->/g, '').replaceAll(/>\s+|\s+</g, (m) => m.trim());

  for (const props of examples) {
    it(`Vue · ${JSON.stringify(props)}`, () => {
      const snippet = generateSnippet(buttonContract, 'vue', props);
      const app = mount(
        { components: { TButton }, template: snippet },
        { attachTo: document.body },
      );
      const direct = vueAdapter.mount(props);
      expect(html(app.element)).toBe(html(direct.root));
      direct.unmount();
      app.unmount();
    });

    it(`React · ${JSON.stringify(props)}`, () => {
      const snippet = generateSnippet(buttonContract, 'react', props);
      const { outputText, diagnostics } = ts.transpileModule(`const element = (${snippet});`, {
        fileName: 'snippet.tsx',
        reportDiagnostics: true,
        compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2023 },
      });
      expect(diagnostics).toEqual([]);
      const element = new Function('React', 'Button', `${outputText}; return element;`)(
        React,
        Button,
      ) as React.ReactElement;
      const { container, unmount } = render(element);
      const direct = reactAdapter.mount(props);
      expect(html(container.firstElementChild!)).toBe(html(direct.root));
      direct.unmount();
      unmount();
    });
  }
});
