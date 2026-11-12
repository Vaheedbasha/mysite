# Vaheed Basha — Personal Portfolio

A single-page portfolio for **Vaheed Basha**, an independent web developer building
business websites and PHP/MySQL web applications for moving, packers and logistics
companies in India.

Plain HTML, CSS and vanilla JavaScript on the front, one small PHP endpoint behind the
contact form. No frameworks, no build step, no Node on the server.

---

## 1. What is in this folder

```
public_html/
├── index.html                  ← the whole page (markup + SEO tags)
├── contact.php                 ← contact form endpoint (POST only, JSON or HTML reply)
├── css/
│   └── styles.css              ← design tokens, themes, layout, animation
├── js/
│   ├── config.js               ← ⭐ EDIT THIS: site URL, contact details, projects, copy
│   └── main.js                 ← rendering, theme, nav, reveal animations, form
├── includes/
│   ├── config.php              ← ⭐ YOUR GMAIL CREDENTIALS (never commit this)
│   ├── config.sample.php       ← template for config.php
│   ├── .htaccess               ← blocks browser access to this folder
│   └── PHPMailer/
│       ├── PHPMailer.php        (v6.9.3, included — no Composer needed)
│       ├── SMTP.php
│       └── Exception.php
├── images/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.png            ← 1200×630 social preview (placeholder design)
│   ├── profile.jpg             ← optional; add it and the photo appears in the hero
│   └── projects/
│       ├── README.md           ← screenshot naming + size guide
│       └── (your .webp screenshots go here)
├── robots.txt
├── sitemap.xml
├── .htaccess                   ← compression, caching, security headers
├── .gitignore
└── README.md
```

### Two decisions worth knowing

1. **`index.html`, not `index.php`.** The page is fully static so it loads fast and
   caches well. All server-side work is limited to `contact.php`. The only PHP files are
   that endpoint and its config, so PHP can never slow down a page view.
2. **Content lives in `js/config.js`, and a copy of it is pre-rendered in `index.html`.**
   `main.js` renders the project cards, services, process steps and testimonials from
   `config.js` so you can edit content in one place. Because search engines and
   no-JavaScript visitors must still see the text, `index.html` also contains the same
   content as plain HTML. If you change wording in `config.js` and care about the no-JS
   view, mirror the change in the matching block in `index.html` (the comment blocks in
   both files point at each other).

---

## 2. Upload to Hostinger

### Option A — hPanel File Manager (easiest)

1. Log in to Hostinger → **Websites** → **Manage** → **File Manager**.
2. Open `public_html`.
3. Delete Hostinger's default `default.php` if it is there.
4. Zip this folder's contents, upload the zip, then **Extract** it inside `public_html`.
   Make sure `index.html` ends up directly inside `public_html`, not inside a subfolder —
   unless you deliberately want the site at `yourdomain.com/portfolio/`, in which case
   upload it into `public_html/portfolio/` and update `SITE_URL`.
5. Check the file permissions: folders `755`, files `644`.

### Option B — FTP / SFTP

1. hPanel → **Files** → **FTP Accounts** for host, username, password and port (21 or 22).
2. Connect with FileZilla (or any FTP client) and upload everything into `public_html`,
   keeping the folder structure exactly as above.

### After uploading

- Visit `https://yourdomain.com/contact.php` in a browser. You should see
  *"Method not allowed — Please use the contact form on the website."* That means PHP
  is running. Anything else (a PHP error, a download prompt) means the upload or the PHP
  version is wrong.
- Hostinger → **Advanced** → **PHP Configuration**: select **PHP 8.1 or newer**
  (`openssl` and `mbstring` are enabled by default).

---

## 3. Gmail App Password (for the contact form)

Gmail no longer accepts your normal account password for SMTP. You need a 16-character
**App Password**, which requires 2-Step Verification.

1. Go to <https://myaccount.google.com/security>.
2. Turn on **2-Step Verification** (Google requires this before App Passwords exist).
3. Open <https://myaccount.google.com/apppasswords>.
4. Name it `Portfolio website` and click **Create**.
5. Copy the 16-character password (Google shows it as `abcd efgh ijkl mnop`).
6. Use a **dedicated Gmail account for sending** if possible. When the mailbox owner
   replies, `Reply-To` is already set to the visitor, so replies go to the right place.

### Put the credentials in `includes/config.php`

```php
define('SMTP_USER', 'your.address@gmail.com');
define('SMTP_PASS', 'abcdefghijklmnop');   // spaces are fine too
```

