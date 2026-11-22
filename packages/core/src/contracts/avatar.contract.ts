import { defineContract, type ContractCase } from './contract.ts';
import { defineVariants } from '../variants.ts';

export const avatarVariants = defineVariants({
  base: 't-avatar',
  variants: {
    size: ['xs', 'sm', 'md', 'lg', 'xl'],
    shape: ['circle', 'square'],
  },
  defaults: { size: 'md', shape: 'circle' },
});

export type AvatarVariantProps = NonNullable<Parameters<typeof avatarVariants>[0]>;

/** "Ada Lovelace" -> "AL", "ada" -> "A", "" -> "". At most two letters. */
export function avatarInitials(name: string | undefined): string {
  const words = (name ?? '').trim().split(/\s+/u).filter(Boolean);
  const first = words[0];
  if (!first) return '';
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  const letter = (word: string) => Array.from(word)[0] ?? '';
  return (letter(first) + (last ? letter(last) : '')).toUpperCase();
}

const cases: ContractCase[] = [
  {
    id: 'initials-fallback',
    describe: 'without an image it shows the initials and is named after the person',
    props: { extra: { name: 'Ada Lovelace' } },
    expect: {
      tag: 'span',
      role: 'img',
      name: 'Ada Lovelace',
      text: 'AL',
      classes: ['t-avatar'],
      attrs: { 'data-size': 'md', 'data-shape': 'circle', 'data-state': 'fallback' },
    },
  },
  {
    id: 'image',
    describe: 'with a source it renders the image, whose alt is the name',
    props: { extra: { src: '/ada.png', alt: 'Ada Lovelace' } },
    expect: {
      attrs: { 'data-state': 'image' },
      queries: [{ role: 'img', name: 'Ada Lovelace' }],
    },
  },
  {
    id: 'variants-reflect-attrs',
    describe: 'size and shape become data attributes',
    props: { extra: { name: 'Ada', size: 'xl', shape: 'square' } },
    expect: { attrs: { 'data-size': 'xl', 'data-shape': 'square' } },
  },
  {
    id: 'passthrough-class',
    describe: 'a consumer class is added to the component class',
    props: { extra: { name: 'Ada' }, class: 'custom' },
    expect: { classes: ['t-avatar', 'custom'] },
  },
];

export const avatarContract = defineContract({
  name: 'Avatar',
  names: { vue: 'TAvatar', react: 'Avatar' },
  category: 'data-display',
  tier: 'T2',
  engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/',
  anatomy: ['root', 'image', 'fallback'],
  props: [
    { name: 'src', type: 'string' },
    { name: 'alt', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'size', type: 'enum', values: avatarVariants.config.variants.size, default: 'md' },
    {
      name: 'shape',
      type: 'enum',
      values: avatarVariants.config.variants.shape,
      default: 'circle',
    },
  ],
  cases,
});
