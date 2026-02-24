import { normalizeTemplateContent } from './catalog.js';
import { getLandingTemplateModule } from './registry.js';
import { basicTemplate } from './templates/basic.js';
import type { TemplateContext } from './types.js';

export function renderLandingPage(
  templateRef: string,
  content: Record<string, unknown>,
  disclosureText: string | null | undefined,
  context: TemplateContext
): string {
  const template = getLandingTemplateModule(templateRef) ?? basicTemplate;
  const normalizedContent = normalizeTemplateContent(templateRef, content);
  return template.render({ content: normalizedContent, disclosureText, context });
}
