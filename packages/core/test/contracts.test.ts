import { describe, expect, it } from 'vitest';
import type { PropSpec } from '../src/index.ts';
import { buttonContract, buttonVariants, defineContract, generateSnippet } from '../src/index.ts';

describe('buttonContract', () => {
  it('is plain data: survives a JSON round trip unchanged (D-17)', () => {
    expect(JSON.parse(JSON.stringify(buttonContract))).toEqual(buttonContract);
  });
  it('has unique case ids', () => {
    const ids = buttonContract.cases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('keeps prop specs in sync with the variants', () => {
    for (const [name, spec] of Object.entries(buttonVariants.config.variants)) {
      const prop: PropSpec | undefined = buttonContract.props.find((p) => p.name === name);
      expect(prop, name).toBeDefined();
      if (spec !== 'boolean') expect(prop?.values).toEqual(spec);
      expect(prop?.default).toBe(buttonVariants.config.defaults[name as 'size']);
    }
  });
  it('defineContract returns its input', () => {
    const c = { ...buttonContract };
    expect(defineContract(c)).toBe(c);
  });
});

describe('generateSnippet', () => {
  it('omits defaults and uses each framework idiom', () => {
    expect(generateSnippet(buttonContract, 'vue', { label: 'Save' })).toBe(
      '<TButton>Save</TButton>',
    );
    expect(generateSnippet(buttonContract, 'react', { label: 'Save' })).toBe(
      '<Button>Save</Button>',
    );
  });
  it('renders props, booleans and icons', () => {
    const p = { label: 'Go', variant: 'outline', block: true, leading: 'L' };
    expect(generateSnippet(buttonContract, 'react', p)).toBe(
      '<Button variant="outline" block leadingIcon="L">Go</Button>',
    );
    expect(generateSnippet(buttonContract, 'vue', p)).toBe(
      '<TButton variant="outline" block>\n  <template #leading>L</template>\n  Go\n</TButton>',
    );
  });
});
