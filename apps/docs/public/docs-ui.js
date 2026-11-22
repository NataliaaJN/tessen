// Cromo de la documentación: selector de framework (persistente, ?fw=) y paleta de búsqueda ⌘K.
(function () {
  var root = document.documentElement;

  // ---- Framework switch: <html data-fw> hides the other framework's columns
  var buttons = document.querySelectorAll('[data-set-fw]');
  function sync() {
    var f = root.dataset.fw || 'both';
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setFw === f));
    });
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.setFw;
      if (f === 'both') delete root.dataset.fw;
      else root.dataset.fw = f;
      try {
        if (f === 'both') localStorage.removeItem('tessen:docs:fw');
        else localStorage.setItem('tessen:docs:fw', f);
        var u = new URL(location.href);
        if (f === 'both') u.searchParams.delete('fw');
        else u.searchParams.set('fw', f);
        history.replaceState(null, '', u);
      } catch {
        // Storage or history can be blocked: the switch still works for this page view.
      }
      sync();
    });
  });
  sync();

  // ---- Search palette
  var dlg = document.getElementById('search');
  var input = document.getElementById('search-input');
  var list = document.getElementById('search-results');
  var openBtn = document.getElementById('search-open');
  if (!dlg || !input || !list) return;
  var index = null;
  var active = 0;

  function score(e, q, words) {
    var title = e.title.toLowerCase();
    var hay = (e.title + ' ' + e.kind + ' ' + e.text).toLowerCase();
    for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) < 0) return -1;
    if (title === q) return 3;
    if (title.indexOf(q) === 0) return 2;
    return title.indexOf(q) >= 0 ? 1 : 0;
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    var words = q.split(/\s+/).filter(Boolean);
    var hits = (index || [])
      .map(function (e) {
        return [score(e, q, words), e];
      })
      .filter(function (p) {
        return p[0] >= 0;
      })
      .sort(function (a, b) {
        return b[0] - a[0];
      })
      .slice(0, 8)
      .map(function (p) {
        return p[1];
      });
    active = 0;
    list.replaceChildren.apply(
      list,
      hits.map(function (e, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(i === 0));
        var a = document.createElement('a');
        a.href = e.url;
        a.textContent = e.title;
        var k = document.createElement('small');
        k.textContent = e.kind;
        a.append(' ', k);
        li.append(a);
        return li;
      }),
    );
  }

  function move(d) {
    var items = Array.prototype.slice.call(list.children);
    if (!items.length) return;
    active = (active + d + items.length) % items.length;
    items.forEach(function (li, i) {
      li.setAttribute('aria-selected', String(i === active));
    });
  }

  async function open() {
    if (!dlg.open) dlg.showModal();
    input.value = '';
    if (!index) index = await (await fetch('/search-index.json')).json();
    render();
    input.focus();
  }

  if (openBtn) openBtn.addEventListener('click', open);
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open();
    }
  });
  input.addEventListener('input', render);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      var a = list.children[active] && list.children[active].querySelector('a');
      if (a) a.click();
    }
  });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) dlg.close();
  });
})();
