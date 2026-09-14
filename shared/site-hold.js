/* Temporäre Veröffentlichungssperre für GitHub Pages.
   Kein Sicherheitsmechanismus: ?vorschau=1 schaltet die persönliche Vorschau frei. */
(() => {
  const isPages = location.hostname === 'mmiedl811.github.io';
  const preview = new URLSearchParams(location.search).get('vorschau') === '1';
  const previewKey = 'physik-web-apps-vorschau';

  if (!isPages) return;
  if (preview) sessionStorage.setItem(previewKey, '1');
  if (sessionStorage.getItem(previewKey) === '1') return;

  document.documentElement.classList.add('pages-hold-active');
  const css = document.createElement('style');
  css.textContent = `
    html.pages-hold-active body > * { visibility: hidden !important; }
    #pages-hold { position: fixed; inset: 0; z-index: 2147483647; display: grid;
      place-items: center; padding: 24px; background: linear-gradient(135deg, #07152f, #123c68); color: #fff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; visibility: visible !important; }
    #pages-hold .pages-hold-card { max-width: 620px; padding: clamp(28px, 6vw, 54px); border: 1px solid rgba(255,255,255,.3);
      border-radius: 24px; background: rgba(255,255,255,.12); box-shadow: 0 24px 80px rgba(0,0,0,.3); text-align: center; }
    #pages-hold h1 { margin: 0 0 16px; font-size: clamp(1.7rem, 5vw, 3rem); line-height: 1.1; }
    #pages-hold p { margin: 0; font-size: clamp(1rem, 2.5vw, 1.25rem); line-height: 1.55; }
  `;
  document.head.append(css);

  const show = () => {
    if (document.getElementById('pages-hold')) return;
    const hold = document.createElement('main');
    hold.id = 'pages-hold';
    hold.setAttribute('role', 'alert');
    hold.innerHTML = '<section class="pages-hold-card"><h1>Vorübergehend nicht erreichbar</h1><p>Diese Physik-Web-Apps werden gerade getestet und vorbereitet.<br>Bitte schau später noch einmal vorbei.</p></section>';
    document.body.append(hold);
  };
  if (document.body) show();
  else document.addEventListener('DOMContentLoaded', show, { once: true });
})();
