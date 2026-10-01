const { chromium } = require('/Users/henrywhitfield/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3026';
const cities = ['San Francisco', 'San Diego', 'Los Angeles', 'Orange County', 'Seattle', 'Chicago', 'Denver', 'Austin', 'Dallas'];
(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: width === 320 ? 568 : 900 } });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      for (const path of ['/', '/cityscape']) {
        await page.goto(base + path, { waitUntil: 'networkidle' });
        await page.waitForSelector('.roseStage[data-ready=true]');
        const city = path === '/cityscape';
        const background = city ? '/rose-runtime/cityscape-night/background.webp' : '/rose-runtime/background.webp';
        const foreground = city ? '/rose-runtime/cityscape-night/foreground.webp' : '/rose-runtime/red/foreground.webp';
        const poster = city ? '/rose-runtime/cityscape-night/poster.webp' : '/rose-runtime/red/poster.webp';
        assert.equal(await page.locator('.roseBackground').getAttribute('src'), background);
        assert.equal(await page.locator('.roseForeground').getAttribute('src'), foreground);
        assert.equal(await page.locator('.rosePoster').getAttribute('src'), poster);
        assert.deepEqual(await page.locator('.cities li').allTextContents(), cities);
        assert.match(await page.locator('.details').innerText(), /Hinge\*, send/);
        const style = selector => page.locator(selector).evaluate(e => { const s = getComputedStyle(e); return [s.color, s.fontSize, s.lineHeight, s.fontWeight]; });
        assert.deepEqual(await style('.deliveryLink'), await style('.beliefContent .bodyCopy'));
        for (const progress of [0, .5, 1, 0]) {
          await page.evaluate(t => { const w = document.querySelector('.scrollSequence'); scrollTo({ top: (w.offsetHeight - innerHeight) * t, behavior: 'instant' }); }, progress);
          await page.waitForTimeout(800);
          assert.ok(Math.abs(Number(await page.locator('.roseStage').getAttribute('data-progress')) - progress) < .002);
          assert.ok(await page.locator('.rosePlane').evaluateAll(es => es.every(e => e.complete && e.naturalWidth > 0)));
        }
        if (city) await page.screenshot({ path: `/private/tmp/cityscape-hero-${width}.png` });
        await page.locator('.hero button.button').click(); await page.waitForTimeout(1100);
        assert.equal(await page.locator('.checkoutHero img').getAttribute('src'), poster);
        if (city) await page.screenshot({ path: `/private/tmp/cityscape-modal-${width}.png` });
        await page.keyboard.press('Escape'); await page.locator('dialog').waitFor({ state: 'detached' });
        await page.goto(base + (city ? '/cityscape/rose/claim' : '/rose/claim'));
        assert.equal(await page.locator('.recipientSky').getAttribute('src'), background);
        assert.equal(await page.locator('.recipientRose').getAttribute('src'), foreground);
        if (city) { await page.waitForTimeout(1300); await page.screenshot({ path: `/private/tmp/cityscape-recipient-${width}.png`, fullPage: true }); }
        await page.getByRole('button', { name: 'Choose where it goes' }).click();
        assert.deepEqual(await page.locator('#claim-city option').allTextContents(), ['Choose a city', ...cities]);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
      assert.deepEqual(errors, []); console.log({ width, variants: true, camera: true, cities: true, styling: true, errors }); await page.close();
    }
    const reduced = await browser.newPage({ reducedMotion: 'reduce' });
    await reduced.goto(base + '/cityscape');
    assert.equal(await reduced.locator('.roseStage').evaluate(e => getComputedStyle(e).display), 'none');
    assert.equal(await reduced.locator('.rosePoster').getAttribute('src'), '/rose-runtime/cityscape-night/poster.webp');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
