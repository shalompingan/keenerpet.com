const fs = require('fs');
const path = require('path');

const pages = [
  { url: '/', file: 'index.html', name: 'Home (Cost Calc)' },
  { url: '/404.html', file: '404.html', name: '404' },
  { url: '/pet-food-calculator/', file: 'pet-food-calculator/index.html', name: 'Food Calc' },
  { url: '/pet-age-calculator/', file: 'pet-age-calculator/index.html', name: 'Age Calc' },
  { url: '/pet-water-intake/', file: 'pet-water-intake/index.html', name: 'Water Intake' },
  { url: '/pet-calorie-calculator/', file: 'pet-calorie-calculator/index.html', name: 'Calorie Calc' },
  { url: '/pet-walking-calculator/', file: 'pet-walking-calculator/index.html', name: 'Walking Calc' },
  { url: '/pet-insurance/', file: 'pet-insurance/index.html', name: 'Insurance' },
  { url: '/pet-toxicity-checker/', file: 'pet-toxicity-checker/index.html', name: 'Toxicity' },
  { url: '/dog-breed-match/', file: 'dog-breed-match/index.html', name: 'Breed Match' },
  { url: '/dog-separation-anxiety/', file: 'dog-separation-anxiety/index.html', name: 'Anxiety' },
  { url: '/dog-pregnancy-calculator/', file: 'dog-pregnancy-calculator/index.html', name: 'Pregnancy' },
  { url: '/dog-ear-checker/', file: 'dog-ear-checker/index.html', name: 'Ear Check' },
  { url: '/privacy/', file: 'privacy/index.html', name: 'Privacy' },
  { url: '/guides/dog-anxiety-guide/', file: 'guides/dog-anxiety-guide/index.html', name: 'Dog Anxiety Guide' },
  { url: '/guides/dog-feeding-guide/', file: 'guides/dog-feeding-guide/index.html', name: 'Feeding Guide' },
  { url: '/guides/dog-walking-guide/', file: 'guides/dog-walking-guide/index.html', name: 'Walking Guide' },
  { url: '/guides/pet-water-guide/', file: 'guides/pet-water-guide/index.html', name: 'Water Guide' },
  { url: '/guides/pet-calorie-guide/', file: 'guides/pet-calorie-guide/index.html', name: 'Calorie Guide' },
  { url: '/guides/pet-age-guide/', file: 'guides/pet-age-guide/index.html', name: 'Age Guide' },
  { url: '/guides/pet-insurance-guide/', file: 'guides/pet-insurance-guide/index.html', name: 'Insurance Guide' },
  { url: '/guides/pet-insurance-cost-2026/', file: 'guides/pet-insurance-cost-2026/index.html', name: 'Insurance Cost 2026' },
  { url: '/guides/hypoallergenic-dog-food-guide/', file: 'guides/hypoallergenic-dog-food-guide/index.html', name: 'Hypoallergenic Food' },
  { url: '/guides/dog-poisoning-guide/', file: 'guides/dog-poisoning-guide/index.html', name: 'Poisoning Guide' },
  { url: '/guides/apartment-dog-breed-guide/', file: 'guides/apartment-dog-breed-guide/index.html', name: 'Apartment Breeds' },
  { url: '/guides/puppy-development-guide/', file: 'guides/puppy-development-guide/index.html', name: 'Puppy Dev Guide' },
  { url: '/guides/dog-dehydration-guide/', file: 'guides/dog-dehydration-guide/index.html', name: 'Dehydration Guide' },
  { url: '/guides/cat-hydration-guide/', file: 'guides/cat-hydration-guide/index.html', name: 'Cat Hydration' },
  { url: '/guides/dog-ear-infection-guide/', file: 'guides/dog-ear-infection-guide/index.html', name: 'Ear Infection Guide' },
  { url: '/guides/puppy-potty-training-guide/', file: 'guides/puppy-potty-training-guide/index.html', name: 'Potty Training' },
  { url: '/guides/senior-dog-care-guide/', file: 'guides/senior-dog-care-guide/index.html', name: 'Senior Dog Care' },
];

