# Filmhuis Putten — Mustbe Theme

A custom theme for [Filmhuis Putten](https://filmhuisputten.nl) on the [Mustbe](https://mustbe.nl) event ticketing platform.

## Quick start

1. Fork or clone this repository
2. Edit `theme.css` to match your brand
3. Add images and fonts to `assets/`
4. Push to a **public** GitHub/GitLab repository
5. In your Mustbe dashboard → **Instellingen → Thema** → select **Git-thema**
6. Paste your repository HTTPS URL and click **Thema ophalen**

```bash
node dev-server.js   # live preview at http://localhost:9876
node validate.js     # check before pushing
```

## File structure

```
theme.css        Required. Your theme styles.
theme.json       Recommended. Metadata (name, version) and an optional "topbar": { "text": "...", "url": "https://... or /path" } shown above the header.
assets/          Optional. Images, fonts, etc.
dev-server.js    Local development server.
validate.js      Validation script.
```

## theme.css

Override CSS custom properties in `:root {}` to change colors, fonts, and spacing:

```css
:root {
  --primary-color:   #e63946;
  --secondary-color: #457b9d;
  --font-family:     'Georgia', serif;
  --border-radius:   4px;
}
```

### CSS variables reference

| Variable | Default | Description |
|---|---|---|
| `--primary-color` | `#1a56db` | Main brand color (buttons, links) |
| `--primary-hover` | `#1e40af` | Hover state of primary color |
| `--secondary-color` | `#6b7280` | Secondary brand color |
| `--accent-color` | `#f59e0b` | Highlight / CTA color |
| `--text-color` | `#1f2937` | Main body text |
| `--text-muted` | `#6b7280` | Subdued text |
| `--text-light` | `#9ca3af` | Placeholder / disabled text |
| `--bg-color` | `#ffffff` | Page background |
| `--bg-secondary` | `#f9fafb` | Card / section background |
| `--bg-dark` | `#111827` | Dark sections (footer) |
| `--border-color` | `#e5e7eb` | Default border color |
| `--border-radius` | `8px` | Card / input corner radius |
| `--btn-radius` | `var(--border-radius)` | Button corner radius |
| `--shadow-sm` | `0 1px 2px …` | Small shadow |
| `--shadow` | `0 4px 6px …` | Default shadow |
| `--shadow-lg` | `0 10px 15px …` | Large shadow |
| `--font-family` | system font stack | Body font stack |
| `--container-width` | `1200px` | Max width of `.container` |

### CSS selectors reference

| Selector | Component |
|---|---|
| `.site-header` | Top navigation bar |
| `.site-logo` | Logo / brand name link |
| `.site-nav a` | Navigation links |
| `.site-nav a.active` | Active navigation link |
| `.site-main` | Main content wrapper |
| `.site-footer` | Footer |
| `.footer-content` | Footer columns area |
| `.footer-brand` | Footer logo / tagline |
| `.footer-links a` | Footer navigation links |
| `.card` | Generic card component |
| `.card-header` | Card header area |
| `.event-card` | Event listing card |
| `.event-card-content` | Event card body |
| `.event-card-title` | Event card title |
| `.btn` | All buttons |
| `.btn-primary` | Primary action button |
| `.btn-secondary` | Secondary action button |
| `.btn-sm` | Small button variant |
| `.form-control` | Text inputs, selects, textareas |
| `.alert` | Alert / notification box |
| `.alert-error` | Error alert |
| `.alert-success` | Success alert |
| `.alert-info` | Info alert |
| `.badge` | Status badge |
| `.auth-card` | Login / register card |
| `.section` | Generic section with padding |

## Using assets in CSS

After uploading your theme, reference assets using your **tenant ID** (24-character hex string from your dashboard URL):

```css
.site-header {
  background-image: url('/theme-assets/YOUR-TENANT-ID/assets/header-bg.jpg');
}
```

## Local development

```bash
node dev-server.js
```

Serves `theme.css` at `http://localhost:9876/theme.css`. Edit the file and reload your browser to see changes (logged to terminal).

## Validate before pushing

```bash
node validate.js
```

Checks for common errors (forbidden CSS patterns, file size, JSON validity) before you push.

## Publishing

1. Push to any public git repository (GitHub, GitLab, Bitbucket, Codeberg)
2. Copy the HTTPS clone URL (e.g. `https://github.com/you/your-theme.git`)
3. In Mustbe dashboard → Settings → Thema → Git-thema → paste URL → save
4. Click **Thema ophalen** to download and apply

## Security requirements

Your repository must meet these requirements to be accepted:

- Repository must be **public** and use **HTTPS** (no SSH, no private repos)
- No `@import` rules — inline your styles or use `url()` with `https://`
- No `javascript:` URIs
- No `expression()` calls (IE-era CSS execution)
- Asset files must have allowed extensions: `.css .png .jpg .jpeg .gif .svg .webp .woff .woff2 .ttf .ico`
- `theme.css` maximum size: **512 KB**

## License

MIT
