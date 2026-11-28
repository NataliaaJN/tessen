// Shell behaviour: off-canvas rail on small screens, «En esta página» tracking, inspector and filters.

const body = document.body;
const toggle = document.querySelector<HTMLButtonElement>('[data-rail-toggle]');
const setRail = (open: boolean): void => {
  body.toggleAttribute('data-rail-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
};
toggle?.addEventListener('click', () => setRail(!body.hasAttribute('data-rail-open')));
document.querySelector('[data-rail-close]')?.addEventListener('click', () => setRail(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setRail(false);
});

// Keep the active component visible in the sidebar tree.
document
  .querySelector('.rail-tree a[aria-current="page"]')
  ?.scrollIntoView({ block: 'center' });

// «En esta página»: mark the section being read.
const links = [...document.querySelectorAll<HTMLAnchorElement>('.on-page a')];
if (links.length > 0) {
  const targets = links
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter((el): el is HTMLElement => el !== null);
  const mark = (): void => {
    const passed = targets.filter((t) => t.getBoundingClientRect().top < 140);
    const active = passed.at(-1) ?? targets[0];
    links.forEach((a) => a.toggleAttribute('data-active', a.hash === `#${active?.id}`));
  };
  addEventListener('scroll', mark, { passive: true });
  mark();
}

// Inspector (home): outlines every Tessen component and names it on hover.
const inspector = document.querySelector<HTMLButtonElement>('[data-inspect-toggle]');
const target = document.querySelector<HTMLElement>('[data-inspect-target]');
if (inspector && target) {
  const tag = document.createElement('div');
  tag.className = 'inspect-tag';
  tag.hidden = true;
  body.append(tag);
  let on = false;
  inspector.addEventListener('click', () => {
    on = !on;
    inspector.setAttribute('aria-pressed', String(on));
    target.toggleAttribute('data-inspecting', on);
    tag.hidden = true;
  });
  target.addEventListener('pointermove', (e) => {
    if (!on) return;
    // Climb to the component root: parts are named `t-name__part`.
    let el: Element | null = e.target as Element;
    let name: string | undefined;
    while (el && el !== target) {
      name = [...el.classList].find((c) => c.startsWith('t-') && !c.includes('__'));
      if (name) break;
      el = el.parentElement;
    }
    if (!el || !name) {
      tag.hidden = true;
      return;
    }
    const box = el.getBoundingClientRect();
    const radius = getComputedStyle(el).borderRadius;
    tag.textContent = `.${name}  ${Math.round(box.width)} × ${Math.round(box.height)}  radio ${radius}`;
    tag.hidden = false;
    tag.style.left = `${Math.max(8, Math.min(box.left, innerWidth - tag.offsetWidth - 8))}px`;
    tag.style.top = `${Math.max(8, box.top - 30)}px`;
  });
  target.addEventListener('pointerleave', () => (tag.hidden = true));
  addEventListener('scroll', () => (tag.hidden = true), { passive: true });
}

// Catalog (components index): category chips and name filter.
const catalog = document.querySelector<HTMLElement>('[data-catalog]');
if (catalog) {
  const chips = [...catalog.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const search = catalog.querySelector<HTMLInputElement>('[data-catalog-search]');
  const items = [...catalog.querySelectorAll<HTMLElement>('[data-item]')];
  const count = catalog.querySelector('[data-catalog-count]');
  const empty = catalog.querySelector<HTMLElement>('[data-catalog-empty]');
  let category = 'all';
  const run = (): void => {
    const q = search?.value.trim().toLowerCase() ?? '';
    let shown = 0;
    for (const item of items) {
      const ok =
        (category === 'all' || item.dataset['category'] === category) &&
        (item.dataset['name'] ?? '').includes(q);
      item.hidden = !ok;
      if (ok) shown++;
    }
    if (count) count.textContent = `${shown} ${shown === 1 ? 'componente' : 'componentes'}`;
    if (empty) empty.hidden = shown > 0;
  };
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      category = chip.dataset['filter'] ?? 'all';
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      run();
    }),
  );
  search?.addEventListener('input', run);
}
