/** Contract types. Test cases are DATA, not code. */

/** Framework-neutral props used by cases; adapters map them to each idiom. */
export interface NeutralProps {
  variant?: string;
  size?: string;
  tone?: string;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: string;
  /** Default content / label text. */
  label?: string;
  /** Leading and trailing icon content (plain text in cases). */
  leading?: string;
  trailing?: string;
  /** Consumer class, merged with the component's own (never replaces it). */
  class?: string;
  /** Native attributes the consumer adds (`aria-*`, `data-*`); they reach the root. */
  attrs?: Record<string, string>;
  /** Component-specific props (value, checked, invalid, ...); adapters forward them as props. */
  extra?: Record<string, string | number | boolean>;
}

export type Step =
  | { do: 'click'; target?: string }
  | { do: 'focus'; target?: string }
  | { do: 'key'; key: string; target?: string }
  | { do: 'type'; text: string; target?: string }
  | { do: 'select'; value: string; target?: string }
  | { do: 'hover'; target?: string }
  | { do: 'unhover'; target?: string }
  /**
   * Waits until a selector is present (or gone, with `absent`): for behaviour that settles
   * asynchronously. `timeout` (ms, default 1000) is for slow timers such as toast removal.
   */
  | { do: 'wait'; selector: string; absent?: boolean; timeout?: number };

/** What to check on one element found with a CSS selector (searched in the whole document). */
export interface ElementExpectation {
  present?: boolean;
  attrs?: Record<string, string | null>;
  text?: string;
  focused?: boolean;
  role?: string;
}

/** Finds one element the way assistive technology would (role + accessible name/description). */
export interface ElementQuery {
  role: string;
  /** Accessible name (exact). */
  name?: string;
  /** Accessible description (exact). */
  description?: string;
  /** Attribute values (null = absent). */
  attrs?: Record<string, string | null>;
  /** DOM properties (checked, indeterminate, value...). */
  props?: Record<string, string | boolean>;
  focused?: boolean;
}

export interface Expectation {
  /** Accessible role of the root. */
  role?: string;
  /** Accessible name. */
  name?: string;
  /** Exact attribute values on the root (`null` = attribute must be absent). */
  attrs?: Record<string, string | null>;
  /** Number of click handler calls after the steps. */
  clicks?: number;
  /** Whether the root has focus after the steps. */
  focused?: boolean;
  /** Class names that must be present on the root. */
  classes?: string[];
  /** Selectors that must exist (or not, with `false`) inside the root. */
  parts?: Record<string, boolean>;
  /** Tag name of the root (lower case). */
  tag?: string;
  /** Text content of the root. */
  text?: string;
  /** Checks on other elements, by selector (document-wide, so portals are reachable). */
  within?: Record<string, ElementExpectation>;
  /** Elements found by role/name/description, with attribute and property checks. */
  queries?: ElementQuery[];
  /** Values the component reported through its value-change event, in order. */
  emitted?: (string | boolean)[];
}

export interface ContractCase {
  id: string;
  describe: string;
  props?: NeutralProps;
  steps?: Step[];
  expect: Expectation;
}

export interface PropSpec {
  name: string;
  type: 'enum' | 'boolean' | 'string';
  values?: readonly string[];
  default?: string | boolean;
  required?: boolean;
}

export interface Contract {
  name: string;
  /** Vue name (`TButton`) and React name (`Button`), ADR 0011. */
  names: { vue: string; react: string };
  category: string;
  tier: string;
  engine: 'native' | 'zag';
  apgPattern: string;
  anatomy: readonly string[];
  props: readonly PropSpec[];
  cases: readonly ContractCase[];
}

export function defineContract<const C extends Contract>(contract: C): C {
  return contract;
}
