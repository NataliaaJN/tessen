import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  Checkbox,
  Combobox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Divider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Avatar,
  BreadcrumbItem,
  Breadcrumbs,
  ButtonGroup,
  List,
  ListItem,
  Pagination,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Progress,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  ToggleButton,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Grid,
  IconButton,
  Input,
  Link,
  NativeSelect,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  createToaster,
} from '@tessen-ui/react';
import { createToaster as createVueToaster } from '@tessen-ui/vue';
import { useState, type ReactNode } from 'react';
import type { SceneName } from './scene-names.ts';

interface Scene {
  /** Vue template: components are registered globally under their `T*` names. */
  vue: string;
  /** Vue state the template needs (there is no script block in a template string). */
  vueSetup?: () => Record<string, unknown>;
  react: () => ReactNode;
}

const fruit = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

const variants = ['primary', 'secondary', 'outline', 'ghost', 'link'] as const;
const tones = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const;
const alertTones = ['info', 'success', 'warning', 'danger'] as const;
const badgeVariants = ['subtle', 'solid', 'outline'] as const;

const buttonRowsVue = variants
  .map(
    (v) =>
      `<div class="row">${(['sm', 'md', 'lg'] as const)
        .map((s) => `<TButton variant="${v}" size="${s}">${v} ${s}</TButton>`)
        .join('')}<TButton variant="${v}" tone="danger">${v} danger</TButton></div>`,
  )
  .join('');

const badgesVue = badgeVariants
  .flatMap((v) => tones.map((t) => `<TBadge variant="${v}" tone="${t}">${t}</TBadge>`))
  .join('');

const alertsVue = alertTones
  .map(
    (t) =>
      `<div style="margin-block-end:8px"><TAlert tone="${t}" title="${t} title">Body text for ${t}.</TAlert></div>`,
  )
  .join('');

