import '@tessen-ui/styles';
import '../src/css/button.css';
import { createApp, h } from 'vue';
import { createRoot } from 'react-dom/client';
import type { NeutralProps } from '../src/core/contract.ts';
import { Button } from '../src/react/Button.tsx';
import TButton from '../src/vue/Button.vue';

/** One row per entry; the same neutral description feeds both frameworks. */
const rows: NeutralProps[][] = [];
for (const variant of ['primary', 'secondary', 'outline', 'ghost', 'link'])
  for (const tone of ['default', 'danger'])
    rows.push(
      ['sm', 'md', 'lg'].map((size) => ({ label: `${variant} ${size}`, variant, tone, size })),
    );
rows.push([
  { label: 'Disabled', disabled: true },
  { label: 'Disabled outline', disabled: true, variant: 'outline' },
  { label: 'Loading', loading: true },
  { label: 'Loading danger', loading: true, tone: 'danger' },
  { label: 'Loading outline', loading: true, variant: 'outline' },
]);
rows.push([
  { label: 'Save', leading: '★' },
  { label: 'Next', trailing: '→' },
  { label: 'Both', leading: '★', trailing: '→', variant: 'secondary' },
  { label: 'Submit', type: 'submit', size: 'sm' },
]);
rows.push([{ label: 'Block button', block: true }]);

function vueRoot(el: HTMLElement) {
  createApp({
    render: () =>
      rows.map((row) =>
        h(
          'div',
          { class: ['row', row[0]?.block ? 'wide' : ''] },
          row.map(({ label, leading, trailing, ...props }) =>
            h(TButton, props as never, {
              default: () => label,
              ...(leading ? { leading: () => leading } : {}),
              ...(trailing ? { trailing: () => trailing } : {}),
            }),
          ),
        ),
      ),
  }).mount(el);
}

function reactRoot(el: HTMLElement) {
  createRoot(el).render(
    rows.map((row, i) => (
      <div key={i} className={row[0]?.block ? 'row wide' : 'row'}>
        {row.map(({ label, leading, trailing, ...props }, j) => (
          <Button key={j} {...(props as object)} leadingIcon={leading} trailingIcon={trailing}>
            {label}
          </Button>
        ))}
      </div>
    )),
  );
}

vueRoot(document.getElementById('vue')!);
reactRoot(document.getElementById('react')!);