const knownUrls = new Set(pages.map(p => p.url));
const knownResources = new Set(['/sitemap.xml', '/robots.txt', '/style.css', '/nav.js', '/_worker.js', '/wrangler.toml', '/api/collect-email']);

// Group pages by type
const tools = pages.filter(p => !p.url.includes('/guides/') && p.url !== '/404.html' && p.url !== '/privacy/');
const guides = pages.filter(p => p.url.includes('/guides/'));

// Map page url to file path for existence check
const urlToFile = {};
pages.forEach(p => { urlToFile[p.url] = p.file; });

console.log('═══════════════════════════════════════');
console.log('  INTERNAL LINK AUDIT REPORT');
console.log('═══════════════════════════════════════\n');

let totalBroken = 0;
let allBrokenLinks = [];

pages.forEach(page => {
  if (page.url === '/404.html') return; // skip 404 page itself
  const content = fs.readFileSync(page.file, 'utf-8');

  // Extract all href links
  const hrefRegex = /href\s*=\s*["']([^"']+)["']/g;
  let match;
  const links = new Set();
  while ((match = hrefRegex.exec(content)) !== null) {
    let link = match[1].split('#')[0].split('?')[0];
    // Normalize
    if (link.endsWith('/index.html')) link = link.replace(/\/index\.html$/, '/');
    if (link.endsWith('.html') && !link.endsWith('/404.html')) link = link.replace(/\.html$/, '/');
    if (link.startsWith('/')) links.add(link);
    else if (!link.startsWith('http') && !link.startsWith('//') &&
             !link.startsWith('mailto:') && !link.startsWith('javascript:') &&
             !link.startsWith('data:') && !link.startsWith('tel:')) {
      // Resolve relative link
      const dir = page.file.substring(0, page.file.lastIndexOf('/') + 1);
      const resolved = path.normalize(path.join(dir, link)).replace(/\\/g, '/');
      links.add('/' + resolved);
    }
  }

  // Check for broken links
  const broken = [];
  links.forEach(link => {
    if (link.startsWith('http') || link.startsWith('//') ||
        link.startsWith('mailto:') || link.startsWith('javascript:') ||
        link.startsWith('data:') || link.startsWith('tel:')) return;
    if (knownResources.has(link) || link.startsWith('/api/')) return;
    if (link === '/') return;

    // Normalize: remove trailing slash for checking
    const normalized = link.endsWith('/') ? link : link + '/';
    if (knownUrls.has(normalized)) return;
    if (normalized === '//') return;

    // Check as file path
    const filePath = link.replace(/^\//, '');
    if (!fs.existsSync(filePath) && !fs.existsSync(filePath + '/index.html') &&
        !fs.existsSync(filePath + '.html') && !link.startsWith('/api/')) {
      broken.push(link);
    }
  });

  if (broken.length > 0) {
    console.log(`❌ ${page.name} (${page.url})`);
    broken.forEach(l => console.log(`   Broken: ${l}`));
    console.log('');
    totalBroken += broken.length;
    broken.forEach(l => allBrokenLinks.push({ page: page.url, link: l }));
  }
});

if (totalBroken === 0) {
  console.log('✅ No broken internal links found!\n');
}

// ─── Cross-link completeness ──────────────────────────

console.log('─── Cross-link Completeness ───\n');

// Check 1: Does every page have footer linking to all tools + guides?
pages.forEach(page => {
  if (page.url === '/404.html') return;
  const content = fs.readFileSync(page.file, 'utf-8');

  // Check if footer is present
  const hasFooter = content.includes('<footer');
  if (!hasFooter) {
    console.log(`⚠️  ${page.name}: No footer found!`);
    return;
  }

  // Check footer guides column has all 16 guides
  const footerGuidesMissing = guides.filter(g => {
    // Skip self
    if (g.url === page.url) return false;
    // Check if link appears in the footer section
    const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/);
    if (!footerMatch) return true;
    return !footerMatch[0].includes('href="' + g.url + '"');
  });

  const footerToolsMissing = tools.filter(t => {
    if (t.url === page.url) return false;
    const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/);
    if (!footerMatch) return true;
    return !footerMatch[0].includes('href="' + t.url + '"');
  });

  if (footerGuidesMissing.length > 0 || footerToolsMissing.length > 0) {
    console.log(`⚠️  ${page.name}:`);
    if (footerGuidesMissing.length > 0) {
      console.log(`   Footer missing guides: ${footerGuidesMissing.map(g => g.url).join(', ')}`);
    }
    if (footerToolsMissing.length > 0) {
      console.log(`   Footer missing tools: ${footerToolsMissing.map(t => t.url).join(', ')}`);
    }
  }
});

