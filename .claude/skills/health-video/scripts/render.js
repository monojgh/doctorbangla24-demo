// Render a health-video page frame by frame to JPEGs.
// Usage: node render.js <page.html> <config.json> <outdir> [startFrame] [endFrame]
// config.json: {"scenes": [[start,end],...], "total": 68.0, "platform": "facebook"|"youtube", "ctaAt": 4.2, "fps": 30}
// Run 4 copies in parallel over frame ranges (one per CPU core); ~45 s for a 60 s video.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const [page, cfgFile, outDir, s0, s1] = process.argv.slice(2);
  const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
  const fps = cfg.fps || 30;
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
  const n = Math.ceil(cfg.total * fps);
  const a = +(s0 || 0), z = Math.min(n, +(s1 || n));
  for (let i = a; i < z; i++) {
    await p.evaluate(t => window.render(t), i / fps);
    await p.screenshot({ path: `${outDir}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  await b.close();
  if (errs.length) { console.error('PAGE ERRORS', errs); process.exit(1); }
  console.log('frames', a, z, 'of', n);
})();
