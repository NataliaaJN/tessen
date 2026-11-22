/**
 * Snippet codegen (the future `@tessen-ui/core` `codegen`): one neutral description in,
 * idiomatic Vue or React usage out. Driven by the contract's prop list, so defaults are omitted.
 */
import type { Contract, NeutralProps } from './contract.ts';

export type Framework = 'vue' | 'react';

function attrs(contract: Contract, props: NeutralProps): string[] {
  const out: string[] = [];
  for (const spec of contract.props) {
    const value = (props as Record<string, unknown>)[spec.name];
    if (value === undefined || value === spec.default) continue;
    if (spec.type === 'boolean') {
      if (value === true) out.push(spec.name); // `block` / `disabled` shorthand is valid in both
    } else {
      out.push(`${spec.name}="${String(value)}"`);
    }
  }
  return out;
}

export function generateSnippet(
  contract: Contract,
  framework: Framework,
  props: NeutralProps = {},
): string {
  const tag = contract.names[framework];
  const open = [tag, ...attrs(contract, props)];
  if (framework === 'react') {
    if (props.leading) open.push(`leadingIcon="${props.leading}"`);
    if (props.trailing) open.push(`trailingIcon="${props.trailing}"`);
    return `<${open.join(' ')}>${props.label ?? ''}</${tag}>`;
  }
  const slots = [
    props.leading ? `  <template #leading>${props.leading}</template>\n` : '',
    props.trailing ? `  <template #trailing>${props.trailing}</template>\n` : '',
  ].join('');
  if (!slots) return `<${open.join(' ')}>${props.label ?? ''}</${tag}>`;
  return `<${open.join(' ')}>\n${slots}  ${props.label ?? ''}\n</${tag}>`;
}
