import {
  accordionContract,
  alertContract,
  alertDialogContract,
  aspectRatioContract,
  avatarContract,
  badgeContract,
  breadcrumbsContract,
  buttonContract,
  buttonGroupContract,
  cardContract,
  checkboxContract,
  comboboxContract,
  containerContract,
  dialogContract,
  dividerContract,
  dropdownMenuContract,
  emptyStateContract,
  fieldContract,
  gridContract,
  iconButtonContract,
  inputContract,
  linkContract,
  listContract,
  nativeSelectContract,
  paginationContract,
  popoverContract,
  progressContract,
  radioGroupContract,
  selectContract,
  skeletonContract,
  sliderContract,
  spinnerContract,
  stackContract,
  switchContract,
  tableContract,
  tabsContract,
  textareaContract,
  toastContract,
  toggleButtonContract,
  tooltipContract,
  visuallyHiddenContract,
} from '@tessen-ui/core';
import type { SceneNode } from '@tessen-ui/core';
import { defineRecipe, flag, h, num, text, withSlots } from './define.ts';
import type { Recipe } from './types.ts';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

const fill = {
  display: 'grid',
  placeItems: 'center',
  blockSize: '100%',
  background: 'var(--tessen-color-surface-subtle)',
};

const word = (s: string | number | boolean): string => String(s);

// ── Actions ─────────────────────────────────────────────────────────────────
const button = defineRecipe({
  contract: buttonContract,
  controls: [text('text', 'Text', 'Button')],
  build: (s, root) => h('Button', root, word(s['text'] ?? '')),
});

const buttonGroup = defineRecipe({
  contract: buttonGroupContract,
  defaults: { attached: true },
  build: (_s, root) =>
    h(
      'ButtonGroup',
      { 'aria-label': 'Align', ...root },
      h('ToggleButton', {}, 'Left'),
      h('ToggleButton', { defaultPressed: true }, 'Center'),
      h('ToggleButton', {}, 'Right'),
    ),
});

const iconButton = defineRecipe({
  contract: iconButtonContract,
  defaults: { label: 'Close' },
  controls: [text('icon', 'Icon', '×')],
  build: (s, root) => h('IconButton', root, word(s['icon'] ?? '')),
});

const link = defineRecipe({
  contract: linkContract,
  controls: [text('href', 'Href', '/components/'), text('text', 'Text', 'Components')],
  build: (s, root) => h('Link', { ...root, href: word(s['href'] ?? '') }, word(s['text'] ?? '')),
});

const toggleButton = defineRecipe({
  contract: toggleButtonContract,
  controls: [flag('defaultPressed', 'Pressed at start'), text('text', 'Text', 'Bold')],
  build: (s, root) =>
    h(
      'ToggleButton',
      { ...root, defaultPressed: s['defaultPressed'] === true ? true : undefined },
      word(s['text'] ?? ''),
    ),
});

// ── Feedback ────────────────────────────────────────────────────────────────
const spinner = defineRecipe({
  contract: spinnerContract,
  build: (_s, root) => h('Spinner', root),
});

const alert = defineRecipe({
  contract: alertContract,
  defaults: { title: 'Heads up' },
  controls: [text('text', 'Text', 'Something you should know.')],
  build: (s, root) => h('Alert', root, word(s['text'] ?? '')),
});

const badge = defineRecipe({
  contract: badgeContract,
  controls: [text('text', 'Text', 'Badge')],
  build: (s, root) => h('Badge', root, word(s['text'] ?? '')),
});

const progress = defineRecipe({
  contract: progressContract,
  controls: [
    flag('indeterminate', 'Indeterminate'),
    num('value', 'Value', 40, { min: 0, max: 100 }),
  ],
  build: (s, root) =>
    h('Progress', {
      'aria-label': 'Upload',
      ...root,
      value: s['indeterminate'] === true ? undefined : Number(s['value']),
    }),
});

const skeleton = defineRecipe({
  contract: skeletonContract,
  build: (s, root) =>
    h('Skeleton', {
      ...root,
      style:
        s['shape'] === 'circle'
          ? { inlineSize: '3rem', blockSize: '3rem' }
          : { inlineSize: '16rem', blockSize: '1rem' },
    }),
});

