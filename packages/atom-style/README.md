# atom-style

A small client-side script that makes the Atom feed (`/atom.xml`) human-readable when
opened in a browser. Adapted from [rss.style](https://github.com/fileformat/rss.style).

Built with `tsdown` (as an `iife`, see below) into `dist/atom-style.js`. `apps/site` imports
the built file with `?url` (`@adrieldev/atom-style?url`) and injects a classic `<script src>`
tag into the feed XML, so the script ships as its own standalone, content-hashed asset rather
than being bundled into the site. The build must run before the site build/dev — `turbo run
build` handles ordering via the workspace dependency, and `predev` builds it for `pnpm dev`.

The tsdown `format` is `iife`, not `esm`, because the script is loaded as a classic
`<script>` (not `type="module"`): an ESM build appends `export {}`, a syntax error in a
classic script that silently breaks the whole feed page, and `document.currentScript` (used
to read the injected `data-*` attributes) is `null` in module scripts.

The RSS.style logo is inlined directly in `src/atom-style.ts` as a hardcoded `data:` URI
string rather than imported as a `.svg`/`.txt`/`?raw` asset, so the markup just lives
inline — it's tiny.

The stylesheet, being larger, is served separately: `water.light.css` (in `assets/`, exported
as `@adrieldev/atom-style/water.light.css`) is imported `?url` by the site and handed to the
script via a `data-water-css` attribute on the injected `<script>`, read at module top-level
since `document.currentScript` is null by the time `onreadystatechange` fires. `water.light.css`
is vendored as-is, so `assets/` is excluded from Prettier.
