/**
 * Props of `TButton`. The literal unions mirror `buttonContract` (`@tessen-ui/core`): Vue's
 * compiler cannot resolve types from another package, so `button.test.ts` checks at type level
 * that they stay equal to `ButtonVariantProps`.
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'danger';
  block?: boolean;
  disabled?: boolean;
  /** Shows a spinner, sets `aria-busy`/`aria-disabled` and ignores clicks, keeping focus. */
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
