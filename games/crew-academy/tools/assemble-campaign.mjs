export function assembleCampaign(page, activities) {
  for (const [name,source] of Object.entries(activities)) {
    const start = '<!-- campaign-view:start -->';
    const end = '<!-- campaign-view:end -->';
    const first = source.indexOf(start);
    const last = source.indexOf(end);
    if (first<0 || last<=first || !page.includes('<!-- campaign:'+name+' -->')) {
      throw new Error('Missing campaign view markup for '+name);
    }
    const view = source.slice(first+start.length,last)
      .replace('<main ', '<div ').replace('</main>','</div>')
      .replaceAll('href="./playground.html"', 'href="#training"');
    page = page.replace('<!-- campaign:'+name+' -->',()=>view);
  }
  return page;
}
