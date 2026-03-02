import { describe, expect, it } from 'vitest';

import { renderLandingPage } from '../../src/templates/render.js';

const baseContext = {
  podId: 'pod_test',
  landingPageVersionId: 'lpv_test'
};

describe('gift-for-new-readers font loading', () => {
  it('loads only the selected header and paragraph fonts', () => {
    const html = renderLandingPage(
      'gift-for-new-readers',
      {
        headerFont: 'Playfair Display',
        paragraphFont: 'Inter'
      },
      '',
      baseContext
    );

    expect(html).toContain('family=Playfair+Display');
    expect(html).toContain('family=Inter');
    expect(html).not.toContain('family=Cormorant+Garamond');
    expect(html).not.toContain('family=Lato');
  });

  it('deduplicates the stylesheet query when both font selections match', () => {
    const html = renderLandingPage(
      'gift-for-new-readers',
      {
        headerFont: 'Lora',
        paragraphFont: 'Lora'
      },
      '',
      baseContext
    );

    expect(html).toContain('family=Lora');
    expect((html.match(/family=Lora/g) ?? []).length).toBe(1);
  });
});
