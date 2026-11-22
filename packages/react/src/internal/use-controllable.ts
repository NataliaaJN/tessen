import { useCallback, useRef, useState, type Ref, type RefCallback } from 'react';

/**
 * Controlled/uncontrolled state with one API: `value` wins when given, otherwise `defaultValue`
 * seeds internal state. `onChange` runs on every change either way.
 */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [controlled ? value : inner, set];
}

/** Assigns one node to several refs (the consumer's and the component's own). */
export function useMergedRef<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  const latest = useRef(refs);
  latest.current = refs;
  return useCallback((node: T | null) => {
    for (const ref of latest.current) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  }, []);
}
