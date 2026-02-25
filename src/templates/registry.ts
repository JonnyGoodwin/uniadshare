import { basicTemplate } from './templates/basic.js';
import { toolkitTemplate } from './templates/leads-content-toolkit.js';
import { podSpotlightTemplate } from './templates/pod-spotlight.js';
import type { LandingTemplateModule } from './types.js';

export const landingTemplateModules: LandingTemplateModule[] = [
  basicTemplate,
  podSpotlightTemplate,
  toolkitTemplate
];

const byRef = new Map(landingTemplateModules.map((template) => [template.ref, template]));
const legacyRefAliases = new Map<string, string>([['leads-content-toolkit', 'toolkit']]);

export function getLandingTemplateModule(ref: string): LandingTemplateModule | undefined {
  const canonicalRef = legacyRefAliases.get(ref) ?? ref;
  return byRef.get(canonicalRef);
}
