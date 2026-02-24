export type TemplateFieldType = 'text' | 'textarea';

export type TemplateField = {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  placeholder?: string;
};

export type LandingTemplateDefinition = {
  ref: string;
  name: string;
  description: string;
  fields: TemplateField[];
  defaultContent: Record<string, string>;
};

export type TemplateContext = {
  campaignId: string;
  landingPageVersionId: string;
  disclosureVersionId?: string | null;
};

export type TemplateRenderer = (params: {
  content: Record<string, string>;
  disclosureText?: string | null;
  context: TemplateContext;
}) => string;

export type LandingTemplateModule = LandingTemplateDefinition & {
  render: TemplateRenderer;
};
