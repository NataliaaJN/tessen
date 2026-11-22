// Editorial copy that the contracts do not carry: when to use a component and what to use instead.
// Keyed by slug. `docs:check` does not cover this file; a missing entry simply hides the section.

export interface Editorial {
  /** One sentence: the job the component does. */
  use: string;
  /** When another component is the better choice: `[slug, why]`. */
  instead?: [string, string][];
  /** Content and usage rules, each short enough to scan. */
  rules?: string[];
}

export const editorial: Record<string, Editorial> = {
  accordion: {
    use: 'Stack sections of related content so people can reveal only what they need.',
    instead: [['tabs', 'Sections are peers and one should always be visible.']],
    rules: ['Keep trigger labels short and distinct.', 'Do not hide content people need to compare.'],
  },
  alert: {
    use: 'Show a message that stays in the page flow and is tied to its surroundings.',
    instead: [['toast', 'The message is temporary and not tied to a place on the page.']],
    rules: ['Say what happened and what to do next.', 'Use the tone that matches severity, not colour taste.'],
  },
  'alert-dialog': {
    use: 'Interrupt to confirm a destructive or irreversible action.',
    instead: [['dialog', 'There is no risky decision to confirm.']],
    rules: ['Name the action on the confirm button ("Delete", not "OK").', 'Put the safe choice first for focus.'],
  },
  'aspect-ratio': {
    use: 'Reserve a box with a fixed proportion for media or previews.',
    rules: ['Use it to avoid layout shift while images load.'],
  },
  avatar: {
    use: 'Represent a person or entity with an image, or initials as a fallback.',
    rules: ['Always provide a name so initials and the accessible name are correct.'],
  },
  badge: {
    use: 'Label status or a count next to other content.',
    instead: [['button', 'The element is interactive.']],
    rules: ['One or two words. Do not rely on colour alone to carry meaning.'],
  },
  breadcrumbs: {
    use: 'Show where the current page sits in a hierarchy and let people go up.',
    instead: [['tabs', 'You are switching views at the same level.']],
    rules: ['Mark the last item as current. Do not repeat the page title as a link.'],
  },
  button: {
    use: 'Trigger an action in the current context.',
    instead: [
      ['link', 'The action navigates to another page.'],
      ['icon-button', 'The control is an icon without a visible label.'],
    ],
    rules: ['Start with a verb. One primary button per view.', 'Use `loading` instead of swapping the label.'],
  },
  'button-group': {
    use: 'Group related buttons so they read and size as one control.',
    rules: ['Give the group an accessible name when its buttons are toggles.'],
  },
  card: {
    use: 'Contain a self-contained piece of related content and actions.',
    rules: ['Do not nest cards. Keep one main action per card.'],
  },
  checkbox: {
    use: 'Let people turn one or several options on or off, or accept something.',
    instead: [
      ['switch', 'The change takes effect immediately.'],
      ['radio-group', 'Exactly one option may be chosen.'],
    ],
    rules: ['The label states the positive option. Use indeterminate only for parent selections.'],
  },
  combobox: {
    use: 'Pick from a long list while typing to filter it.',
    instead: [['select', 'The list is short and filtering is not needed.']],
    rules: ['Always set a label. Show a clear empty state when nothing matches.'],
  },
  container: {
    use: 'Constrain content width and add page gutters.',
    rules: ['Use the narrowest size that keeps lines readable.'],
  },
  dialog: {
    use: 'Focus attention on a task or content that needs its own space.',
    instead: [
      ['popover', 'The content is small and tied to its trigger.'],
      ['alert-dialog', 'The user must confirm a risky action.'],
    ],
    rules: ['Always include a title. Offer a visible way to close.'],
  },
  divider: {
    use: 'Separate groups of content visually and semantically.',
    rules: ['Prefer spacing first; add a divider only when grouping is unclear.'],
  },
  'dropdown-menu': {
    use: 'Offer a list of actions from a single trigger.',
    instead: [['select', 'The choice sets a value in a form.']],
    rules: ['Items are actions, not navigation. Put destructive items last.'],
  },
  'empty-state': {
    use: 'Explain why there is nothing to show and what to do about it.',
    rules: ['Say what is missing and offer the next step.'],
  },
  field: {
    use: 'Connect a label, description and error to one form control.',
    rules: ['Every control needs a label. Write errors as how to fix, not only what failed.'],
  },
  grid: {
    use: 'Lay items out in equal columns.',
    instead: [['stack', 'Items flow in a single row or column.']],
  },
  'icon-button': {
    use: 'Trigger an action with an icon when space is tight.',
    instead: [['button', 'A text label fits and makes the action clearer.']],
    rules: ['`label` is required: it is the accessible name.'],
  },
  input: {
    use: 'Collect a single line of free text.',
    instead: [['textarea', 'The answer needs several lines.']],
    rules: ['Pair it with a Field. A placeholder is not a label.'],
  },
  link: {
    use: 'Navigate to another page or place.',
    instead: [['button', 'The action changes something in place.']],
    rules: ['Make the text describe the destination. Mark external links.'],
  },
  list: {
    use: 'Present a series of related items.',
    instead: [['table', 'Each item has several attributes to compare.']],
  },
  'native-select': {
    use: 'Pick one option using the platform control.',
    instead: [['select', 'You need custom option rendering or search.']],
    rules: ['Best on touch devices and for short, plain lists.'],
  },
  pagination: {
    use: 'Move through a large result set in pages.',
    rules: ['Give it an accessible name. Keep page size predictable.'],
  },
  popover: {
    use: 'Show non-modal content anchored to its trigger.',
    instead: [
      ['tooltip', 'The content is a short, non-interactive hint.'],
      ['dialog', 'The task needs the whole screen focus.'],
    ],
  },
  progress: {
    use: 'Show how far a known or unknown operation has got.',
    instead: [['spinner', 'You only need to say that something is loading.']],
    rules: ['Always set an accessible label for what is progressing.'],
  },
  'radio-group': {
    use: 'Choose exactly one option from a short list.',
    instead: [
      ['select', 'There are more than about six options.'],
      ['checkbox', 'Several options may be chosen.'],
    ],
  },
  select: {
    use: 'Choose one value from a list of options.',
    instead: [
      ['radio-group', 'There are few options and they should all be visible.'],
      ['combobox', 'The list is long and people should be able to search.'],
    ],
  },
  skeleton: {
    use: 'Hold the shape of content that is still loading.',
    rules: ['Match the size of the real content to avoid layout shift.'],
  },
  slider: {
    use: 'Pick a number within a range by dragging.',
    rules: ['Show the current value. Offer an input when precision matters.'],
  },
  spinner: {
    use: 'Signal that something short is loading.',
    instead: [['progress', 'The duration or amount is known.']],
  },
  stack: {
    use: 'Space items evenly in a single row or column.',
    instead: [['grid', 'You need a column structure.']],
  },
  switch: {
    use: 'Turn a setting on or off with immediate effect.',
    instead: [['checkbox', 'The change is applied later, on submit.']],
    rules: ['The label names the setting, not the state.'],
  },
  table: {
    use: 'Compare structured data across rows and columns.',
    instead: [['list', 'Items have a single attribute.']],
    rules: ['Always add a caption. Right-align numbers.'],
  },
  tabs: {
    use: 'Switch between peer views of the same context.',
    instead: [['accordion', 'People may want several sections open at once.']],
    rules: ['Keep labels to one or two words. Do not nest tabs.'],
  },
  textarea: {
    use: 'Collect multi-line free text.',
    instead: [['input', 'A single line is enough.']],
  },
  toast: {
    use: 'Confirm a result briefly without interrupting.',
    instead: [['alert', 'The message must stay until acted on.']],
    rules: ['Never put the only copy of important information in a toast.'],
  },
  'toggle-button': {
    use: 'Switch a state on or off from a button, such as bold or mute.',
    instead: [['switch', 'It is a setting in a form.']],
  },
  tooltip: {
    use: 'Name or briefly describe a control on hover and focus.',
    instead: [['popover', 'The content is interactive or longer.']],
    rules: ['Never hide essential information in a tooltip.'],
  },
  'visually-hidden': {
    use: 'Provide text for assistive technology without showing it.',
    rules: ['Use it to name icon-only controls and add context to repeated links.'],
  },
};
