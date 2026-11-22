import { describe, expect, it } from 'vitest';
import { defineVariants } from '../src/index.ts';

const v = defineVariants({
  base: 't-x',
  variants: { size: ['sm', 'md'], block: 'boolean' },
  defaults: { size: 'md', block: false },
});

describe('defineVariants', () => {
  it('emits defaults: enumerated always, boolean only when true', () => {
    expect(v()).toEqual({ class: 't-x', attrs: { 'data-size': 'md' } });
  });
  it('reflects explicit props', () => {
    expect(v({ size: 'sm', block: true }).attrs).toEqual({ 'data-size': 'sm', 'data-block': '' });
  });
  it('treats undefined as "use the default"', () => {
    expect(v({ size: undefined }).attrs['data-size']).toBe('md');
  });
  it('throws RangeError on an invalid value', () => {
    // @ts-expect-error invalid on purpose
    expect(() => v({ size: 'xl' })).toThrow(RangeError);
  });
  it('exposes its config', () => {
    expect(v.config.base).toBe('t-x');
  });
});