export const scenes: Record<SceneName, Scene> = {
  buttons: {
    vue: `<div>${buttonRowsVue}
      <div class="row"><TButton disabled>Disabled</TButton><TButton loading>Loading</TButton><TButton variant="outline" loading>Loading</TButton></div>
      <div class="row"><TIconButton label="Close">×</TIconButton><TIconButton label="Close" variant="ghost" size="sm">×</TIconButton><TLink href="#docs">Docs link</TLink><TLink href="#out" external>External</TLink></div>
    </div>`,
    react: () => (
      <div>
        {variants.map((v) => (
          <div className="row" key={v}>
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <Button key={s} variant={v} size={s}>
                {v} {s}
              </Button>
            ))}
            <Button variant={v} tone="danger">
              {v} danger
            </Button>
          </div>
        ))}
        <div className="row">
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button variant="outline" loading>
            Loading
          </Button>
        </div>
        <div className="row">
          <IconButton label="Close">×</IconButton>
          <IconButton label="Close" variant="ghost" size="sm">
            ×
          </IconButton>
          <Link href="#docs">Docs link</Link>
          <Link href="#out" external>
            External
          </Link>
        </div>
      </div>
    ),
  },

  feedback: {
    vue: `<div>
      <div class="row">${badgesVue}</div>
      ${alertsVue}
      <div class="row" style="margin-block-start:12px"><TSpinner size="sm" /><TSpinner /><TSpinner size="lg" label="Saving" /></div>
      <TStack gap="2"><TSkeleton :animated="false" style="inline-size:240px;block-size:16px" /><TSkeleton :animated="false" shape="circle" style="inline-size:40px;block-size:40px" /></TStack>
    </div>`,
    react: () => (
      <div>
        <div className="row">
          {badgeVariants.flatMap((v) =>
            tones.map((t) => (
              <Badge key={`${v}${t}`} variant={v} tone={t}>
                {t}
              </Badge>
            )),
          )}
        </div>
        {alertTones.map((t) => (
          <div key={t} style={{ marginBlockEnd: 8 }}>
            <Alert tone={t} title={`${t} title`}>
              Body text for {t}.
            </Alert>
          </div>
        ))}
        <div className="row" style={{ marginBlockStart: 12 }}>
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" label="Saving" />
        </div>
        <Stack gap="2">
          <Skeleton animated={false} style={{ inlineSize: 240, blockSize: 16 }} />
          <Skeleton animated={false} shape="circle" style={{ inlineSize: 40, blockSize: 40 }} />
        </Stack>
      </div>
    ),
  },

  surfaces: {
    vue: `<div>
      <TGrid columns="2" gap="4">
        <TCard variant="outlined"><template #header>Outlined</template>Body<template #footer>Footer</template></TCard>
        <TCard variant="elevated" padding="lg">Elevated large</TCard>
        <TCard variant="filled" padding="sm">Filled small</TCard>
        <TCard padding="none">No padding</TCard>
      </TGrid>
      <TDivider />
      <TStack direction="horizontal" gap="3" align="center"><span>One</span><TDivider orientation="vertical" style="block-size:24px" /><span>Two</span></TStack>
    </div>`,
    react: () => (
      <div>
        <Grid columns="2" gap="4">
          <Card variant="outlined" header="Outlined" footer="Footer">
            Body
          </Card>
          <Card variant="elevated" padding="lg">
            Elevated large
          </Card>
          <Card variant="filled" padding="sm">
            Filled small
          </Card>
          <Card padding="none">No padding</Card>
        </Grid>
        <Divider />
        <Stack direction="horizontal" gap="3" align="center">
          <span>One</span>
          <Divider orientation="vertical" style={{ blockSize: 24 }} />
          <span>Two</span>
        </Stack>
      </div>
    ),
  },

  'data-display': {
    vue: `<TStack gap="4">
      <TProgress aria-label="Upload" :value="40" /><TProgress aria-label="Busy" tone="success" size="lg" /><TProgress aria-label="Danger" tone="danger" size="sm" :value="90" />
      <TStack direction="horizontal" gap="3" align="center"><TAvatar name="Ada Lovelace" size="xs" /><TAvatar name="Grace Hopper" /><TAvatar name="Alan Turing" shape="square" size="lg" /><TAvatar name="Linus" size="xl" /></TStack>
      <TBreadcrumbs><TBreadcrumbItem href="/">Home</TBreadcrumbItem><TBreadcrumbItem href="/docs">Docs</TBreadcrumbItem><TBreadcrumbItem current>Button</TBreadcrumbItem></TBreadcrumbs>
      <TPagination aria-label="Results" :page-count="20" :default-page="10" />
      <TStack direction="horizontal" gap="3"><TToggleButton>Off</TToggleButton><TToggleButton default-pressed>On</TToggleButton><TButtonGroup aria-label="Align" attached><TToggleButton>Left</TToggleButton><TToggleButton default-pressed>Center</TToggleButton><TToggleButton>Right</TToggleButton></TButtonGroup></TStack>
      <TEmptyState title="No projects" description="Create one to start."><template #icon>★</template><TButton>Create</TButton></TEmptyState>
      <TStack direction="horizontal" gap="6"><TList variant="divided" style="inline-size:200px"><TListItem>Apples</TListItem><TListItem>Pears</TListItem></TList><TList variant="bulleted" ordered><TListItem>One</TListItem><TListItem>Two</TListItem></TList></TStack>
      <TTable striped><TTableCaption>Team</TTableCaption><TTableHead><TTableRow><TTableHeaderCell>Name</TTableHeaderCell><TTableHeaderCell numeric>Seats</TTableHeaderCell></TTableRow></TTableHead><TTableBody><TTableRow><TTableCell>Ada</TTableCell><TTableCell numeric>12</TTableCell></TTableRow><TTableRow><TTableCell>Grace</TTableCell><TTableCell numeric>3</TTableCell></TTableRow></TTableBody></TTable>
    </TStack>`,
    react: () => (
      <Stack gap="4">
        <Progress aria-label="Upload" value={40} />
        <Progress aria-label="Busy" tone="success" size="lg" />
        <Progress aria-label="Danger" tone="danger" size="sm" value={90} />
        <Stack direction="horizontal" gap="3" align="center">
          <Avatar name="Ada Lovelace" size="xs" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Alan Turing" shape="square" size="lg" />
          <Avatar name="Linus" size="xl" />
        </Stack>
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
          <BreadcrumbItem current>Button</BreadcrumbItem>
        </Breadcrumbs>
        <Pagination aria-label="Results" pageCount={20} defaultPage={10} />
        <Stack direction="horizontal" gap="3">
          <ToggleButton>Off</ToggleButton>
          <ToggleButton defaultPressed>On</ToggleButton>
          <ButtonGroup aria-label="Align" attached>
            <ToggleButton>Left</ToggleButton>
            <ToggleButton defaultPressed>Center</ToggleButton>
            <ToggleButton>Right</ToggleButton>
          </ButtonGroup>
        </Stack>
        <EmptyState title="No projects" description="Create one to start." icon="★">
          <Button>Create</Button>
        </EmptyState>
        <Stack direction="horizontal" gap="6">
          <List variant="divided" style={{ inlineSize: 200 }}>
            <ListItem>Apples</ListItem>
            <ListItem>Pears</ListItem>
          </List>
          <List variant="bulleted" ordered>
            <ListItem>One</ListItem>
            <ListItem>Two</ListItem>
          </List>
        </Stack>
        <Table striped>
          <TableCaption>Team</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell numeric>Seats</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Ada</TableCell>
              <TableCell numeric>12</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Grace</TableCell>
              <TableCell numeric>3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Stack>
    ),
  },

  forms: {
    vue: `<TStack gap="4">
      <TField required><TFieldLabel>Email</TFieldLabel><TInput type="email" placeholder="you@example.com" /><TFieldDescription>We never share it.</TFieldDescription></TField>
      <TField invalid><TFieldLabel>Name</TFieldLabel><TInput default-value="x" /><TFieldError>Too short</TFieldError></TField>
      <TField disabled><TFieldLabel>Locked</TFieldLabel><TInput default-value="read only here" /></TField>
      <TField><TFieldLabel>Notes</TFieldLabel><TTextarea placeholder="Notes" /></TField>
      <TField><TFieldLabel>Country</TFieldLabel><TNativeSelect default-value="fr"><option value="es">Spain</option><option value="fr">France</option></TNativeSelect></TField>
      <TStack direction="horizontal" gap="4"><TCheckbox>Plain</TCheckbox><TCheckbox default-checked>Checked</TCheckbox><TCheckbox indeterminate>Mixed</TCheckbox><TCheckbox disabled>Disabled</TCheckbox><TCheckbox invalid>Invalid</TCheckbox></TStack>
      <TStack direction="horizontal" gap="4"><TSwitch>Off</TSwitch><TSwitch default-checked>On</TSwitch><TSwitch disabled>Disabled</TSwitch></TStack>
      <TRadioGroup aria-label="Plan" default-value="pro" orientation="horizontal"><TRadio value="free">Free</TRadio><TRadio value="pro">Pro</TRadio><TRadio value="team">Team</TRadio></TRadioGroup>
    </TStack>`,
    react: () => (
      <Stack gap="4">
        <Field required>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" placeholder="you@example.com" />
          <FieldDescription>We never share it.</FieldDescription>
        </Field>
        <Field invalid>
          <FieldLabel>Name</FieldLabel>
          <Input defaultValue="x" />
          <FieldError>Too short</FieldError>
        </Field>
        <Field disabled>
          <FieldLabel>Locked</FieldLabel>
          <Input defaultValue="read only here" />
        </Field>
        <Field>
          <FieldLabel>Notes</FieldLabel>
          <Textarea placeholder="Notes" />
        </Field>
        <Field>
          <FieldLabel>Country</FieldLabel>
          <NativeSelect defaultValue="fr">
            <option value="es">Spain</option>
            <option value="fr">France</option>
          </NativeSelect>
        </Field>
        <Stack direction="horizontal" gap="4">
          <Checkbox>Plain</Checkbox>
          <Checkbox defaultChecked>Checked</Checkbox>
          <Checkbox indeterminate>Mixed</Checkbox>
          <Checkbox disabled>Disabled</Checkbox>
          <Checkbox invalid>Invalid</Checkbox>
        </Stack>
        <Stack direction="horizontal" gap="4">
          <Switch>Off</Switch>
          <Switch defaultChecked>On</Switch>
          <Switch disabled>Disabled</Switch>
        </Stack>
        <RadioGroup aria-label="Plan" defaultValue="pro" orientation="horizontal">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
          <Radio value="team">Team</Radio>
        </RadioGroup>
      </Stack>
    ),
  },

  tabs: {
    vue: `<TTabs default-value="b">
      <TTabList aria-label="Sections"><TTab value="a">Account</TTab><TTab value="b">Billing</TTab><TTab value="c">Team</TTab></TTabList>
      <TTabPanel value="a">Account panel</TTabPanel><TTabPanel value="b">Billing panel</TTabPanel><TTabPanel value="c">Team panel</TTabPanel>
    </TTabs>`,
    react: () => (
      <Tabs defaultValue="b">
        <TabList aria-label="Sections">
          <Tab value="a">Account</Tab>
          <Tab value="b">Billing</Tab>
          <Tab value="c">Team</Tab>
        </TabList>
        <TabPanel value="a">Account panel</TabPanel>
        <TabPanel value="b">Billing panel</TabPanel>
        <TabPanel value="c">Team panel</TabPanel>
      </Tabs>
    ),
  },

  // Open on load so the parity diff covers the portal, backdrop and content layout.
  'dialog-open': {
    vue: `<TDialog default-open>
      <TDialogTrigger>Delete account</TDialogTrigger>
      <TDialogContent><TDialogTitle>Delete account?</TDialogTitle><TDialogDescription>This cannot be undone.</TDialogDescription><TDialogClose>Cancel</TDialogClose></TDialogContent>
    </TDialog>`,
    react: () => (
      <Dialog defaultOpen>
        <DialogTrigger>Delete account</DialogTrigger>
        <DialogContent>
          <DialogTitle>Delete account?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
          <DialogClose>Cancel</DialogClose>
        </DialogContent>
      </Dialog>
    ),
  },

  tooltip: {
    vue: `<div style="padding:48px 0 0">
      <TTooltip :open-delay="0" :close-delay="0"><TTooltipTrigger>Save</TTooltipTrigger><TTooltipContent>Save the file</TTooltipContent></TTooltip>
      <button id="after" type="button">After</button>
    </div>`,
    react: () => (
      <div style={{ padding: '48px 0 0' }}>
        <Tooltip openDelay={0} closeDelay={0}>
          <TooltipTrigger>Save</TooltipTrigger>
          <TooltipContent>Save the file</TooltipContent>
        </Tooltip>
        <button id="after" type="button">
          After
        </button>
      </div>
    ),
  },

  controls: {
    vueSetup: () => ({ items: fruit }),
    vue: `<TStack gap="6" style="max-inline-size:24rem">
      <TSelect label="Fruit" :items="items" default-value="cherry" />
      <TCombobox label="Search fruit" :items="items" placeholder="Type to filter" />
      <TSlider label="Volume" :default-value="40" />
      <TAccordion :default-value="['one']" variant="bordered">
        <TAccordionItem value="one"><TAccordionTrigger>First</TAccordionTrigger><TAccordionContent>First content</TAccordionContent></TAccordionItem>
        <TAccordionItem value="two"><TAccordionTrigger>Second</TAccordionTrigger><TAccordionContent>Second content</TAccordionContent></TAccordionItem>
      </TAccordion>
    </TStack>`,
    react: () => (
      <Stack gap="6" style={{ maxInlineSize: '24rem' }}>
        <Select label="Fruit" items={fruit} defaultValue="cherry" />
        <Combobox label="Search fruit" items={fruit} placeholder="Type to filter" />
        <Slider label="Volume" defaultValue={40} />
        <Accordion defaultValue={['one']} variant="bordered">
          <AccordionItem value="one">
            <AccordionTrigger>First</AccordionTrigger>
            <AccordionContent>First content</AccordionContent>
          </AccordionItem>
          <AccordionItem value="two">
            <AccordionTrigger>Second</AccordionTrigger>
            <AccordionContent>Second content</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Stack>
    ),
  },

  'select-open': {
    vueSetup: () => ({ items: fruit }),
    vue: `<TSelect label="Fruit" :items="items" default-value="apple" default-open />`,
    react: () => <Select label="Fruit" items={fruit} defaultValue="apple" defaultOpen />,
  },

  'menu-open': {
    vue: `<TDropdownMenu default-open>
      <TDropdownMenuTrigger>Actions</TDropdownMenuTrigger>
      <TDropdownMenuContent>
        <TDropdownMenuItem value="edit">Edit</TDropdownMenuItem>
        <TDropdownMenuItem value="duplicate" disabled>Duplicate</TDropdownMenuItem>
        <TDropdownMenuSeparator />
        <TDropdownMenuItem value="delete">Delete</TDropdownMenuItem>
      </TDropdownMenuContent>
    </TDropdownMenu>`,
    react: () => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem value="edit">Edit</DropdownMenuItem>
          <DropdownMenuItem value="duplicate" disabled>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem value="delete">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },

  'popover-open': {
    vue: `<div style="padding:8px 0">
      <TPopover default-open>
        <TPopoverTrigger>Details</TPopoverTrigger>
        <TPopoverContent><TPopoverTitle>Shipping</TPopoverTitle><TPopoverDescription>Arrives in two days.</TPopoverDescription><TPopoverClose>Close</TPopoverClose></TPopoverContent>
      </TPopover>
      <button id="after" type="button">After</button>
    </div>`,
    react: () => (
      <div style={{ padding: '8px 0' }}>
        <Popover defaultOpen>
          <PopoverTrigger>Details</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Shipping</PopoverTitle>
            <PopoverDescription>Arrives in two days.</PopoverDescription>
            <PopoverClose>Close</PopoverClose>
          </PopoverContent>
        </Popover>
        <button id="after" type="button">
          After
        </button>
      </div>
    ),
  },

  'alert-dialog-open': {
    vue: `<TAlertDialog default-open>
      <TAlertDialogTrigger>Delete</TAlertDialogTrigger>
      <TAlertDialogContent>
        <TAlertDialogTitle>Delete item?</TAlertDialogTitle>
        <TAlertDialogDescription>This cannot be undone.</TAlertDialogDescription>
        <TAlertDialogCancel>Keep</TAlertDialogCancel>
        <TAlertDialogAction tone="danger">Remove</TAlertDialogAction>
      </TAlertDialogContent>
    </TAlertDialog>`,
    react: () => (
      <AlertDialog defaultOpen>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Keep</AlertDialogCancel>
          <AlertDialogAction tone="danger">Remove</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },

  // A list opened inside a modal must stack above it (layer.popover over layer.modal).
  'dialog-select': {
    vueSetup: () => ({ items: fruit }),
    vue: `<TDialog default-open>
      <TDialogTrigger>Preferences</TDialogTrigger>
      <TDialogContent><TDialogTitle>Preferences</TDialogTitle><TSelect label="Fruit" :items="items" /><TDialogClose>Done</TDialogClose></TDialogContent>
    </TDialog>`,
    react: () => (
      <Dialog defaultOpen>
        <DialogTrigger>Preferences</DialogTrigger>
        <DialogContent>
          <DialogTitle>Preferences</DialogTitle>
          <Select label="Fruit" items={fruit} />
          <DialogClose>Done</DialogClose>
        </DialogContent>
      </Dialog>
    ),
  },

  toast: {
    vueSetup: () => {
      const toaster = createVueToaster();
      return {
        toaster,
        notify: () =>
          toaster.create({ title: 'Saved', description: 'Changes stored', duration: 400 }),
        pin: () => toaster.create({ title: 'Pinned', duration: Infinity }),
      };
    },
    vue: `<div><button type="button" @click="notify">Notify</button><button type="button" @click="pin">Pin</button><TToaster :toaster="toaster" /></div>`,
    react: () => <ToastScene />,
  },
};

function ToastScene() {
  const [toaster] = useState(() => createToaster());
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          toaster.create({ title: 'Saved', description: 'Changes stored', duration: 400 })
        }
      >
        Notify
      </button>
      <button type="button" onClick={() => toaster.create({ title: 'Pinned', duration: Infinity })}>
        Pin
      </button>
      <Toaster toaster={toaster} />
    </div>
  );
}
