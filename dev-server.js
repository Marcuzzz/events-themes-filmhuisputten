/**
 * dev-server.js — theme development server
 *
 * Serves theme.css and assets/ locally so you can see your theme in action
 * before pushing to your git repository.
 *
 * Usage: node dev-server.js
 *
 * Endpoints:
 *   GET /theme.css          Your theme CSS (no cache)
 *   GET /assets/{file}      Files from assets/ directory
 *   GET /                   Rich HTML preview page
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 9876;
const THEME_CSS = path.join(__dirname, 'theme.css');
const ASSETS_DIR = path.join(__dirname, 'assets');

const MIME_TYPES = {
  '.css':   'text/css',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.svg':   'image/svg+xml',
  '.webp':  'image/webp',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.ico':   'image/x-icon',
};

const THEME_JSON = path.join(__dirname, 'theme.json');

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Mirrors the platform: theme.json "topbar": { "text": "...", "url": "https://... or /path" }
function renderTopbar() {
  let topbar;
  try {
    topbar = JSON.parse(fs.readFileSync(THEME_JSON, 'utf8')).topbar;
  } catch {
    return '';
  }
  const text = typeof topbar?.text === 'string' ? topbar.text.trim().slice(0, 200) : '';
  if (!text) return '';
  const url = typeof topbar.url === 'string' &&
    (/^https:\/\/\S+$/i.test(topbar.url) || /^\/(?![/\\])\S*$/.test(topbar.url)) ? topbar.url : null;
  const inner = url
    ? `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`
    : `<span>${escapeHtml(text)}</span>`;
  return `<div class="site-topbar">\n    <div class="container">\n      ${inner}\n    </div>\n  </div>`;
}

const PREVIEW_HTML = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Filmhuis Putten — Theme Preview</title>
  <style>
    /* ── Mustbe platform base styles ── */
    :root {
      --primary-color:   #1a56db;
      --primary-hover:   #1e40af;
      --secondary-color: #6b7280;
      --accent-color:    #f59e0b;
      --text-color:      #1f2937;
      --text-muted:      #6b7280;
      --text-light:      #9ca3af;
      --bg-color:        #ffffff;
      --bg-secondary:    #f9fafb;
      --bg-dark:         #111827;
      --border-color:    #e5e7eb;
      --border-radius:   8px;
      --btn-radius:      var(--border-radius);
      --shadow-sm:       0 2px 6px rgb(0 0 0 / 0.08);
      --shadow:          0 12px 18px -6px rgb(0 0 0 / 0.12);
      --shadow-lg:       0 12px 35px -6px rgb(0 0 0 / 0.18);
      --font-family:     system-ui, sans-serif;
      --container-width: 1400px;
    }

    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; }
    img  { max-width: 100%; }

    body {
      font-family:    var(--font-family);
      color:          var(--text-color);
      background:     var(--bg-color);
      line-height:    1.6;
      min-height:     100vh;
      display:        flex;
      flex-direction: column;
    }

    .container {
      max-width: var(--container-width);
      margin:    0 auto;
      padding:   0 1.5rem;
    }

    /* ── Header ── */
    .site-header {
      position:      sticky;
      top:           0;
      z-index:       100;
      border-bottom: 1px solid var(--border-color);
    }
    .site-header .container {
      display:         flex;
      align-items:     center;
      justify-content: space-between;
      height:          64px;
    }
    .site-logo {
      font-size:       1.25rem;
      font-weight:     700;
      color:           var(--text-color);
      text-decoration: none;
    }
    .site-nav {
      display:     flex;
      gap:         1.5rem;
      align-items: center;
    }
    .site-nav a {
      color:           var(--text-muted);
      text-decoration: none;
      font-size:       0.9375rem;
    }

    /* ── Main ── */
    .site-main {
      flex:    1;
      padding: 2.5rem 0;
    }

    /* ── Sections ── */
    .section {
      padding: 3rem 0;
    }
    .section-title {
      font-size:     1.75rem;
      font-weight:   700;
      margin-bottom: 2rem;
    }

    h2 {
      font-size:   1.375rem;
      font-weight: 700;
      margin:      0 0 1.25rem;
    }

    /* ── Cards ── */
    .card {
      background:    var(--bg-color);
      border:        1px solid var(--border-color);
      border-radius: var(--border-radius);
      box-shadow:    var(--shadow-sm);
    }
    .card-header {
      padding:       1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      background:    var(--bg-secondary);
      font-weight:   600;
      border-radius: var(--border-radius) var(--border-radius) 0 0;
    }
    .card-body {
      padding: 1.5rem;
    }

    /* ── Event cards ── */
    .event-card {
      background:    var(--bg-color);
      border:        1px solid var(--border-color);
      border-radius: var(--border-radius);
      overflow:      hidden;
    }
    .event-card-image {
      width:        100%;
      aspect-ratio: 16 / 9;
      object-fit:   cover;
      display:      block;
      background:   var(--bg-secondary);
    }
    .event-card-content {
      padding: 1.25rem;
    }
    .event-card-title {
      font-size:   1rem;
      font-weight: 600;
      margin:      0 0 0.5rem;
      color:       var(--text-color);
    }
    .event-card-date {
      font-size:     0.8125rem;
      color:         var(--text-muted);
      margin-bottom: 0.25rem;
    }
    .event-card-price {
      font-weight: 600;
      font-size:   0.9375rem;
    }

    /* ── Events grid ── */
    .events-grid {
      display:               grid;
      grid-template-columns: repeat(3, 1fr);
      gap:                   1.5rem;
    }

    /* ── Buttons ── */
    .btn {
      display:         inline-flex;
      align-items:     center;
      justify-content: center;
      padding:         0.625rem 1.5rem;
      border-radius:   var(--btn-radius);
      font-size:       0.9375rem;
      font-weight:     500;
      cursor:          pointer;
      border:          none;
      text-decoration: none;
      transition:      all 0.15s ease;
    }
    .btn-primary {
      background: var(--primary-color);
      color:      white;
    }
    .btn-secondary {
      background: var(--bg-secondary);
      color:      var(--text-color);
      border:     1px solid var(--border-color);
    }
    .btn-sm {
      padding:   0.375rem 1rem;
      font-size: 0.875rem;
    }

    /* ── Forms ── */
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display:       block;
      font-size:     0.875rem;
      font-weight:   500;
      margin-bottom: 0.375rem;
      color:         var(--text-color);
    }
    .form-control {
      width:         100%;
      padding:       0.625rem 0.875rem;
      border:        1px solid var(--border-color);
      border-radius: var(--border-radius);
      font-size:     0.9375rem;
      color:         var(--text-color);
      background:    var(--bg-color);
    }

    /* ── Auth card ── */
    .auth-card {
      background:    var(--bg-color);
      border-radius: var(--border-radius);
      box-shadow:    var(--shadow-lg);
      padding:       2rem;
      max-width:     440px;
      margin:        0 auto;
    }

    /* ── Badges ── */
    .badge {
      display:     inline-flex;
      align-items: center;
      padding:     0.25rem 0.75rem;
      border-radius: 9999px;
      font-size:   0.75rem;
      font-weight: 500;
    }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-error   { background: #fee2e2; color: #991b1b; }
    .badge-info    { background: #dbeafe; color: #1e40af; }
    .badge-warning { background: #fef3c7; color: #92400e; }

    /* ── Alerts ── */
    .alert {
      padding:       1rem 1.25rem;
      border-radius: var(--border-radius);
      margin-bottom: 1rem;
    }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-error   { background: #fee2e2; color: #991b1b; }
    .alert-info    { background: #dbeafe; color: #1e40af; }

    /* ── Top banner bar ── */
    /* Same defaults as the platform's public.css */
    .site-topbar {
      background: var(--primary-color);
      color:      #fff;
      font-size:  0.875rem;
      padding:    0.4rem 0;
    }
    .site-topbar a { color: inherit; }

    /* ── Footer ── */
    .site-footer {
      background:     var(--bg-dark);
      color:          white;
      display:        flex;
      flex-direction: column;
      padding:        3rem 0 0;
    }
    .footer-content {
      display:               grid;
      grid-template-columns: repeat(3, 1fr);
      gap:                   2rem;
      padding-bottom:        2rem;
      border-bottom:         1px solid rgba(255, 255, 255, 0.1);
    }
    .footer-bottom {
      padding:    1.25rem 0;
      font-size:  0.8125rem;
      color:      rgba(255, 255, 255, 0.5);
      text-align: center;
    }
    .site-footer a {
      color:           rgba(255, 255, 255, 0.75);
      text-decoration: none;
    }
    .site-footer a:hover { color: var(--accent-color); }
    .site-footer h4 {
      color:         white;
      margin-bottom: 1rem;
      font-size:     1rem;
    }
    .site-footer p,
    .site-footer address {
      color:       rgba(255, 255, 255, 0.65);
      font-style:  normal;
      font-size:   0.9rem;
      line-height: 1.8;
    }
    .site-footer nav {
      display:        flex;
      flex-direction: column;
      gap:            0.4rem;
    }

    /* ── Event cards — portrait posters ── */
    .event-card-image {
      width:        100%;
      aspect-ratio: 9 / 13;
      object-fit:   cover;
      display:      flex;
      align-items:  center;
      justify-content: center;
      background:   var(--bg-secondary);
      font-size:    3rem;
    }
    .event-card-content {
      text-align: center;
    }
  </style>
  <!-- Theme CSS — overrides the base styles above -->
  <link rel="stylesheet" href="/theme.css">
</head>
<body>

  <!-- ══ TOP BANNER (from theme.json "topbar", same markup as the platform) ══ -->
  __TOPBAR__

  <!-- ══ HEADER ══ -->
  <header class="site-header">
    <div class="container">
      <a href="#" class="site-logo">Filmhuis Putten</a>
      <nav class="site-nav">
        <a href="#" class="active">Home</a>
        <a href="#">Agenda</a>
        <a href="#">Steun ons</a>
        <a href="#">Veel gestelde vragen</a>
        <a href="#">Voor kinderen</a>
        <a href="#">Over ons</a>
        <a href="#">Contact</a>
      </nav>
    </div>
  </header>

  <!-- ══ MAIN ══ -->
  <main class="site-main">
    <div class="container">

      <!-- Preview notice -->
      <div class="alert alert-info" style="margin-bottom:2rem;">
        Thema preview — bewerk <strong>theme.css</strong> en herlaad om wijzigingen te zien.
      </div>

      <!-- Agenda — portrait film poster cards, 4 columns like the site -->
      <section class="section">
        <h1 class="section-title">Agenda</h1>
        <div class="events-grid" style="grid-template-columns:repeat(4,1fr);gap:1.25rem;">

          <div class="event-card">
            <img class="event-card-image" src="https://filmhuisputten.nl/wp-content/uploads/Le-Grand-Bain-800.jpg" alt="Le Grand Bain">
            <div class="event-card-content">
              <h3 class="event-card-title">Le Grand Bain</h3>
              <p class="event-card-date">Vrijdag 27 november 2026 | 19:30 uur</p>
              <p class="event-card-date">Humor | 12+</p>
              <a href="#" class="btn btn-primary">meer info</a>
            </div>
          </div>

          <div class="event-card">
            <img class="event-card-image" src="https://filmhuisputten.nl/wp-content/uploads/Sound-of-Falling-800.jpg" alt="Sound of falling">
            <div class="event-card-content">
              <h3 class="event-card-title">Sound of falling</h3>
              <p class="event-card-date">Vrijdag 11 december 2026 | 19:30 uur</p>
              <p class="event-card-date">Drama | 16+</p>
              <a href="#" class="btn btn-primary">meer info</a>
            </div>
          </div>

          <div class="event-card">
            <img class="event-card-image" src="https://filmhuisputten.nl/wp-content/uploads/Midwinter-Break-800.jpg" alt="Midwinter Break">
            <div class="event-card-content">
              <h3 class="event-card-title">Midwinter Break</h3>
              <p class="event-card-date">Zondag 20 december 2026 | 15:00 uur</p>
              <p class="event-card-date">Drama | 6+</p>
              <a href="#" class="btn btn-primary">meer info</a>
            </div>
          </div>

          <div class="event-card">
            <img class="event-card-image" src="https://filmhuisputten.nl/wp-content/uploads/Quiet-Life-800.jpg" alt="Quiet Life">
            <div class="event-card-content">
              <h3 class="event-card-title">Quiet Life</h3>
              <p class="event-card-date">Zondag 3 januari 2027 | 15:00 uur</p>
              <p class="event-card-date">Arthouse | 12+</p>
              <a href="#" class="btn btn-primary">meer info</a>
            </div>
          </div>

        </div>
      </section>

      <!-- Buttons & badges showcase -->
      <section class="section">
        <div style="background:var(--bg-secondary);padding:2rem;border-radius:var(--border-radius);">
          <h2>Knoppen &amp; badges</h2>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;">
            <a href="#" class="btn btn-primary">Bestel kaarten</a>
            <a href="#" class="btn btn-secondary">Meer informatie</a>
            <a href="#" class="btn btn-primary btn-sm">Klein</a>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;margin-top:1rem;">
            <span class="badge badge-success">Beschikbaar</span>
            <span class="badge badge-warning">Bijna vol</span>
            <span class="badge badge-error">Uitverkocht</span>
            <span class="badge badge-info">Nieuw</span>
          </div>
        </div>
      </section>

      <!-- Login form -->
      <section class="section">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start;max-width:900px;">
          <div class="card">
            <div class="card-header">Inloggen</div>
            <div class="card-body">
              <form>
                <div class="form-group">
                  <label for="preview-email">E-mailadres</label>
                  <input id="preview-email" type="email" class="form-control" placeholder="jouw@email.nl">
                </div>
                <div class="form-group">
                  <label for="preview-pw">Wachtwoord</label>
                  <input id="preview-pw" type="password" class="form-control">
                </div>
                <button type="button" class="btn btn-primary" style="width:100%;">Inloggen</button>
              </form>
              <div class="alert alert-success" style="margin-top:1rem;">Succesvol ingelogd!</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">Reserveringen</div>
            <div class="card-body">
              <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.75rem;">
                <li style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <div style="font-weight:600;font-size:0.9rem;">Sound of falling</div>
                    <div style="font-size:0.8125rem;color:var(--text-muted);">vr 11 dec · 19:30</div>
                  </div>
                  <span class="badge badge-success">Beschikbaar</span>
                </li>
                <li style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <div style="font-weight:600;font-size:0.9rem;">Midwinter Break</div>
                    <div style="font-size:0.8125rem;color:var(--text-muted);">zo 20 dec · 15:00</div>
                  </div>
                  <span class="badge badge-error">Afgelast</span>
                </li>
              </ul>
              <div class="alert alert-info" style="margin-top:1rem;">Uw reservering verloopt over 10 minuten.</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </main>

  <!-- ══ FOOTER ══ -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <a href="#" class="site-logo">Filmhuis Putten</a>
          <h4>Contact</h4>
          <address>
            Brinkstraat 91<br>
            3881 BP Putten<br>
            <a href="mailto:info@filmhuisputten.nl">info@filmhuisputten.nl</a>
          </address>
        </div>
        <div>
          <h4>Ga naar</h4>
          <nav class="footer-links">
            <a href="#">Agenda</a>
            <a href="#">Steun ons</a>
            <a href="#">Handige informatie</a>
            <a href="#">Veel gestelde vragen</a>
            <a href="#">Contact</a>
          </nav>
        </div>
        <div>
          <h4>Blijf up-to-date</h4>
          <nav class="footer-links">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
          </nav>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; 2026 Filmhuis Putten | Realisatie: Signatures
      </div>
    </div>
  </footer>

  <script>
    // Auto-reload when theme.css changes (poll every 2 seconds)
    (function () {
      let lastSignature = null;

      async function checkTheme() {
        try {
          const res = await fetch('/theme.css?_cb=' + Date.now(), { cache: 'no-store' });
          if (!res.ok) return;
          const text = await res.text();
          // Use content length + a simple hash of the last 64 chars as signature
          const sig = text.length + '|' + text.slice(-64);
          if (lastSignature === null) {
            lastSignature = sig;
          } else if (sig !== lastSignature) {
            location.reload();
          }
        } catch (_) {
          // server temporarily unreachable — ignore
        }
      }

      setInterval(checkTheme, 2000);
      checkTheme();
    })();
  </script>

</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS — allow your local Mustbe dev server to load this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // theme.css
  if (pathname === '/theme.css') {
    try {
      const css = fs.readFileSync(THEME_CSS, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(css);
      console.log(`[dev-server] Served theme.css (${css.length} bytes)`);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Could not read theme.css: ' + err.message);
    }
    return;
  }

  // assets/ — direct path
  // theme-assets/{tenant-id}/assets/ — production-style path used in theme.css url() references
  const assetMatch = pathname.startsWith('/assets/')
    ? pathname.replace('/assets/', '')
    : pathname.match(/^\/theme-assets\/[^/]+\/assets\/(.+)$/)?.[1];

  if (assetMatch !== undefined) {
    const filePath = path.join(ASSETS_DIR, assetMatch);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(ASSETS_DIR))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    try {
      const data = fs.readFileSync(resolved);
      const ext = path.extname(resolved).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
    return;
  }

  // Preview page
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(PREVIEW_HTML.replace('__TOPBAR__', renderTopbar()));
});

server.listen(PORT, () => {
  console.log(`[dev-server] Running at http://localhost:${PORT}`);
  console.log(`[dev-server] Serving theme.css from: ${THEME_CSS}`);
});

// Watch theme.css for changes and log to terminal
fs.watch(THEME_CSS, (eventType) => {
  if (eventType === 'change') {
    try {
      const size = fs.statSync(THEME_CSS).size;
      console.log(`[dev-server] theme.css changed (${size} bytes) — reload your browser`);
    } catch {
      // file temporarily unavailable during save — ignore
    }
  }
});