Also set `MAIL_TO` to the inbox that should receive enquiries
(currently `vaheedbasha882@gmail.com`).

> `includes/config.php` is listed in `.gitignore` and blocked by `includes/.htaccess`.
> Never commit it, never paste the App Password into `index.html`, `config.js` or a chat.
> If the password leaks, delete it in Google and create a new one.

If `config.php` is missing or still has placeholder values, the form does **not** break:
it returns a friendly "form is not set up yet, please email…" message and logs the reason
on the server.

---

## 4. Testing the contact form

1. Fill in the form on the live site and send it.
2. You should see *"Thank you — your message is on its way."*
3. Check the `MAIL_TO` inbox (and the **Spam** folder on the first run).
4. Press **Reply** in that email: it should address the visitor, not you.

### If it does not arrive

| Symptom | Likely cause / fix |
| --- | --- |
| "Form is not set up yet" | `includes/config.php` missing, or `SMTP_USER`/`SMTP_PASS` still placeholders. |
| "Your message could not be sent right now" | SMTP login failed. Check the App Password (not the normal password), and that 2-Step Verification is on. |
| Works on port 587 but not 465 | Some hosts block one port. In `config.php` set `SMTP_PORT` to `465` and `SMTP_SECURE` to `'ssl'`. |
| `Connection refused` / timeout | Hostinger may block outbound SMTP. Ask support to allow outbound connections to `smtp.gmail.com` on 587 (or 465), or contact support to confirm SMTP is permitted on your plan. |
| Google email "Less secure app access" | That setting no longer exists. Use an **App Password** as above. |
| Nothing in the inbox, no error | Look in Spam/Promotions/All Mail; add the sender to contacts once. |
| Want the details | Set `CONTACT_DEBUG` to `true` in `config.php`, send again, then read the PHP error log in hPanel (**Advanced → Error Logs**). Set it back to `false` afterwards. |

Other behaviours built in:

- AJAX submit with a loading state; a plain (no-JavaScript) submit gets a simple HTML
  thank-you page instead of raw JSON.
- Honeypot field (`company`) — filled means bot, request rejected.
- Time check: submissions faster than 2.5 seconds are rejected.
- Per-IP rate limit: 5 submissions per hour (configurable).
- CSRF token from the PHP session, optional but used when available.
- Errors are logged server-side only; visitors never see stack traces or credentials.

---

## 5. Launch checklist

The site is currently set to **not be indexed**, because it lives on a temporary
Hostinger demo URL.

1. **Point the domain** at the hosting and enable the free SSL certificate
   (hPanel → **Security → SSL**).
2. **Update the URL in one place** — `js/config.js`:
   ```js
   SITE_URL: "https://vaheedbasha.com",   // no trailing slash
   ```
   Then update the same URL wherever it is hard-coded, because these are static files:
   - `index.html`: the canonical link, `og:url`, `og:image`, `twitter:image`, and every
     absolute URL inside the JSON-LD block (search the file for `example-portfolio`
     and replace all of them).
   - `sitemap.xml`: the `<loc>` value.
   - `robots.txt`: the commented `Sitemap:` line.
   - `contact.php` does not need changes.
3. **Turn indexing on:**
   - In `js/config.js` set `NOINDEX_UNTIL_LAUNCH: false`.
   - Delete this line in `index.html`:
     `<meta name="robots" content="noindex, nofollow">`
   - In `robots.txt`, delete `Disallow: /` and uncomment the `Sitemap:` line.
4. **Enable HTTPS + non-www redirect** — open `.htaccess`, find the block at the bottom
   headed *HTTPS + NON-WWW REDIRECT*, replace `example.com` with your domain, and remove
   the leading `#` from those lines. Then load the site over `http://` and `https://www.`
   to confirm both redirect correctly (and nothing loops).
5. **Replace the sample testimonials** (see §7).
6. **Upload real screenshots** (see §6).
7. **Replace `images/og-image.png`** if you want a different social preview design
   (keep it 1200×630).
8. **Test the form** end to end, on a phone as well.
9. **Run Lighthouse** (Chrome → DevTools → Lighthouse → Mobile) and check all four
   categories.
10. **Verify every project link opens.** In particular:
    `urbanclubpackersandmovers.in` **expires on 30 November 2026** — renew it, or remove
    or replace that card before then.
11. Submit `https://yourdomain.com/sitemap.xml` in Google Search Console.

---

## 6. Adding the real screenshots

Save each screenshot as **WebP**, 1600×1000 px, under 150 KB, into `images/projects/`
with these exact names:

