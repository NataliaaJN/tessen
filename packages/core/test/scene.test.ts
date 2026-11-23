import { describe, expect, it } from 'vitest';
import type { Scene } from '../src/index.ts';
import { componentName, jsLiteral, renderScene, sceneComponents } from '../src/index.ts';

const button: Scene = {
  root: { c: 'Button', p: { variant: 'outline', block: true, size: undefined }, k: ['Save'] },
};

describe('renderScene', () => {
  it('writes the same usage in both idioms', () => {
    expect(renderScene(button, 'react')).toBe(
      [
        "import { Button } from '@tessen-ui/react';",
        '',
        'export default function Example() {',
        '  return (',
        '    <Button variant="outline" block>Save</Button>',
        '  );',
        '}',
        '',
      ].join('\n'),
    );
    expect(renderScene(button, 'vue')).toBe(
      [
        '<script setup lang="ts">',
        "import { TButton } from '@tessen-ui/vue';",
        '</script>',
        '',
        '<template>',
        '  <TButton variant="outline" block>Save</TButton>',
        '</template>',
        '',
      ].join('\n'),
    );
  });

  it('uses kebab-case props in Vue, binds non-strings and hoists big values', () => {
    const items = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana', disabled: true },
    ];
    const scene: Scene = {
      root: { c: 'Select', p: { defaultValue: 'apple', items, open: false, pageCount: 3 } },
    };
    const vue = renderScene(scene, 'vue');
    expect(vue).toContain('default-value="apple"');
    expect(vue).toContain(':items="items"');
    expect(vue).toContain(':open="false"');
    expect(vue).toContain(':page-count="3"');
    expect(vue).toContain("const items = [\n  { value: 'apple', label: 'Apple' },");
    const react = renderScene(scene, 'react');
    expect(react).toContain('defaultValue="apple"');
    expect(react).toContain('items={items}');
    expect(react).toContain('open={false}');
  });

  it('maps events, styles and setup', () => {
    const scene: Scene = {
      setup: {
        uses: ['createToaster'],
        lines: ['const toaster = createToaster();'],
        names: ['toaster'],
      },
      root: {
        c: 'div',
        p: { style: { inlineSize: '10rem' } },
        k: [
          {
            c: 'Button',
            p: { onClick: { $expr: "() => toaster.create({ title: 'Hi' })" } },
            k: ['Go'],
          },
          { c: 'Toaster', p: { toaster: { $expr: 'toaster' } } },
        ],
      },
    };
    const vue = renderScene(scene, 'vue');
    expect(vue).toContain('@click="() => toaster.create({ title: \'Hi\' })"');
    expect(vue).toContain(':toaster="toaster"');
    expect(vue).toContain('style="inline-size: 10rem"');
    expect(vue).toContain("import { createToaster, TButton, TToaster } from '@tessen-ui/vue';");
    const react = renderScene(scene, 'react');
    expect(react).toContain("onClick={() => toaster.create({ title: 'Hi' })}");
    expect(react).toContain("style={{ inlineSize: '10rem' }}");
    expect(react.indexOf('const toaster')).toBeLessThan(react.indexOf('export default'));
  });

  it('maps named slots to Vue templates and React props', () => {
    const scene: Scene = {
      root: { c: 'Card', s: { header: ['Title'], footer: [{ c: 'b', k: ['End'] }] }, k: ['Body'] },
    };
    const vue = renderScene(scene, 'vue');
    expect(vue).toContain('<template #header>Title</template>');
    expect(vue).toContain('<template #footer>');
    const react = renderScene(scene, 'react');
    expect(react).toContain('header="Title"');
    expect(react).toContain('footer={<b>End</b>}');
  });

  it('escapes text', () => {
    const scene: Scene = { root: { c: 'p', k: ['a < b {x}'] } };
    expect(renderScene(scene, 'vue')).toContain('<p>a &lt; b {x}</p>');
    expect(renderScene(scene, 'react')).toContain("a &lt; b {'{'}x{'}'}");
  });

  it('lists components and names', () => {
    const scene: Scene = {
      root: { c: 'Dialog', k: [{ c: 'DialogTrigger', k: ['x'] }, { c: 'span' }] },
    };
    expect(sceneComponents(scene)).toEqual(['Dialog', 'DialogTrigger']);
    expect(componentName('Dialog', 'vue')).toBe('TDialog');
    expect(componentName('div', 'vue')).toBe('div');
    expect(jsLiteral({ a: [1, 'b'], 'c-d': null })).toBe("{ a: [1, 'b'], 'c-d': null }");
  });
});
