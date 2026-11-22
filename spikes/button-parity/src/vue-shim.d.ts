declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

/** Plain CSS entry: only imported for its side effects by the harness. */
declare module '@tessen-ui/styles';
