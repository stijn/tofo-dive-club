# Accessibility checks

Run against the built site with `npm run build && npm run preview` in another terminal. All of them need Google Chrome installed in `/Applications`.

- `npm run audit`: axe-core, every WCAG A/AA/AAA rule, on both languages and the 404 page. It exits non-zero on any violation. axe can't judge contrast over gradients or photos; the next check does that.
- `npm run audit:targets`: lists controls smaller than 44 × 44 px (WCAG 2.5.5), ignoring links inside sentences.
- Contrast against real pixels (WCAG 1.4.6). It needs Python with Pillow:

  ```
  node tools/a11y/contrast-capture.mjs http://localhost:4321/tofo-dive-club/ 1280 /tmp/en
  python3 tools/a11y/contrast-check.py /tmp/en
  ```

  The capture renders the page with all text made transparent. The check then compares each text colour with the darkest or lightest pixel behind it. One false positive is known: the fixed header's Join button. With backdrop blur it renders shifted in full-page captures; its real pair (#04192a on #ff8a6e) is 7.74:1.
