# LLM Guide: Add a Landing Template

Use this guide when adding a new landing page template for Acquisition Pods.

## Goal

Create a new template that:

- appears in the campaign wizard template picker,
- validates required fields on landing creation,
- renders HTML on preview and live landing routes,
- supports lead form submission via existing shared form/script helpers.

## Where templates live

- Template modules: `src/templates/templates/*.ts`
- Template registry: `src/templates/registry.ts`
- Shared template types: `src/templates/types.ts`
- Shared helpers (HTML escape, form, submit script): `src/templates/utils.ts`
- Template listing/validation utilities: `src/templates/catalog.ts`

## Implementation steps

1. Create a new template module file under `src/templates/templates/`.
2. Export a `LandingTemplateModule` with:

- `ref` (stable unique id, kebab-case),
- `name` (display name in UI),
- `description` (short UI description),
- `fields` (editable variables),
- `defaultContent` (seed values for UI form),
- `render` (returns full HTML string).

3. Use helpers from `src/templates/utils.ts`:

- `escapeHtml` for interpolated text,
- `renderLeadForm` to keep lead form behavior consistent,
- `renderLeadCaptureScript` so lead submission wiring stays standard.

4. Register the template in `src/templates/registry.ts` by importing it and adding it to `landingTemplateModules`.
5. Verify no changes are required in API routes:

- `GET /api/templates` is driven by `catalog.ts` and should automatically include the new template after registry update.
- Landing creation validation should automatically enforce `fields[].required`.

6. Run checks.

## Minimal template skeleton

```ts
import type { LandingTemplateModule } from '../types.js';
import { escapeHtml, renderLeadCaptureScript, renderLeadForm } from '../utils.js';

export const myTemplate: LandingTemplateModule = {
  ref: 'my-template',
  name: 'My Template',
  description: 'Short description shown in template chooser.',
  fields: [
    { key: 'headline', label: 'Headline', type: 'text', required: true },
    { key: 'body', label: 'Body', type: 'textarea', required: true },
    { key: 'ctaLabel', label: 'CTA Label', type: 'text', required: true },
    { key: 'consentLabel', label: 'Consent Label', type: 'text', required: true },
    { key: 'successMessage', label: 'Success Message', type: 'text', required: true },
  ],
  defaultContent: {
    headline: 'Example headline',
    body: 'Example body copy',
    ctaLabel: 'Get Started',
    consentLabel: 'I agree to receive emails from the publishers listed below.',
    successMessage: 'Thanks, your submission was received.',
  },
  render: ({ content, disclosureText, context }) => {
    const headline = escapeHtml(content.headline ?? '');
    const body = escapeHtml(content.body ?? '');

    return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${headline}</title></head>
<body>
  <main>
    <h1>${headline}</h1>
    <p>${body}</p>
    ${renderLeadForm(content, disclosureText)}
  </main>
  ${renderLeadCaptureScript(context, content.successMessage)}
</body>
</html>`;
  },
};
```

## Design rules

- Keep template styling self-contained in the HTML returned by `render`.
- Escape all user-editable string content before interpolation.
- Keep `ctaLabel`, `consentLabel`, and `successMessage` fields unless there is a strong reason not to.
- Prefer existing shared form/script helpers to avoid behavior drift.

## Verification checklist

1. `npm run lint`
2. `npm test`
3. `cd frontend && npm run build`
4. In UI:

- Open `/` (campaigns page).
- Start `Create New Campaign`.
- Confirm new template appears in Step 2.
- Create a campaign and verify preview renders HTML for the new template.
- Submit lead form from preview and confirm API accepts lead (`202`).

## Common mistakes

- Forgetting to add the template to `landingTemplateModules` in `src/templates/registry.ts`.
- Missing required fields in `fields` or `defaultContent` causing creation errors.
- Interpolating raw content without `escapeHtml`.
- Building custom lead form markup without using shared helpers, causing inconsistent capture behavior.

## Style Guidelines

- Remember that these templates are landing pages for a cohesive pod offering. See https://www.growthtools.com/resources/leads-and-content-toolkit as a great example.