const toast = defineRecipe({
  contract: toastContract,
  controls: [
    text('title', 'Toast title', 'Saved'),
    text('description', 'Toast text', 'Changes stored'),
  ],
  build: (s, root) => ({
    setup: {
      uses: ['createToaster'],
      lines: ['const toaster = createToaster();'],
      names: ['toaster'],
    },
    root: h(
      'div',
      {},
      h(
        'Button',
        {
          onClick: {
            $expr: `() => toaster.create({ title: '${word(s['title'] ?? '').replace(/'/g, "\\'")}', description: '${word(s['description'] ?? '').replace(/'/g, "\\'")}' })`,
          },
        },
        'Notify',
      ),
      h('Toaster', { ...root, toaster: { $expr: 'toaster' } }),
    ),
  }),
});

const emptyState = defineRecipe({
  contract: emptyStateContract,
  defaults: { title: 'No projects', description: 'Create one to start.' },
  controls: [text('icon', 'Icon', '★')],
  build: (s, root) => {
    const node = h('EmptyState', root, h('Button', {}, 'Create'));
    return s['icon'] ? withSlots(node, { icon: [word(s['icon'])] }) : node;
  },
});

// ── Forms ───────────────────────────────────────────────────────────────────
const field = defineRecipe({
  contract: fieldContract,
  build: (_s, root) =>
    h(
      'Field',
      root,
      h('FieldLabel', {}, 'Email'),
      h('Input', { type: 'email', placeholder: 'you@example.com' }),
      h('FieldDescription', {}, 'We never share it.'),
      h('FieldError', {}, 'Enter a valid email'),
    ),
});

const input = defineRecipe({
  contract: inputContract,
  controls: [
    {
      kind: 'select',
      name: 'type',
      label: 'Type',
      options: ['text', 'email', 'password', 'search', 'number', 'url'],
      default: 'text',
    },
  ],
  defaults: { placeholder: 'Type here' },
  build: (_s, root) => h('Input', { 'aria-label': 'Example input', ...root }),
});

const textarea = defineRecipe({
  contract: textareaContract,
  defaults: { placeholder: 'Anything we should know?' },
  build: (_s, root) => h('Textarea', { 'aria-label': 'Notes', ...root }),
});

const nativeSelect = defineRecipe({
  contract: nativeSelectContract,
  build: (_s, root) =>
    h(
      'Field',
      {},
      h('FieldLabel', {}, 'Country'),
      h(
        'NativeSelect',
        { ...root, defaultValue: 'fr' },
        h('option', { value: 'es' }, 'Spain'),
        h('option', { value: 'fr' }, 'France'),
      ),
    ),
});

const checkbox = defineRecipe({
  contract: checkboxContract,
  controls: [flag('defaultChecked', 'Checked at start'), text('text', 'Text', 'Accept terms')],
  build: (s, root) =>
    h(
      'Checkbox',
      { ...root, defaultChecked: s['defaultChecked'] === true ? true : undefined },
      word(s['text'] ?? ''),
    ),
});

const radioGroup = defineRecipe({
  contract: radioGroupContract,
  build: (_s, root) =>
    h(
      'RadioGroup',
      { 'aria-label': 'Plan', defaultValue: 'pro', ...root },
      h('Radio', { value: 'free' }, 'Free'),
      h('Radio', { value: 'pro' }, 'Pro'),
      h('Radio', { value: 'team' }, 'Team'),
    ),
});

const switchRecipe = defineRecipe({
  contract: switchContract,
  controls: [flag('defaultChecked', 'On at start'), text('text', 'Text', 'Notifications')],
  build: (s, root) =>
    h(
      'Switch',
      { ...root, defaultChecked: s['defaultChecked'] === true ? true : undefined },
      word(s['text'] ?? ''),
    ),
});

const select = defineRecipe({
  contract: selectContract,
  defaults: { label: 'Fruit', placeholder: 'Choose a fruit' },
  build: (_s, root) => h('Select', { ...root, items: fruits }),
});

const combobox = defineRecipe({
  contract: comboboxContract,
  defaults: { label: 'Search fruit', placeholder: 'Type to filter' },
  build: (_s, root) => h('Combobox', { ...root, items: fruits }),
});

const slider = defineRecipe({
  contract: sliderContract,
  defaults: { label: 'Volume' },
  controls: [
    num('defaultValue', 'Start value', 40, { min: 0, max: 100 }),
    num('min', 'Min', 0),
    num('max', 'Max', 100),
    num('step', 'Step', 1, { min: 1 }),
  ],
  build: (_s, root) => h('Slider', { ...root, style: { maxInlineSize: '20rem' } }),
});

