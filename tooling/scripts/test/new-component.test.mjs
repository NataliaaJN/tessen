// @ts-check
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseArgs, renderComponent, renderExports, toKebab, toPascal } from '../new-component.mjs';

const spec = parseArgs([
  'StatusDot',
  '--tag',
  'span',
  '--category',
  'feedback',
  '--variant',
  'tone=neutral,success,danger',
  '--variant',
  'size=sm,md',
  '--boolean',
  'pulse',
]);

describe('new-component', () => {
  it('converts names', () => {
    assert.equal(toKebab('StatusDot'), 'status-dot');
    assert.equal(toPascal('status-dot'), 'StatusDot');
  });

  it('parses flags', () => {
    assert.deepEqual(spec.variants[0], { name: 'tone', values: ['neutral', 'success', 'danger'] });
    assert.deepEqual(spec.booleans, ['pulse']);
    assert.equal(spec.tag, 'span');
  });

  it('rejects bad input', () => {
    assert.throws(() => parseArgs([]));
    assert.throws(() => parseArgs(['X', '--variant', 'broken']));
    assert.throws(() => parseArgs(['X', '--nope', 'y']));
  });

  const files = renderComponent(spec);

  it('renders contract, both frameworks, tests and CSS', () => {
    assert.deepEqual(Object.keys(files).sort(), [
      'packages/core/src/contracts/status-dot.contract.ts',
      'packages/react/src/components/status-dot/StatusDot.tsx',
      'packages/react/src/components/status-dot/index.ts',
      'packages/react/src/components/status-dot/status-dot.test.tsx',
      'packages/styles/src/components/status-dot.css',
      'packages/vue/src/components/status-dot/StatusDot.vue',
      'packages/vue/src/components/status-dot/index.ts',
      'packages/vue/src/components/status-dot/status-dot.test.ts',
    ]);
  });

  it('puts the same defaults in the contract and uses the contract in both frameworks', () => {
    const contract = files['packages/core/src/contracts/status-dot.contract.ts'] ?? '';
    assert.match(contract, /defaults: \{ tone: 'neutral', size: 'sm', pulse: false \}/);
    assert.match(contract, /'data-tone': 'success'/);
    assert.match(
      files['packages/vue/src/components/status-dot/StatusDot.vue'] ?? '',
      /statusDotVariants/,
    );
    assert.match(
      files['packages/react/src/components/status-dot/StatusDot.tsx'] ?? '',
      /statusDotVariants/,
    );
    assert.match(
      files['packages/react/src/components/status-dot/StatusDot.tsx'] ?? '',
      /HTMLSpanElement/,
    );
  });

  it('renders the barrel lines', () => {
    const exportsMap = renderExports(spec);
    assert.match(exportsMap['packages/vue/src/index.ts'] ?? '', /status-dot\/index\.js/);
    assert.match(exportsMap['packages/react/src/index.ts'] ?? '', /status-dot\/index\.ts/);
    assert.match(exportsMap['packages/core/src/contracts/index.ts'] ?? '', /statusDotContract/);
  });
});
