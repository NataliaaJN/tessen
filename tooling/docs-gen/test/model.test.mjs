import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildComponentDoc,
  buildIndex,
  buildLlmsTxt,
  checkDocs,
  partsOf,
  slugOf,
  vuePropStatus,
} from '../src/model.mjs';

/** @type {import('../src/model.mjs').Contract} */
const contract = {
  name: 'Button',
  names: { vue: 'TButton', react: 'Button' },
  category: 'actions',
  tier: 'T1',
  engine: 'native',
  apgPattern: 'https://example.test/apg',
  anatomy: ['root'],
  props: [
    { name: 'variant', type: 'enum', values: ['a', 'b'], default: 'a' },
    { name: 'value', type: 'string' },
  ],
  cases: [{ id: 'x', describe: 'does x', expect: {} }],
};

const ctx = (over = {}) => ({
  vue: { exports: ['Button', 'ButtonGroup'], props: { Button: ['variant', 'modelValue'] } },
  react: { exports: ['Button', 'ButtonGroup'] },
  roots: ['Button', 'ButtonGroup'],
  snippets: { vue: '<TButton />', react: '<Button />' },
  ...over,
});

test('slugOf kebab-cases PascalCase names', () => {
  assert.equal(slugOf('ButtonGroup'), 'button-group');
  assert.equal(slugOf('Button'), 'button');
});

test('vuePropStatus: own, alias, exception and missing', () => {
  assert.equal(vuePropStatus('Button', 'variant', ['variant']), 'own');
  assert.equal(vuePropStatus('Tabs', 'value', ['modelValue']), 'alias:modelValue');
  assert.equal(vuePropStatus('Input', 'placeholder', []), 'exception');
  assert.equal(vuePropStatus('Button', 'nope', []), 'missing');
});

test('partsOf does not take another root as a part', () => {
  const all = ['Button', 'ButtonGroup', 'Dialog'];
  assert.deepEqual(partsOf('Button', ['Button', 'ButtonGroup'], all), []);
  assert.deepEqual(
    partsOf('Dialog', ['Dialog', 'DialogContent', 'DialogTitle', 'Divider'], [...all, 'Divider']),
    ['DialogContent', 'DialogTitle'],
  );
});

test('buildComponentDoc maps the contract and marks props', () => {
  const d = buildComponentDoc(contract, ctx());
  assert.equal(d.slug, 'button');
  assert.deepEqual(d.frameworks, { vue: true, react: true });
  assert.deepEqual(
    d.props.map((p) => [p.name, p.vue]),
    [
      ['variant', 'own'],
      ['value', 'alias:modelValue'],
    ],
  );
  assert.deepEqual(d.behaviours, [{ id: 'x', describe: 'does x' }]);
  assert.deepEqual(d.parts.vue, []);
});

test('checkDocs passes a consistent component', () => {
  assert.deepEqual(checkDocs([buildComponentDoc(contract, ctx())]), []);
});

test('checkDocs reports a missing framework export and a drifted prop', () => {
  const d = buildComponentDoc(
    contract,
    ctx({ react: { exports: [] }, vue: { exports: ['Button'], props: { Button: ['variant'] } } }),
  );
  const problems = checkDocs([d]);
  assert.ok(problems.some((p) => p.includes('not exported by @tessen-ui/react')));
  assert.ok(problems.some((p) => p.startsWith('Button.value')));
});

test('checkDocs flags a stale KNOWN_EXCEPTIONS entry', () => {
  /** @type {import('../src/model.mjs').Contract} */
  const input = {
    ...contract,
    name: 'Input',
    names: { vue: 'TInput', react: 'Input' },
    props: [{ name: 'placeholder', type: 'string' }],
  };
  const d = buildComponentDoc(
    input,
    ctx({
      vue: { exports: ['Input'], props: { Input: ['placeholder'] } },
      react: { exports: ['Input'] },
      roots: ['Input'],
    }),
  );
  assert.ok(checkDocs([d]).some((p) => p.includes('stale entry: Input.placeholder')));
});

test('index and llms.txt list every component', () => {
  const docs = [buildComponentDoc(contract, ctx())];
  assert.equal(buildIndex(docs)[0]?.propCount, 2);
  const txt = buildLlmsTxt(docs);
  assert.match(txt, /^# Tessen/);
  assert.match(txt, /\[Button\]\(\/components\/button\.json\)/);
});

test('compound components get a skeleton with their parts instead of a one-liner', () => {
  const dialog = {
    ...contract,
    name: 'Dialog',
    names: { vue: 'TDialog', react: 'Dialog' },
    props: [],
  };
  const d = buildComponentDoc(
    dialog,
    ctx({
      vue: { exports: ['Dialog', 'DialogContent'], props: { Dialog: [] } },
      react: { exports: ['Dialog', 'DialogContent'] },
      roots: ['Dialog'],
    }),
  );
  assert.equal(d.example.react, '<Dialog>\n  <DialogContent />\n</Dialog>');
  assert.equal(d.example.vue, '<TDialog>\n  <TDialogContent />\n</TDialog>');
});
