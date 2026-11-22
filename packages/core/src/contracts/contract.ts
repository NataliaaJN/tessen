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
}

export type Step = { do: 'click' } | { do: 'focus' } | { do: 'key'; key: 'Enter' | 'Space' };

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
