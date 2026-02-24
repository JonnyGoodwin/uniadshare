import { basicTemplate } from './templates/basic.js';
import { leadsContentToolkitTemplate } from './templates/leads-content-toolkit.js';
import { podSpotlightTemplate } from './templates/pod-spotlight.js';
import type { LandingTemplateModule } from './types.js';

export const landingTemplateModules: LandingTemplateModule[] = [
  basicTemplate,
  podSpotlightTemplate,
  leadsContentToolkitTemplate
];

const byRef = new Map(landingTemplateModules.map((template) => [template.ref, template]));

export function getLandingTemplateModule(ref: string): LandingTemplateModule | undefined {
  return byRef.get(ref);
}
