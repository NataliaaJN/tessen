import { describe, expect, it } from 'vitest';
import * as publicApi from './index.ts';

// Condition C1 of ADR 0004: the engine stays behind TESSEN. No Zag function, machine or context
// is part of the public surface; only components are.
describe('public API (@tessen-ui/react)', () => {
  const names = Object.keys(publicApi);

  it('exports only components (PascalCase, no prefix: ADR 0011)', () => {
    expect(names.filter((name) => !/^[A-Z]/.test(name))).toEqual([]);
  });

  it('has no duplicate or engine-shaped exports', () => {
    expect(new Set(names).size).toBe(names.length);
    expect(names.filter((name) => /zag|machine|connect|presence|context/i.test(name))).toEqual([]);
  });

  it('exports every T1 component of the catalog', () => {
    for (const name of [
      'Button',
      'IconButton',
      'Link',
      'Field',
      'Input',
      'Textarea',
      'Checkbox',
      'RadioGroup',
      'Switch',
      'NativeSelect',
      'Tabs',
      'Tooltip',
      'Dialog',
      'Alert',
      'Badge',
      'Spinner',
      'Skeleton',
      'Card',
      'Stack',
      'Container',
      'Grid',
      'Divider',
      'AspectRatio',
      'VisuallyHidden',
    ]) {
      expect(names, name).toContain(name);
    }
  });

  it('exports the native T2 components', () => {
    for (const name of [
      'Progress',
      'Avatar',
      'Breadcrumbs',
      'BreadcrumbItem',
      'EmptyState',
      'List',
      'ListItem',
      'ToggleButton',
      'ButtonGroup',
      'Table',
      'TableRow',
      'TableCell',
      'TableHeaderCell',
      'Pagination',
    ]) {
      expect(names, name).toContain(name);
    }
  });
});
