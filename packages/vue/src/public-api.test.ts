import { describe, expect, it } from 'vitest';
import * as publicApi from './index.js';

// Condition C1 of ADR 0004: the engine stays behind TESSEN. No Zag function, machine or context
// is part of the public surface; only components are.
describe('public API (@tessen-ui/vue)', () => {
  const names = Object.keys(publicApi);

  it('exports only T-prefixed components (ADR 0011) and createToaster', () => {
    expect(names.filter((name) => !/^T[A-Z]/.test(name))).toEqual(['createToaster']);
  });

  it('has no duplicate or engine-shaped exports', () => {
    expect(new Set(names).size).toBe(names.length);
    expect(names.filter((name) => /zag|machine|connect|presence|context/i.test(name))).toEqual([]);
  });

  it('exports every T1 component of the catalog', () => {
    for (const name of [
      'TButton',
      'TIconButton',
      'TLink',
      'TField',
      'TInput',
      'TTextarea',
      'TCheckbox',
      'TRadioGroup',
      'TSwitch',
      'TNativeSelect',
      'TTabs',
      'TTooltip',
      'TDialog',
      'TAlert',
      'TBadge',
      'TSpinner',
      'TSkeleton',
      'TCard',
      'TStack',
      'TContainer',
      'TGrid',
      'TDivider',
      'TAspectRatio',
      'TVisuallyHidden',
    ]) {
      expect(names, name).toContain(name);
    }
  });

  it('exports the native T2 components', () => {
    for (const name of [
      'TProgress',
      'TAvatar',
      'TBreadcrumbs',
      'TBreadcrumbItem',
      'TEmptyState',
      'TList',
      'TListItem',
      'TToggleButton',
      'TButtonGroup',
      'TTable',
      'TTableRow',
      'TTableCell',
      'TTableHeaderCell',
      'TPagination',
    ]) {
      expect(names, name).toContain(name);
    }
  });

  it('exports the Zag-based T2 components', () => {
    for (const name of [
      'TSelect',
      'TCombobox',
      'TSlider',
      'TToaster',
      'TPopover',
      'TPopoverTrigger',
      'TPopoverContent',
      'TDropdownMenu',
      'TDropdownMenuTrigger',
      'TDropdownMenuContent',
      'TDropdownMenuItem',
      'TDropdownMenuSeparator',
      'TAlertDialog',
      'TAlertDialogTrigger',
      'TAlertDialogContent',
      'TAlertDialogCancel',
      'TAlertDialogAction',
      'TAccordion',
      'TAccordionItem',
      'TAccordionTrigger',
      'TAccordionContent',
    ]) {
      expect(names, name).toContain(name);
    }
  });
});