| File | Project |
| --- | --- |
| `urban-club.webp` | Urban Club Relocation |
| `move-express.webp` | Move Express Packers |
| `trust-line.webp` | Trust Line Cargo |
| `cool-logistics.webp` | Cool Logistics |
| `shiftezy.webp` | ShiftEzy |
| `shiv-transport.webp` | Shiv Transport |
| `coachdesk.webp` | CoachDesk |
| `freshsupply.webp` | FreshSupply |
| `easy-shift.webp` | Easy Shift Relocations |

Until a file exists, the card shows a designed gradient placeholder with the project name
(the `<img>` removes itself on error), so nothing looks broken. As soon as you upload a
file with the right name it appears automatically — no code change needed.

While the screenshots are missing you will see `404` entries for those images in the
browser's network panel. That is expected and disappears once the files are uploaded.

Optional: add `images/profile.jpg` (square, around 400×400, under 100 KB) and a photo
appears in the hero. Without it, the hero simply has no photo.

---

## 7. Editing content

Everything is in **`js/config.js`**:

- `SITE_URL`, `NOINDEX_UNTIL_LAUNCH`, `SHOW_TESTIMONIALS`, `SHOW_SAMPLE_BADGE`
- Name, title, email, phone, WhatsApp number and pre-filled message, LinkedIn URL,
  availability text
- `projects` — each entry has `kind` (`featured`, `more` or `demo`), `type`
  (`business` or `app`, used by the filters), name, URL, category, description, tags,
  role, and (for featured cards) `case` with Challenge / What I built / Result
- `services`, `process`, `testimonials`

### Testimonials are placeholders

The three quotes are **samples**, marked `isSample: true`, and each shows a **Sample**
badge. They must be replaced with real quotes — with the client's written permission —
before the site is promoted publicly.

- Replace `quote`, `author` and `role`, then set `isSample: false`.
- To hide the badges but keep the quotes, set `SHOW_SAMPLE_BADGE: false`.
- To hide the whole section (for example until you have real quotes), set
  `SHOW_TESTIMONIALS: false`.
- Remove the matching static cards in `index.html` (`#testimonials-grid`) too, so the
  no-JS view matches.

### Colours, fonts and spacing

Open `css/styles.css` and edit the custom properties at the top:

- `--accent` (`#FF8A14`), `--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`,
  `--text-faint`, `--border`, `--border-strong`
- Dark theme values and light theme values are two separate blocks
- The design is intentionally monochrome: orange is used only for the logo dot,
  availability/live dots, the active nav indicator, card hover hairlines, focus
  rings and text selection. Keep it that way when editing.
- Radii, shadows and spacing are all variables as well

---

## 8. Notes and assumptions

- **Fonts** come from Google Fonts (Manrope + Inter, `display=swap`), with system font
  fallbacks. That is the only external request, plus your project links when clicked.
- **Icons** are inline SVG. The WhatsApp and LinkedIn marks use `fill="currentColor"`
  and follow the theme; UI icons use `stroke="currentColor"`.
- **No** GitHub link, résumé download, analytics, blog or language switcher, as specified.
- **No numbers were invented.** The only counted figure is "6 live sites". Testimonials
  contain no statistics or rankings.
- **`shiftkaro.in` was left out** because the domain has expired.
- **Demos** are clearly badged "Demo build" and never presented as client work. Easy Shift
  Relocations is labelled "Delivered · launching soon" with a "Preview" link.
- **Animations** are enabled only when JavaScript runs (the `js` class on `<html>`), and
  are switched off entirely for visitors with `prefers-reduced-motion: reduce`.
- **Theme** is stored in `localStorage` inside `try/catch`; on a first visit it follows
  `prefers-color-scheme`. A tiny inline script sets it before paint to avoid a flash.
- **Accessibility:** skip link, semantic landmarks, visible focus rings, labelled form
  fields, `aria-live` status, focus-trapped mobile menu closed with `Escape`, and AA
  contrast in both themes.
- **Broken-link check:** all outbound project links open with
  `rel="noopener noreferrer"` in a new tab.

---

## 9. Browser support

Current Chrome, Edge, Firefox and Safari (desktop and mobile). The page is readable
without JavaScript; the form falls back to a normal POST. `backdrop-filter`,
`aspect-ratio` and `clamp()` are used — all supported in current browsers.

---

© Vaheed Basha. Code written for this project; PHPMailer is included under the LGPL 2.1
licence (see the header in `includes/PHPMailer/`).

> The `artifacts/` folder contains review screenshots only. Delete it before uploading
> the site to Hostinger.
