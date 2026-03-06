// Built-in demo image pairs using publicly available before/after style images
// These serve as the fallback when no admin-uploaded pairs exist

export const builtInDemoPairs = [
  {
    id: 'demo-exterior-1',
    service: 'exterior',
    scenario_name: 'Classic Navy & White',
    before_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/f8a36c7ef_ChatGPTImageMar5202608_15_17PM.png',
    after_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/3bd1f648d_ChatGPTImageMar5202608_24_52PM.png',
    color_tags: ['navy', 'white', 'blue'],
    is_default: true
  },
  {
    id: 'demo-exterior-2',
    service: 'exterior',
    scenario_name: 'Warm Gray & Cream',
    before_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/f8a36c7ef_ChatGPTImageMar5202608_15_17PM.png',
    after_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/3bd1f648d_ChatGPTImageMar5202608_24_52PM.png',
    color_tags: ['gray', 'cream', 'beige'],
    is_default: false
  },
  {
    id: 'demo-interior-1',
    service: 'interior',
    scenario_name: 'Bright & Airy',
    before_url: 'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=1200&h=800&fit=crop',
    after_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop',
    color_tags: ['white', 'light', 'bright'],
    is_default: true
  },
  {
    id: 'demo-interior-2',
    service: 'interior',
    scenario_name: 'Moody Accent Wall',
    before_url: 'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=1200&h=800&fit=crop',
    after_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&h=800&fit=crop',
    color_tags: ['dark', 'navy', 'dramatic'],
    is_default: false
  },
  {
    id: 'demo-cabinet-1',
    service: 'cabinet',
    scenario_name: 'Crisp White Cabinets',
    before_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/5dff4fb74_ChatGPTImageMar5202607_59_18PM.png',
    after_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/f6729d743_ChatGPTImageMar5202608_03_26PM.png',
    color_tags: ['white', 'bright', 'clean'],
    is_default: true
  },
  {
    id: 'demo-cabinet-2',
    service: 'cabinet',
    scenario_name: 'Deep Navy Cabinets',
    before_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/5dff4fb74_ChatGPTImageMar5202607_59_18PM.png',
    after_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/f6729d743_ChatGPTImageMar5202608_03_26PM.png',
    color_tags: ['navy', 'dark', 'bold'],
    is_default: false
  },
  {
    id: 'demo-trim-1',
    service: 'trim',
    scenario_name: 'Bright White Trim',
    before_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
    after_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop',
    color_tags: ['white', 'trim'],
    is_default: true
  },
  {
    id: 'demo-deck-1',
    service: 'deck',
    scenario_name: 'Warm Cedar Stain',
    before_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/f169d21ea_ChatGPTImageMar5202608_46_20PM.png',
    after_url: 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=1200&h=800&fit=crop',
    color_tags: ['cedar', 'brown', 'warm'],
    is_default: true
  }
];

/**
 * Given a service and user color selections, pick the best matching demo pair.
 * Falls back to default for the service, or first available.
 */
export function pickBestPair(allPairs, service, surfaceColors) {
  const servicePairs = allPairs.filter(p => p.service === service);
  if (!servicePairs.length) return null;

  // Collect color keywords from user selections
  const selectedColorNames = Object.values(surfaceColors)
    .filter(c => c?.color?.name)
    .map(c => c.color.name.toLowerCase());

  let bestMatch = null;
  let bestScore = -1;

  for (const pair of servicePairs) {
    let score = 0;
    const tags = pair.color_tags || [];
    for (const tag of tags) {
      for (const name of selectedColorNames) {
        if (name.includes(tag) || tag.includes(name.split(' ')[0])) score++;
      }
    }
    if (pair.is_default) score += 0.5; // slight bias toward default
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pair;
    }
  }

  return bestMatch || servicePairs.find(p => p.is_default) || servicePairs[0];
}