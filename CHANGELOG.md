# Changelog

Consumers pin a tag, so this file is how whoever bumps a site knows what they are
taking. Note anything that changes rendered output, and call out renamed or removed
tokens explicitly — those break a consumer's build at compile time.

## v1.0.0

First release.

- `scss/abstracts/` — color, type, spacing, radius, shadow, breakpoint, z-index tokens; container/breakpoint/focus/eyebrow mixins.
- `scss/base/` — reset, typography, layout primitives (skip link, sticky-header offsets).
- `scss/components/` — buttons, alert banner, page header, site header, site footer, floating hosting panel, flash messages, forms.
- `js/site-header.js` — nav toggle, hover pill, alert-banner scroll collapse, hosting panel.
- `data/navigation.json` — header and footer link lists, and the header's account link.
- `preview/` — component gallery.

The header's only action is a "My Account" button (`#user-meta`) linking to the
app's dashboard, the same on both sites and for every visitor: the Hugo site has
no session data, and the dashboard sends signed-out visitors to the login form.

`_forms.scss` styles the label / control / hint / error stack, scoped to
`.form-fields` on the `<form>` element. Class names are Omeka's form decorator
output, so adopting it in the app means, per form screen, adding
`$form->setAttrib('class', 'form-fields')` and deleting the duplicate rules from
`pages/_prompt.scss` or `pages/pricing/_signup-form.scss`; until then those rules
outrank the shared `.form-fields .field` by source order. Two things stay in the
app deliberately — the required-field asterisk (signup shows one, the auth
screens don't) and `.prompt input[type="submit"]`, which can go once the submit
elements are given `'class' => 'btn btn--primary'`.
