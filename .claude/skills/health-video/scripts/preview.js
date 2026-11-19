// Screenshot a page at given times to check layout and cue sync before the full render.
// Usage: node preview.js <page.html> <config.json> <outdir> 2.0,7.6,15.5,...
// Then tile: ffmpeg -i prev-*.png ... hstack/vstack, and LOOK at the contact sheet.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const [page, cfgFile, outDir, times] = process.argv.slice(2);
  const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(c => {
    window.SCENES = c.scenes; window.TOTAL = c.total; window.PLATFORM = c.platform; window.CTA_AT = c.ctaAt;
  }, cfg);
  await p.goto('file://' + path.resolve(page));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const loaded = await p.evaluate(() => [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))]);
  for (const t of times.split(',').map(Number)) {
    await p.evaluate(t => window.render(t), t);
    await p.screenshot({ path: `${outDir}/prev-${t}.png` });
  }
  console.log('fonts loaded:', loaded.join(', '), '| errors:', errs);
  await b.close();
})();
