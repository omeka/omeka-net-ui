# @omeka/ui

Shared design system for omeka.net. Two sites consume it:

| Site | Repo | Stack |
|---|---|---|
| `www.omeka.net` | [omeka/Omeka.net](https://github.com/omeka/Omeka.net) | Zend Framework 1 (Omeka Classic MU layer) |
| `info.omeka.net` | [omeka/omeka-net-hugo](https://github.com/omeka/omeka-net-hugo) | Hugo |

## What belongs in here

Design tokens, base styles, and components that appear on **more than one site** —
the header, footer, alert banner, buttons, flash messages, the hosting panel.

What does **not** belong here: styles for a single page. Those stay in the project
that owns the page (`application/mu/views/scripts/scss/pages/` in the app,
`assets/scss/pages/` in the Hugo site). Without that rule this repo slowly becomes
everyone's CSS, and every change starts risking both sites.

If the Hugo site needs a component the app already has, promote it deliberately:
move the partial here, update both `main.scss` files, tag a release.

```
scss/
  abstracts/    _variables (tokens), _mixins
  base/         _reset, _typography, _layout
  components/   _buttons, _alert-banner, _post-header, _site-header,
                _site-footer, _floating-button, _notices, _forms
js/             site-header.js — nav toggle, hover pill, hosting panel, scroll behavior
assets/         logo + hosting icon (the only two images the shared layer needs)
data/           navigation.json — the header/footer link lists, read by both sites
preview/        standalone component gallery
```

## Working on the styles

```bash
git clone https://github.com/omeka/omeka-net-ui.git
cd omeka-net-ui
npm install
npm run dev            # sass --watch
open preview/index.html
```

`preview/index.html` renders every shared component — tokens, type scale, button
variants, form fields, flash messages, and the live header and footer — compiled
from `scss/` in the same order the real sites load it. You do not need PHP, MySQL, Lando, or
Hugo to work on the shared layer. Reload the page after each save.

The header and footer markup in `preview/index.html` is the **reference
implementation**. See "The markup seam" below.

## Using it from a consuming site

Both sites depend on a tag, pinned in their lockfile:

```bash
npm install -D "@omeka/ui@github:omeka/omeka-net-ui#v1.0.0"
```

**Hugo** — mount it, then `@use` from `main.scss`:

```toml
# hugo.toml — declaring any assets mount replaces the default, so keep both
[[module.mounts]]
  source = "assets"
  target = "assets"

[[module.mounts]]
  source = "node_modules/@omeka/ui/scss"
  target = "assets/scss/shared"
```

Use `module.mounts`, not the `includePaths` option of `css.Sass`. Both compile,
but only mounted files are watched — with `includePaths`, `hugo server` never
rebuilds when a shared partial changes.

**The Zend app** — resolve via `node_modules` on the Sass load path:

```
sass --load-path=node_modules application/mu/views/scripts/scss/main.scss ...
```

## Local development against a consumer

`npm link` rather than `npm install file:../omeka-net-ui`: the `file:` form writes
that local path into `package.json`, which breaks every other machine if committed.
`npm link` produces the same symlink and leaves `package.json` alone, so the
committed dependency stays a pinned tag.

```bash
cd omeka-net-ui        && npm link
cd ../omeka-net-hugo   && npm link @omeka/ui
cd ../omeka.net/dev    && npm link @omeka/ui
```

Two behaviors worth knowing, both verified against Hugo 0.165 and Dart Sass 1.103:

- **Hugo picks up linked edits.** `hugo server` watches through the npm symlink and
  live-reloads when you edit a partial in this repo.
- **`sass --watch` does not.** The app's `npm run watch:css` will not notice changes
  under `node_modules`. One-shot builds resolve correctly, so after editing shared
  styles run `npm run build:css` in the app. Its `main.css` is committed, so it also
  needs rebuilding and committing.

In practice: use the Hugo server as the live feedback loop, or `npm run dev` here
with the gallery.

## Releasing

1. Commit here, update `CHANGELOG.md`, bump `version` in `package.json`.
2. Tag: `git tag v1.1.0 && git push --tags`.
3. Bump each consumer when you want it to move:
   `npm install -D "@omeka/ui@github:omeka/omeka-net-ui#v1.1.0"`.

Consumers pin, so merging here cannot move either production site on its own. The
two sites can sit on different versions deliberately.

## The markup seam

Zend `.phtml` partials and Hugo Go templates cannot share templates, so the header
and footer markup exists three times: here in `preview/index.html`, in the app's
`header.phtml`/`footer.phtml`, and in the Hugo site's `layouts/partials/`.

What changes most — the link lists — is centralized in `data/navigation.json`, read
by both sites, so a nav or footer link change is one edit here. **Structural** markup
changes have to be made in all three places. Keep the class names identical; that is
what lets one stylesheet cover both.

## License

Inherits the license of the Omeka.net application. Add a `LICENSE` file here to
match it before this repo is made public.
