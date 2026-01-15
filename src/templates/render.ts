type TemplateRenderer = (params: {
  content: Record<string, unknown>;
  disclosureText?: string | null;
}) => string;

const basicTemplate: TemplateRenderer = ({ content, disclosureText }) => {
  const headline = (content.headline as string) ?? 'Welcome';
  const body = (content.body as string) ?? '';
  const disclosure = disclosureText ?? '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
</head>
<body>
  <main>
    <section>
      <h1>${headline}</h1>
      <p>${body}</p>
    </section>
    <section>
      <h2>Disclosure</h2>
      <p>${disclosure}</p>
    </section>
  </main>
</body>
</html>`;
};

const renderers: Record<string, TemplateRenderer> = {
  basic: basicTemplate
};

export function renderLandingPage(
  templateRef: string,
  content: Record<string, unknown>,
  disclosureText?: string | null
): string {
  const renderer = renderers[templateRef] ?? basicTemplate;
  return renderer({ content, disclosureText });
}
