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
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { reactAdapter } from '../../test/adapter.tsx';
import { Avatar } from './avatar/index.ts';
import { BreadcrumbItem, Breadcrumbs } from './breadcrumbs/index.ts';
import { EmptyState } from './empty-state/index.ts';
import { List, ListItem } from './list/index.ts';
import { Pagination } from './pagination/index.ts';
import { Progress } from './progress/index.ts';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from './table/index.ts';
import { ButtonGroup, ToggleButton } from './toggle-button/index.ts';

type Props = Record<string, unknown>;

// Fixtures of the contracts (compound components) ---------------------------------------------
const EmptyFixture = (props: Props) => (
  <EmptyState title="No projects" description="Create one to start." {...props}>
    <button type="button">Create</button>
  </EmptyState>
);
const ListFixture = (props: Props) => (
  <List {...props}>
    <ListItem>Apples</ListItem>
    <ListItem>Pears</ListItem>
    <ListItem>Plums</ListItem>
  </List>
);
const CrumbsFixture = (props: Props) => (
  <Breadcrumbs {...props}>
    <BreadcrumbItem href="/">Home</BreadcrumbItem>
    <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
    <BreadcrumbItem current>Button</BreadcrumbItem>
  </Breadcrumbs>
);
const GroupFixture = (props: Props) => (
  <ButtonGroup aria-label="Alignment" {...props}>
    <ToggleButton>Left</ToggleButton>
    <ToggleButton>Center</ToggleButton>
    <ToggleButton>Right</ToggleButton>
  </ButtonGroup>
);
const TableFixture = (props: Props) => (
  <Table {...props}>
    <TableCaption>Team</TableCaption>
    <TableHead>
      <TableRow>
        <TableHeaderCell>Name</TableHeaderCell>
        <TableHeaderCell numeric>Role</TableHeaderCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>Ada</TableCell>
        <TableCell numeric>Admin</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const none = { labelAs: 'none' } as const;
runContract(progressContract, reactAdapter('React (RTL)', Progress, none));
runContract(avatarContract, reactAdapter('React (RTL)', Avatar, none));
runContract(
  paginationContract,
  reactAdapter('React (RTL)', Pagination, { ...none, valueEvent: 'onPageChange' }),
);
runContract(
  toggleButtonContract,
  reactAdapter('React (RTL)', ToggleButton, { valueEvent: 'onPressedChange' }),
);
runContract(buttonGroupContract, reactAdapter('React (RTL)', GroupFixture, none));
runContract(emptyStateContract, reactAdapter('React (RTL)', EmptyFixture, none));
runContract(listContract, reactAdapter('React (RTL)', ListFixture, none));
runContract(breadcrumbsContract, reactAdapter('React (RTL)', CrumbsFixture, none));
runContract(tableContract, reactAdapter('React (RTL)', TableFixture, none));

describe('Progress · behaviour', () => {
  it('sizes the bar from the value', () => {
    const { container, unmount } = render(<Progress aria-label="Upload" value={25} />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--_value')).toBe(
      '25%',
    );
    unmount();
  });
});

describe('Avatar · behaviour', () => {
  it('falls back to the initials when the image fails and recovers with a new source', () => {
    const { container, rerender, unmount } = render(<Avatar name="Ada Lovelace" src="/a.png" />);
    const root = container.firstElementChild as HTMLElement;
    fireEvent.error(container.querySelector('img')!);
    expect(root.getAttribute('data-state')).toBe('fallback');
    expect(root.textContent).toBe('AL');
    rerender(<Avatar name="Ada Lovelace" src="/b.png" />);
    expect(root.getAttribute('data-state')).toBe('image');
    unmount();
  });
});

describe('Pagination · behaviour', () => {
  it('is controlled when `page` is given', async () => {
    const seen: number[] = [];
    const { unmount } = render(
      <Pagination aria-label="R" pageCount={5} page={2} onPageChange={(p) => seen.push(p)} />,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Page 4' }));
    expect(seen).toEqual([4]);
    expect(screen.getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBe(
      'page',
    );
    unmount();
  });

  it('translates the arrows', () => {
    const { unmount } = render(
      <Pagination pageCount={3} previousLabel="Anterior" nextLabel="Siguiente" />,
    );
    expect((screen.getByRole('button', { name: 'Anterior' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole('button', { name: 'Siguiente' }) as HTMLButtonElement).disabled).toBe(
      false,
    );
    unmount();
  });
});

describe('Breadcrumbs · behaviour', () => {
  it('uses a custom label for the landmark', () => {
    const { container, unmount } = render(<CrumbsFixture aria-label="Ruta" />);
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Ruta');
    unmount();
  });
});

describe('EmptyState · behaviour', () => {
  it('omits the optional parts', () => {
    const { container, unmount } = render(<EmptyState title="Nothing" />);
    for (const part of ['description', 'actions', 'icon'])
      expect(container.querySelector(`.t-empty-state__${part}`)).toBeNull();
    unmount();
  });
});

describe('T2 native components · axe', () => {
  const cases: [string, () => React.ReactElement][] = [
    ['Progress indeterminate', () => <Progress aria-label="Upload" />],
    ['Progress determinate', () => <Progress aria-label="Upload" value={60} tone="danger" />],
    ['Avatar initials', () => <Avatar name="Ada Lovelace" />],
    ['Avatar image', () => <Avatar src="/a.png" alt="Ada" />],
    ['Pagination', () => <Pagination aria-label="Results" pageCount={4} />],
    [
      'Pagination truncated',
      () => <Pagination aria-label="Results" pageCount={30} defaultPage={15} />,
    ],
    ['ToggleButton off', () => <ToggleButton>Bold</ToggleButton>],
    ['ToggleButton on', () => <ToggleButton defaultPressed>Bold</ToggleButton>],
    ['ButtonGroup', () => <GroupFixture attached />],
    ['EmptyState', () => <EmptyFixture icon="★" />],
    ['List divided', () => <ListFixture variant="divided" />],
    ['List ordered', () => <ListFixture variant="bulleted" ordered />],
    ['Breadcrumbs', () => <CrumbsFixture />],
    ['Table', () => <TableFixture density="compact" striped />],
  ];
  it.each(cases)('%s has no violations', async (_name, element) => {
    const { container, unmount } = render(element());
    await expectNoA11yViolations(container);
    unmount();
  });
});