// Check nav dropdown completeness (tools section)
console.log('\n─── Nav Dropdown Completeness ───\n');

pages.forEach(page => {
  if (page.url === '/404.html' || page.url.startsWith('/guides/')) return;
  const content = fs.readFileSync(page.file, 'utf-8');

  const navToolsMissing = tools.filter(t => {
    if (t.url === page.url) return false;
    const navSection = content.match(/class="dropdown-grid"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    if (!navSection) return true;
    return !navSection[0].includes('href="' + t.url + '"');
  });

  const navGuidesMissing = guides.filter(g => {
    if (g.url === page.url) return false;
    // Find the guides nav dropdown
    const guideNav = content.match(/Guides[\s\S]*?<\/div>\s*<\/div>/);
    if (!guideNav) return true;
    return !guideNav[0].includes('href="' + g.url + '"');
  });

  if (navToolsMissing.length > 0 || navGuidesMissing.length > 0) {
    console.log(`⚠️  ${page.name}:`);
    if (navToolsMissing.length > 0) console.log(`   Nav missing tools: ${navToolsMissing.map(t => t.url).join(', ')}`);
    if (navGuidesMissing.length > 0) console.log(`   Nav missing guides: ${navGuidesMissing.map(t => t.url).join(', ')}`);
  }
});

// Check mobile sidebar completeness
console.log('\n─── Mobile Sidebar Completeness ───\n');

pages.forEach(page => {
  if (page.url === '/404.html') return;
  const content = fs.readFileSync(page.file, 'utf-8');

  const sidebarSection = content.match(/mobile-sidebar[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  if (!sidebarSection) {
    console.log(`⚠️  ${page.name}: No mobile sidebar found`);
    return;
  }
  const sidebar = sidebarSection[0];

  const sidebarToolsMissing = tools.filter(t => {
    if (t.url === page.url) return false;
    return !sidebar.includes('href="' + t.url + '"');
  });

  const sidebarGuidesMissing = guides.filter(g => {
    if (g.url === page.url) return false;
    return !sidebar.includes('href="' + g.url + '"');
  });

  if (sidebarToolsMissing.length > 0 || sidebarGuidesMissing.length > 0) {
    console.log(`⚠️  ${page.name}:`);
    if (sidebarToolsMissing.length > 0) console.log(`   Sidebar missing tools: ${sidebarToolsMissing.map(t => t.url).join(', ')}`);
    if (sidebarGuidesMissing.length > 0) console.log(`   Sidebar missing guides: ${sidebarGuidesMissing.map(t => t.url).join(', ')}`);
  }
});

// ─── Sitemap Completeness ───────────────────────
console.log('\n─── Sitemap Completeness ───\n');

const sitemap = fs.readFileSync('sitemap.xml', 'utf-8');
pages.forEach(page => {
  const url = 'https://keenerpet.com' + page.url;
  if (!sitemap.includes(url)) {
    console.log(`❌ Missing from sitemap: ${page.url}`);
  }
});

console.log('\n═══════════════════════════════════════');
console.log('  AUDIT COMPLETE');
console.log('═══════════════════════════════════════');
