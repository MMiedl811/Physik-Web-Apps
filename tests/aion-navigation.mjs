import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || "playwright",
);
const browser = await (process.env.AION_WEBKIT ? webkit : chromium).launch({
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1024, height: 768 },
  hasTouch: true,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(
  process.env.AION_URL || "http://127.0.0.1:8767/aion-exit-game/",
);
await page.locator("#begin").click();
async function clickTile(x, y) {
  const b = await page.locator("#gameCanvas").boundingBox();
  await page.mouse.click(
    b.x + ((x + 0.5) * b.width) / 30,
    b.y + ((y + 0.5) * b.height) / 22,
  );
}
for (let r = 0; r < 5; r++) {
  console.log(
    "Walking to room",
    r,
    await page.evaluate(() => __AION_TEST__.getState().player),
  );
  const door = await page.evaluate((r) => __AION_TEST__.lore[r].door, r);
  await clickTile(...door);
  await page
    .waitForFunction((r) => __AION_TEST__.getState().room === r, r, {
      timeout: 16000,
    })
    .catch(async (e) => {
      console.log(
        await page.evaluate(() => ({
          state: __AION_TEST__.getState(),
          route,
          keys: [...keys],
        })),
      );
      await page.screenshot({ path: "/tmp/aion-tests/nav-fail.png" });
      throw e;
    });
  for (let i = 0; i < 3; i++) {
    await clickTile([7, 15, 23][i], 7);
    await page.locator("#stationGo").waitFor({ timeout: 16000 });
    assert.match(
      await page.locator("#dialogTitle").innerText(),
      new RegExp(
        await page.evaluate(
          ([r, i]) => __AION_TEST__.lore[r].stations[i],
          [r, i],
        ),
      ),
    );
    await page.locator("#close").click();
  }
  await clickTile(15, 13);
  await page.locator("#lockBack").waitFor({ timeout: 16000 });
  await page.locator("#lockBack").click();
  await clickTile(15, 20);
  await page.waitForFunction(() => __AION_TEST__.getState().room === -1, {
    timeout: 16000,
  });
  assert.equal(
    await page.evaluate(() => {
      const p = __AION_TEST__.getState().player;
      return __AION_TEST__.blocked(Math.round(p.x), Math.round(p.y));
    }),
    false,
    "exit spawn is walkable",
  );
}
await page.locator('[data-object="0"]').click();
await page.waitForTimeout(4000);
await page.screenshot({
  path: "/tmp/aion-tests/ipad-final.png",
  fullPage: true,
});
const box = await page.locator("#touchPad").boundingBox();
assert.ok(box.y + box.height <= 768, "Dpad fits iPad viewport");
await page.locator('[data-object="4"]').click();
await page.locator("#gameCanvas").focus();
await page.keyboard.down("ArrowLeft");
await page.waitForTimeout(350);
await page.keyboard.up("ArrowLeft");
const moved = await page.evaluate(() => __AION_TEST__.getState().player);
await page.locator("#journal").click();
await page.keyboard.down("ArrowRight");
await page.waitForTimeout(300);
await page.keyboard.up("ArrowRight");
assert.deepEqual(
  await page.evaluate(() => __AION_TEST__.getState().player),
  moved,
  "No walking through modal",
);
await page.keyboard.press("Escape");
// Storage restrictions do not prevent play; a visible warning replaces silent data loss.
const denied = await browser.newPage();
await denied.addInitScript(() => {
  Storage.prototype.setItem = function () {
    throw new DOMException("blocked", "SecurityError");
  };
});
await denied.goto("http://127.0.0.1:8767/aion-exit-game/");
await denied.locator("#begin").click();
assert.match(
  await denied.locator("#saveStatus").innerText(),
  /Speichern blockiert/,
);
const malformed = await browser.newPage();
await malformed.addInitScript(() =>
  localStorage.setItem(
    "aion_pixel_v1",
    '{"version":1,"room":99,"player":{"x":"bad","y":null},"solved":17,"cores":[0,0,88],"seconds":-5}',
  ),
);
await malformed.goto("http://127.0.0.1:8767/aion-exit-game/");
assert.equal(await malformed.evaluate(() => __AION_TEST__.getState().room), -1);
assert.equal(
  await malformed.evaluate(() => __AION_TEST__.getState().seconds),
  0,
);
assert.deepEqual(errors, []);
console.log(
  "PASS: actual click-to-walk into all 5 rooms, all 15 stations, all 5 locks, all exits; iPad controls; modal movement freeze; denied/malformed storage.",
);
await browser.close();