// ── Overlays ────────────────────────────────────────────────────────────────
// `size` is listed on the contract's root but both frameworks take it on the content part.
const dialog = defineRecipe({
  contract: dialogContract,
  build: (_s, { size, ...root }) =>
    h(
      'Dialog',
      root,
      h('DialogTrigger', {}, 'Delete account'),
      h(
        'DialogContent',
        { size },
        h('DialogTitle', {}, 'Delete account?'),
        h('DialogDescription', {}, 'This cannot be undone.'),
        h('DialogClose', {}, 'Cancel'),
      ),
    ),
});

const alertDialog = defineRecipe({
  contract: alertDialogContract,
  build: (_s, { size, ...root }) =>
    h(
      'AlertDialog',
      root,
      h('AlertDialogTrigger', {}, 'Delete item'),
      h(
        'AlertDialogContent',
        { size },
        h('AlertDialogTitle', {}, 'Delete item?'),
        h('AlertDialogDescription', {}, 'This cannot be undone.'),
        h('AlertDialogCancel', {}, 'Keep'),
        h('AlertDialogAction', { tone: 'danger' }, 'Remove'),
      ),
    ),
});

const popover = defineRecipe({
  contract: popoverContract,
  build: (_s, root) =>
    h(
      'Popover',
      root,
      h('PopoverTrigger', {}, 'Details'),
      h(
        'PopoverContent',
        {},
        h('PopoverTitle', {}, 'Shipping'),
        h('PopoverDescription', {}, 'Arrives in two days.'),
        h('PopoverClose', {}, 'Close'),
      ),
    ),
});

const dropdownMenu = defineRecipe({
  contract: dropdownMenuContract,
  build: (_s, root) =>
    h(
      'DropdownMenu',
      root,
      h('DropdownMenuTrigger', {}, 'Actions'),
      h(
        'DropdownMenuContent',
        {},
        h('DropdownMenuItem', { value: 'edit' }, 'Edit'),
        h('DropdownMenuItem', { value: 'duplicate', disabled: true }, 'Duplicate'),
        h('DropdownMenuSeparator'),
        h('DropdownMenuItem', { value: 'delete' }, 'Delete'),
      ),
    ),
});

const tooltip = defineRecipe({
  contract: tooltipContract,
  controls: [text('text', 'Tooltip text', 'Save the file')],
  build: (s, root) =>
    h(
      'Tooltip',
      root,
      h('TooltipTrigger', {}, 'Save'),
      h('TooltipContent', {}, word(s['text'] ?? '')),
    ),
});

// ── Navigation and disclosure ───────────────────────────────────────────────
const tabs = defineRecipe({
  contract: tabsContract,
  build: (_s, root) =>
    h(
      'Tabs',
      { defaultValue: 'b', ...root },
      h(
        'TabList',
        { 'aria-label': 'Sections' },
        h('Tab', { value: 'a' }, 'Account'),
        h('Tab', { value: 'b' }, 'Billing'),
        h('Tab', { value: 'c' }, 'Team'),
      ),
      h('TabPanel', { value: 'a' }, 'Account panel'),
      h('TabPanel', { value: 'b' }, 'Billing panel'),
      h('TabPanel', { value: 'c' }, 'Team panel'),
    ),
});

const accordion = defineRecipe({
  contract: accordionContract,
  build: (_s, root) =>
    h(
      'Accordion',
      { defaultValue: ['one'], ...root },
      h(
        'AccordionItem',
        { value: 'one' },
        h('AccordionTrigger', {}, 'First'),
        h('AccordionContent', {}, 'First content'),
      ),
      h(
        'AccordionItem',
        { value: 'two' },
        h('AccordionTrigger', {}, 'Second'),
        h('AccordionContent', {}, 'Second content'),
      ),
    ),
});

const breadcrumbs = defineRecipe({
  contract: breadcrumbsContract,
  build: (_s, root) =>
    h(
      'Breadcrumbs',
      root,
      h('BreadcrumbItem', { href: '/' }, 'Home'),
      h('BreadcrumbItem', { href: '/components/' }, 'Components'),
      h('BreadcrumbItem', { current: true }, 'Button'),
    ),
});

const pagination = defineRecipe({
  contract: paginationContract,
  controls: [
    num('pageCount', 'Pages', 20, { min: 1 }),
    num('defaultPage', 'Start page', 10, { min: 1 }),
  ],
  build: (_s, root) => h('Pagination', { 'aria-label': 'Results', ...root }),
});

// ── Data display ────────────────────────────────────────────────────────────
const avatar = defineRecipe({
  contract: avatarContract,
  controls: [text('name', 'Name', 'Ada Lovelace')],
  build: (_s, root) => h('Avatar', root),
});

