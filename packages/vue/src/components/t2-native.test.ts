import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import {
  avatarContract,
  breadcrumbsContract,
  buttonGroupContract,
  emptyStateContract,
  listContract,
  paginationContract,
  progressContract,
  tableContract,
  toggleButtonContract,
} from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, type Component, type VNode } from 'vue';
import { vueAdapter } from '../../test/adapter.ts';
import { TAvatar } from './avatar/index.js';
import { TBreadcrumbItem, TBreadcrumbs } from './breadcrumbs/index.js';
import { TEmptyState } from './empty-state/index.js';
import { TList, TListItem } from './list/index.js';
import { TPagination } from './pagination/index.js';
import { TProgress } from './progress/index.js';
import {
  TTable,
  TTableBody,
  TTableCaption,
  TTableCell,
  TTableHead,
  TTableHeaderCell,
  TTableRow,
} from './table/index.js';
import { TButtonGroup, TToggleButton } from './toggle-button/index.js';

/** A fixture: `component` with the given children, attributes and props passed straight through. */
function fixture(name: string, component: Component, children: () => VNode[]) {
  return defineComponent({
    name,
    setup:
      (_props, { attrs }) =>
      () =>
        h(component, attrs, children),
  });
}

// Fixtures of the contracts (compound components) ---------------------------------------------
const EmptyFixture = defineComponent({
  name: 'EmptyFixture',
  setup:
    (_props, { attrs }) =>
    () =>
      h(TEmptyState, { title: 'No projects', description: 'Create one to start.', ...attrs }, () =>
        h('button', { type: 'button' }, 'Create'),
      ),
});
const ListFixture = fixture('ListFixture', TList, () => [
  h(TListItem, null, () => 'Apples'),
  h(TListItem, null, () => 'Pears'),
  h(TListItem, null, () => 'Plums'),
]);
const CrumbsFixture = fixture('CrumbsFixture', TBreadcrumbs, () => [
  h(TBreadcrumbItem, { href: '/' }, () => 'Home'),
  h(TBreadcrumbItem, { href: '/docs' }, () => 'Docs'),
  h(TBreadcrumbItem, { current: true }, () => 'Button'),
]);
const GroupFixture = defineComponent({
  name: 'GroupFixture',
  setup:
    (_props, { attrs }) =>
    () =>
      h(TButtonGroup, { 'aria-label': 'Alignment', ...attrs }, () => [
        h(TToggleButton, null, () => 'Left'),
        h(TToggleButton, null, () => 'Center'),
        h(TToggleButton, null, () => 'Right'),
      ]),
});
const TableFixture = fixture('TableFixture', TTable, () => [
  h(TTableCaption, null, () => 'Team'),
  h(TTableHead, null, () =>
    h(TTableRow, null, () => [
      h(TTableHeaderCell, null, () => 'Name'),
      h(TTableHeaderCell, { numeric: true }, () => 'Role'),
    ]),
  ),
  h(TTableBody, null, () =>
    h(TTableRow, null, () => [
      h(TTableCell, null, () => 'Ada'),
      h(TTableCell, { numeric: true }, () => 'Admin'),
    ]),
  ),
]);

const none = { labelAs: 'none' } as const;
runContract(progressContract, vueAdapter('Vue (VTU)', TProgress, none));
runContract(avatarContract, vueAdapter('Vue (VTU)', TAvatar, none));
runContract(
  paginationContract,
  vueAdapter('Vue (VTU)', TPagination, { ...none, valueEvent: 'onUpdate:page' }),
);
runContract(
  toggleButtonContract,
  vueAdapter('Vue (VTU)', TToggleButton, { valueEvent: 'onUpdate:pressed' }),
);
runContract(buttonGroupContract, vueAdapter('Vue (VTU)', GroupFixture, none));
runContract(emptyStateContract, vueAdapter('Vue (VTU)', EmptyFixture, none));
runContract(listContract, vueAdapter('Vue (VTU)', ListFixture, none));
runContract(breadcrumbsContract, vueAdapter('Vue (VTU)', CrumbsFixture, none));
runContract(tableContract, vueAdapter('Vue (VTU)', TableFixture, none));

