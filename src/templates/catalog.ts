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

export function listLandingTemplates(): LandingTemplateDefinition[] {
  return templates;
}

export function getLandingTemplate(ref: string): LandingTemplateDefinition | undefined {
  return byRef.get(ref);
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
    } else if (field.type === 'checkbox-group' && Array.isArray(value)) {
      normalized[field.key] = value
        .filter((item): item is string => typeof item === 'string')
        .join(',');
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

    if (field.type === 'checkbox-group') {
      if (typeof value !== 'string' && !Array.isArray(value)) {
        errors.push(`content.${field.key}: must be a string or string[]`);
        continue;
      }

      const selections = Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

      if (field.required && selections.length === 0) {
        errors.push(`content.${field.key}: select at least one option`);
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
