// Type-level check of the public API under `moduleResolution: NodeNext` (no bundler).
// If a declaration is missing or an `exports` condition is wrong, `tsc` fails here.
import { generateSnippet as sameCodegen } from '@tessen-ui/core/codegen';
import { defineContract, defineVariants, generateSnippet } from '@tessen-ui/core';
import { buttonContract, buttonVariants } from '@tessen-ui/core/contracts';
import { buttonContract as sameContract } from '@tessen-ui/core/contracts/button';
import { defineVariants as sameVariants } from '@tessen-ui/core/variants';
import { CheckIcon } from '@tessen-ui/icons/react';
import { presets } from '@tessen-ui/motion';
import { tokens } from '@tessen-ui/tokens';

const className: string = buttonVariants({ variant: 'outline', size: 'sm' }).class;
// @ts-expect-error `huge` is not a Button size: the variant types must reach the consumer.
buttonVariants({ size: 'huge' });

const snippet: string = generateSnippet(buttonContract, 'react', { label: 'Save' });
const white: string = tokens.color.white;

export {
  CheckIcon,
  className,
  defineContract,
  defineVariants,
  presets,
  sameCodegen,
  sameContract,
  sameVariants,
  snippet,
  white,
};