describe('TProgress · behaviour', () => {
  it('sizes the bar from the value', () => {
    const wrapper = mount(TProgress, { props: { value: 25, 'aria-label': 'Upload' } });
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--_value')).toBe('25%');
  });
});

describe('TAvatar · behaviour', () => {
  it('falls back to the initials when the image fails and recovers with a new source', async () => {
    const wrapper = mount(TAvatar, { props: { name: 'Ada Lovelace', src: '/a.png' } });
    await wrapper.find('img').trigger('error');
    expect(wrapper.attributes('data-state')).toBe('fallback');
    expect(wrapper.text()).toBe('AL');
    await wrapper.setProps({ src: '/b.png' });
    expect(wrapper.attributes('data-state')).toBe('image');
  });
});

describe('TPagination · behaviour', () => {
  it('is controlled with v-model:page', async () => {
    const seen: number[] = [];
    const wrapper = mount(TPagination, {
      props: {
        pageCount: 5,
        page: 2,
        'onUpdate:page': (p?: number) => void (p !== undefined && seen.push(p)),
      },
      attachTo: document.body,
    });
    await userEvent.setup().click(wrapper.find('[data-page="4"]').element);
    expect(seen).toEqual([4]);
    expect(wrapper.find('[data-page="2"]').attributes('aria-current')).toBe('page');
    wrapper.unmount();
  });

  it('translates the arrows', () => {
    const wrapper = mount(TPagination, {
      props: { pageCount: 3, previousLabel: 'Anterior', nextLabel: 'Siguiente' },
    });
    expect(wrapper.find('[data-part="previous"]').attributes('aria-label')).toBe('Anterior');
    expect(wrapper.find('[data-part="previous"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[data-part="next"]').attributes('aria-label')).toBe('Siguiente');
  });
});

describe('TBreadcrumbs · behaviour', () => {
  it('uses a custom label for the landmark', () => {
    const wrapper = mount(CrumbsFixture, { props: { 'aria-label': 'Ruta' } });
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Ruta');
  });
});

describe('TEmptyState · behaviour', () => {
  it('omits the optional parts', () => {
    const wrapper = mount(TEmptyState, { props: { title: 'Nothing' } });
    for (const part of ['description', 'actions', 'icon'])
      expect(wrapper.find(`.t-empty-state__${part}`).exists()).toBe(false);
  });
});

describe('T2 native components · axe', () => {
  const cases: [string, Component, Record<string, unknown>][] = [
    ['TProgress indeterminate', TProgress, { 'aria-label': 'Upload' }],
    ['TProgress determinate', TProgress, { 'aria-label': 'Upload', value: 60, tone: 'danger' }],
    ['TAvatar initials', TAvatar, { name: 'Ada Lovelace' }],
    ['TAvatar image', TAvatar, { src: '/a.png', alt: 'Ada' }],
    ['TPagination', TPagination, { 'aria-label': 'Results', pageCount: 4 }],
    [
      'TPagination truncated',
      TPagination,
      { 'aria-label': 'Results', pageCount: 30, defaultPage: 15 },
    ],
    ['TToggleButton off', TToggleButton, {}],
    ['TToggleButton on', TToggleButton, { defaultPressed: true }],
    ['TButtonGroup', GroupFixture, { attached: true }],
    ['TEmptyState', EmptyFixture, {}],
    ['TList divided', ListFixture, { variant: 'divided' }],
    ['TList ordered', ListFixture, { variant: 'bulleted', ordered: true }],
    ['TBreadcrumbs', CrumbsFixture, {}],
    ['TTable', TableFixture, { density: 'compact', striped: true }],
  ];
  it.each(cases)('%s has no violations', async (name, component, props) => {
    const wrapper = mount(component, {
      props: props as never,
      slots: name.includes('ToggleButton') ? { default: 'Bold' } : {},
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
