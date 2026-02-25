import { landingTemplateModules } from './registry.js';
import type { LandingTemplateDefinition } from './types.js';

const templates: LandingTemplateDefinition[] = landingTemplateModules.map((template) => ({
  ref: template.ref,
  name: template.name,
  description: template.description,
  fields: template.fields,
  defaultContent: template.defaultContent
}));

const byRef = new Map(templates.map((template) => [template.ref, template]));
const legacyRefAliases = new Map<string, string>([['leads-content-toolkit', 'toolkit']]);

export function listLandingTemplates(): LandingTemplateDefinition[] {
  return templates;
}

export function getLandingTemplate(ref: string): LandingTemplateDefinition | undefined {
  const canonicalRef = legacyRefAliases.get(ref) ?? ref;
  return byRef.get(canonicalRef);
}

export function normalizeTemplateContent(
  templateRef: string,
  content: Record<string, unknown>
): Record<string, string> {
  const template = getLandingTemplate(templateRef);
  if (!template) {
    return Object.fromEntries(
      Object.entries(content).map(([key, value]) => [key, typeof value === 'string' ? value : String(value ?? '')])
    );
  }

  const normalized: Record<string, string> = { ...template.defaultContent };
  for (const field of template.fields) {
    const value = content[field.key];
    if (typeof value === 'string') {
      normalized[field.key] = value;
    }
  }
  return normalized;
}

export function validateTemplateContent(
  templateRef: string,
  content: Record<string, unknown>
): string[] {
  const template = getLandingTemplate(templateRef);
  if (!template) {
    return [`Unknown templateRef "${templateRef}"`];
  }

  const errors: string[] = [];
  for (const field of template.fields) {
    const value = content[field.key];
    if (value === undefined || value === null) {
      if (field.required) {
        errors.push(`content.${field.key}: required`);
      }
      continue;
    }

    if (typeof value !== 'string') {
      errors.push(`content.${field.key}: must be a string`);
      continue;
    }

    if (field.required && value.trim().length === 0) {
      errors.push(`content.${field.key}: cannot be empty`);
    }
  }

  return errors;
}
