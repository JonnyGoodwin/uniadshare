import { basicTemplate } from './templates/basic.js';
import { giftForNewReadersTemplate } from './templates/gift-for-new-readers.js';
import { toolkitTemplate } from './templates/toolkit.js';
import type { LandingTemplateModule } from './types.js';

export const landingTemplateModules: LandingTemplateModule[] = [
  basicTemplate,
  toolkitTemplate,
  giftForNewReadersTemplate
];

const byRef = new Map(landingTemplateModules.map((template) => [template.ref, template]));

export function getLandingTemplateModule(ref: string): LandingTemplateModule | undefined {
  return byRef.get(ref);
}
