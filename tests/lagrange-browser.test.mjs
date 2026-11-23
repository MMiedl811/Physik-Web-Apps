import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const playwrightPath = process.env.PLAYWRIGHT_PATH || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { chromium, webkit } = require(playwrightPath);
const out = '/tmp/lagrange-toggles-review';
await mkdir(out, { recursive: true });

const server = http.createServer(async (req, res) => {
  try {
    const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.join(process.cwd(), requestPath, requestPath.endsWith('/') ? 'index.html' : '');
    const extension = path.extname(file);
    const types = { '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript' };
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extension] || 'text/html' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.LAGRANGE_URL?.replace(/\/$/, '') || `http://127.0.0.1:${server.address().port}`;

async function positions(page) {
  return page.evaluate(() => {
    const globe = document.getElementById('earth-globe').transform.baseVal.getItem(0).matrix;
    const coordinates = id => {
      const marker = document.getElementById(id + '-marker');
      return [marker.cx.baseVal.value - 320, marker.cy.baseVal.value - 264];
    };
    return {
      earth: [globe.e - 320, globe.f - 264],
      l2: coordinates('l2'),
      extraPoints: [coordinates('l1'), coordinates('l3')],
    };
  });
}

try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      for (const [width, height] of [[1440, 1000], [1024, 768], [820, 1180], [720, 450], [390, 844], [320, 700]]) {
        const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('requestfailed', request => errors.push(request.url()));
        page.on('response', response => {
          if (response.status() >= 400) errors.push(response.url());
        });
        page.on('request', request => {
          if (!request.url().startsWith(base + '/') && !request.url().startsWith('data:')) errors.push(request.url());
        });

        await page.goto(base + '/');
        await page.locator('a.card[href="lagrange-labor/"]').tap();
        await page.locator('#play').waitFor();
        await page.screenshot({ path: path.join(out, `${name}-${width}-bereit.png`), fullPage: true });
        assert.equal(await page.getByRole('button').count(), 4);
        const l1 = page.getByRole('button', { name: 'L1', exact: true });
        const l3 = page.getByRole('button', { name: 'L3', exact: true });
        const forces = page.getByRole('button', { name: 'Kräfte' });
        for (const toggle of [l1, l3, forces]) {
          assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
          const hit = await toggle.boundingBox();
          assert.ok(hit.width >= 48 && hit.height >= 48);
        }
        assert.ok(!await page.locator('#l1-point').isVisible());
        assert.ok(!await page.locator('#l3-point').isVisible());
        assert.ok(!await page.locator('#force-key').isVisible());
        await l1.tap();
        assert.ok(await page.locator('#l1-point').isVisible());
        assert.ok(!await page.locator('#l3-point').isVisible());
        await l3.tap();
        await forces.tap();
        assert.ok(await page.locator('#force-key').isVisible());
        const earthLengths = {};
        for (const [point, signs] of Object.entries({ l1: [-1, 1, -1], l2: [-1, -1, -1], l3: [1, 1, 1] })) {
          assert.ok(await page.locator(`[data-force-point="${point}"]`).isVisible());
          const [sun, earth, resultant] = await page.locator(`[data-force-point="${point}"] path`).evaluateAll(
            rays => rays.map(ray => Number(ray.getAttribute('d').match(/H([^ ]+)/)[1])),
          );
          assert.deepEqual([sun, earth, resultant].map(Math.sign), signs);
          assert.ok(Math.abs(sun) > Math.abs(earth));
          assert.ok(Math.abs(sun + earth - resultant) < 1e-8);
          assert.equal(Math.abs(resultant) > Math.abs(sun), point !== 'l1');
          earthLengths[point] = Math.abs(earth);
        }
        assert.ok(earthLengths.l3 < Math.min(earthLengths.l1, earthLengths.l2));
        await page.screenshot({ path: path.join(out, `${name}-${width}-kraefte.png`), fullPage: true });
        assert.equal(await page.locator('input, select').count(), 0);
        assert.equal(await page.locator('details').getAttribute('open'), null);

        const play = page.getByRole('button', { name: 'Umlauf starten' });
        const target = await play.boundingBox();
        assert.ok(target.height >= 48 && target.width >= 48);
        const initial = await positions(page);
        await page.clock.install();
        await play.tap();
        for (let step = 0; step < 4; step++) {
          await page.clock.runFor(4500);
          const { earth, l2, extraPoints } = await positions(page);
          for (const [index, [x, y]] of extraPoints.entries()) {
            assert.ok(Math.abs(earth[0] * y - earth[1] * x) < 0.01);
            assert.equal(Math.sign(earth[0] * x + earth[1] * y), index === 0 ? 1 : -1);
          }
          assert.ok(Math.abs(Math.hypot(...earth) - 155) < 0.001);
          assert.ok(Math.abs(Math.hypot(...l2) - 199) < 0.001);
          assert.ok(Math.abs(earth[0] * l2[1] - earth[1] * l2[0]) < 0.01);
          assert.ok(earth[0] * l2[0] + earth[1] * l2[1] > 0);
          if (step === 0) assert.ok(Math.hypot(earth[0] - initial.earth[0], earth[1] - initial.earth[1]) > 100);
          const visibleLabels = await page.locator('#orbit text').evaluateAll(labels => labels.every(label => {
            const box = label.getBoundingClientRect();
            const bounds = label.ownerSVGElement.getBoundingClientRect();
            return box.left >= bounds.left && box.right <= bounds.right && box.top >= bounds.top && box.bottom <= bounds.bottom;
          }));
          assert.ok(visibleLabels, 'Beschriftung innerhalb der Bühne');
          if (step === 0) await page.screenshot({ path: path.join(out, `${name}-${width}-laufend.png`), fullPage: true });
        }
        await page.getByRole('button', { name: 'Umlauf pausieren' }).tap();
        const pausedAt = await positions(page);
        await page.clock.runFor(800);
        assert.deepEqual(await positions(page), pausedAt);
        await page.getByRole('button', { name: 'Umlauf fortsetzen' }).focus();
        await page.keyboard.press('Space');
        await page.clock.runFor(500);
        assert.notDeepEqual(await positions(page), pausedAt);
        await page.getByRole('button', { name: 'Umlauf pausieren' }).click();

        await l1.tap();
        assert.ok(!await page.locator('[data-force-point="l1"]').isVisible());
        assert.ok(await page.locator('[data-force-point="l3"]').isVisible());
        await forces.tap();
        assert.ok(!await page.locator('#force-layer').isVisible());
        assert.ok(await page.locator('#l3-point').isVisible());
        await l3.focus();
        await page.keyboard.press('Space');
        assert.ok(!await page.locator('#l3-point').isVisible());
        await page.locator('summary').tap();
        assert.match(await page.locator('#distance').textContent(), /1,5/);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        const ids = await page.locator('[id]').evaluateAll(elements => elements.map(element => element.id));
        assert.equal(new Set(ids).size, ids.length);
        await Promise.all([
          page.waitForURL('**/index.html#topic-mechanik'),
          page.getByRole('link', { name: '← Übersicht' }).tap(),
        ]);
        assert.deepEqual(errors, []);
        console.log(name, width, height, 'OK');
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  server.close();
}