const card = defineRecipe({
  contract: cardContract,
  controls: [
    text('header', 'Header', 'Card title'),
    text('footer', 'Footer', ''),
    text('text', 'Body', 'Card content goes here.'),
  ],
  build: (s, root) => {
    const slots: Record<string, string[]> = {};
    if (s['header']) slots['header'] = [word(s['header'])];
    if (s['footer']) slots['footer'] = [word(s['footer'])];
    const node = h('Card', root, word(s['text'] ?? ''));
    return Object.keys(slots).length > 0 ? withSlots(node, slots) : node;
  },
});

const list = defineRecipe({
  contract: listContract,
  build: (_s, root) =>
    h(
      'List',
      { ...root, style: { inlineSize: '12rem' } },
      h('ListItem', {}, 'Apples'),
      h('ListItem', {}, 'Pears'),
      h('ListItem', {}, 'Plums'),
    ),
});

const table = defineRecipe({
  contract: tableContract,
  build: (_s, root) =>
    h(
      'Table',
      root,
      h('TableCaption', {}, 'Team'),
      h(
        'TableHead',
        {},
        h(
          'TableRow',
          {},
          h('TableHeaderCell', {}, 'Name'),
          h('TableHeaderCell', { numeric: true }, 'Seats'),
        ),
      ),
      h(
        'TableBody',
        {},
        h('TableRow', {}, h('TableCell', {}, 'Ada'), h('TableCell', { numeric: true }, '12')),
        h('TableRow', {}, h('TableCell', {}, 'Grace'), h('TableCell', { numeric: true }, '3')),
        h('TableRow', {}, h('TableCell', {}, 'Linus'), h('TableCell', { numeric: true }, '7')),
      ),
    ),
});

// ── Layout ──────────────────────────────────────────────────────────────────
const stack = defineRecipe({
  contract: stackContract,
  build: (_s, root) =>
    h(
      'Stack',
      root,
      h('Button', {}, 'One'),
      h('Button', { variant: 'outline' }, 'Two'),
      h('Button', { variant: 'ghost' }, 'Three'),
    ),
});

const container = defineRecipe({
  contract: containerContract,
  build: (_s, root) =>
    h('Container', root, h('p', {}, 'A container keeps the line length readable.')),
});

const grid = defineRecipe({
  contract: gridContract,
  defaults: { columns: '3' },
  build: (_s, root) =>
    h('Grid', root, ...['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((n) => h('Card', {}, n))),
});

const aspectRatio = defineRecipe({
  contract: aspectRatioContract,
  build: (_s, root) =>
    h(
      'div',
      { style: { inlineSize: '12rem' } },
      h('AspectRatio', root, h('div', { style: fill }, 'Ratio')),
    ),
});

const divider = defineRecipe({
  contract: dividerContract,
  build: (s, root): SceneNode =>
    s['orientation'] === 'vertical'
      ? h(
          'div',
          { style: { display: 'flex', gap: '0.75rem', alignItems: 'stretch', blockSize: '2rem' } },
          h('span', {}, 'One'),
          h('Divider', root),
          h('span', {}, 'Two'),
        )
      : h(
          'div',
          { style: { inlineSize: '16rem' } },
          h('p', {}, 'Above'),
          h('Divider', root),
          h('p', {}, 'Below'),
        ),
});

const visuallyHidden = defineRecipe({
  contract: visuallyHiddenContract,
  build: (_s, root) =>
    h(
      'p',
      {},
      'You can read this, ',
      h('VisuallyHidden', root, 'but this is only for screen readers, '),
      'and Tab shows it when it is focusable.',
    ),
});

export const recipes: Recipe[] = [
  button,
  buttonGroup,
  iconButton,
  link,
  toggleButton,
  spinner,
  alert,
  badge,
  progress,
  skeleton,
  toast,
  emptyState,
  field,
  input,
  textarea,
  nativeSelect,
  checkbox,
  radioGroup,
  switchRecipe,
  select,
  combobox,
  slider,
  dialog,
  alertDialog,
  popover,
  dropdownMenu,
  tooltip,
  tabs,
  accordion,
  breadcrumbs,
  pagination,
  avatar,
  card,
  list,
  table,
  stack,
  container,
  grid,
  aspectRatio,
  divider,
  visuallyHidden,
].sort((a, b) => a.name.localeCompare(b.name));

export const recipeBySlug = (slug: string): Recipe | undefined =>
  recipes.find((r) => r.slug === slug);
