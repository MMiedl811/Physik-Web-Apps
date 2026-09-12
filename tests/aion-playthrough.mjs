import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || "playwright",
);
const base = process.env.AION_URL || "http://127.0.0.1:8767/aion-exit-game/";
const out = process.env.AION_OUTPUT || "/tmp/aion-tests";
fs.mkdirSync(out, { recursive: true });
const browser = await (process.env.AION_WEBKIT ? webkit : chromium).launch({
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1366, height: 900 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base);
await page.locator("#begin").click();
const data = await page.evaluate(() => ({
  sectors: __AION_TEST__.sectors,
  lore: __AION_TEST__.lore,
  bonus: __AION_TEST__.bonusTasks,
}));
assert.equal(data.sectors.flatMap((s) => s.tasks).length, 30);
await page.screenshot({ path: out + "/campus.png", fullPage: true });
const reach = await page.evaluate(() =>
  __AION_TEST__.lore.map((l) => __AION_TEST__.pathTo(...l.door).length),
);
assert.ok(
  reach.every((n) => n > 0),
  "Every room reachable",
);
await page.locator('[data-object="5"]').click();
assert.match(await page.locator("#dialogBody").innerText(), /0 \/ 5/);
await page.locator("#gateBack").click();
// Actual keyboard movement and collision.
await page.locator("#gameCanvas").focus();
const before = await page.evaluate(() => __AION_TEST__.getState().player);
await page.keyboard.down("ArrowRight");
await page.waitForTimeout(350);
await page.keyboard.up("ArrowRight");
const after = await page.evaluate(() => __AION_TEST__.getState().player);
assert.ok(after.x > before.x);
// Each station in deliberately non-linear order; answers via actual controls.
for (const r of [2, 0, 4, 1, 3]) {
  await page.locator(`[data-object="${r}"]`).click();
  await page.locator('[data-object="3"]').click();
  assert.match(await page.locator("#dialogBody").innerText(), /0 \/ 3/);
  await page.locator("#lockBack").click();
  await page.screenshot({ path: out + `/room-${r}.png`, fullPage: true });
  for (const i of [1, 0, 2]) {
    await page.locator(`[data-object="${i}"]`).click();
    await page.locator("#stationGo").click();
    for (const t of data.sectors[r].tasks.slice(i * 2, i * 2 + 2)) {
      await page.locator("#readNote").click();
      assert.ok((await page.locator("#noteArea").innerText()).length > 30);
      if (t.type === "choice") {
        await page
          .locator(`[data-answer="${(t.answer + 1) % t.options.length}"]`)
          .click();
        assert.equal(await page.locator("#next").count(), 0);
        await page.locator("#hint").click();
        await page.locator("#hint").click();
        assert.match(
          await page.locator("#feedback").innerText(),
          /Lösungshilfe/,
        );
        await page.locator(`[data-answer="${t.answer}"]`).click();
      } else if (t.type === "number") {
        await page.locator("#answer").fill("1.87junk");
        await page.locator("#check").click();
        assert.equal(await page.locator("#next").count(), 0);
        await page.locator("#calc").click();
        assert.match(await page.locator("#calcOut").innerText(), /Jahre/);
        await page.locator("#answer").fill(String(t.answer).replace(".", ","));
        await page.locator("#check").click();
      } else {
        for (const word of t.answer)
          await page.locator(`[data-seq="${t.items.indexOf(word)}"]`).click();
        await page.locator("#check").click();
      }
      assert.match(await page.locator("#feedback").innerText(), /Gesichert/);
      await page.locator("#next").click();
    }
    await page.locator("#backRoom").click();
  }
  await page.locator('[data-object="3"]').click();
  await page.screenshot({ path: out + `/lock-${r}.png`, fullPage: true });
  if (r === 0) {
    for (const i of [2, 1, 0]) await page.locator(`[data-lock="${i}"]`).click();
    assert.match(await page.locator("#feedback").innerText(), /Noch nicht/);
    await page.locator("#clearLock").click();
    for (const i of [0, 1, 2]) await page.locator(`[data-lock="${i}"]`).click();
  }
  if (r === 1 || r === 4) {
    await page.locator('[data-lock="1"]').click();
    assert.match(await page.locator("#feedback").innerText(), /Noch nicht/);
    await page.locator('[data-lock="0"]').click();
  }
  if (r === 2) {
    await page.locator("#lockNumber").fill("8");
    await page.locator("#lockCheck").click();
    assert.match(await page.locator("#feedback").innerText(), /Noch nicht/);
    await page.locator("#lockNumber").fill("4");
    await page.locator("#lockCheck").click();
  }
  if (r === 3) {
    await page.locator('[data-lock="0"]').click();
    await page.locator("#lockCheck").click();
    assert.match(await page.locator("#feedback").innerText(), /Noch nicht/);
    await page.locator('[data-lock="0"]').click();
    await page.locator('[data-lock="1"]').click();
    await page.locator('[data-lock="2"]').click();
    await page.locator("#lockCheck").click();
  }
  assert.match(
    await page.locator("#dialogTitle").innerText(),
    /Werkzeug geborgen/,
  );
  await page.locator("#coreBack").click();
  // Full reload/resume after every room.
  await page.reload();
  await page.locator("#resume").click();
}
assert.equal(
  (await page.evaluate(() => __AION_TEST__.getState())).solved.length,
  30,
);
await page.locator('[data-object="5"]').click();
await page.locator("#gateCode").fill("47293");
await page.locator("#openGate").click();
assert.equal(
  (await page.evaluate(() => __AION_TEST__.getState())).escaped,
  false,
);
for (const r of [0, 1, 2, 3, 4])
  await page.locator(`[data-tool="${r}"]`).click();
await page.locator("#gateCode").fill("47293");
await page.locator("#openGate").click();
assert.equal(
  (await page.evaluate(() => __AION_TEST__.getState())).escaped,
  true,
);
await page.screenshot({ path: out + "/ending.png", fullPage: true });
const download = page.waitForEvent("download");
await page.locator("#export").click();
const dl = await download;
await dl.saveAs(out + "/team.txt");
assert.match(fs.readFileSync(out + "/team.txt", "utf8"), /Archiv gerettet: ja/);
await page.locator("#bonus").click();
for (let i = 0; i < 5; i++) {
  await page.locator(`[data-bonus="${i}"]`).click();
  await page.locator(`[data-banswer="${data.bonus[i].answer}"]`).click();
  await page.locator("#bonusBack").click();
}
assert.equal(
  (await page.evaluate(() => __AION_TEST__.getState())).bonus.length,
  5,
);
await page.locator("#close").click();
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload();
await page.locator("#resume").click();
await context.setOffline(true);
await page.reload();
await page.locator("#resume").click();
assert.equal(
  (await page.evaluate(() => __AION_TEST__.getState())).cores.length,
  5,
);
await context.setOffline(false);
for (const viewport of [
  { width: 1024, height: 768 },
  { width: 820, height: 1180 },
  { width: 390, height: 844 },
]) {
  await page.setViewportSize(viewport);
  await page.screenshot({
    path: out + `/campus-${viewport.width}.png`,
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "No horizontal overflow",
  );
  await page.locator("#journal").click();
  await page.screenshot({
    path: out + `/journal-${viewport.width}.png`,
    fullPage: true,
  });
  await page.locator("#journalBack").click();
  await page.locator('[data-object="1"]').click();
  await page.screenshot({
    path: out + `/room-${viewport.width}.png`,
    fullPage: true,
  });
  await page.locator('[data-object="4"]').click();
}
// Reset cancellation preserves solved state.
await page.locator("#menu").click();
await page.locator("#menuReset").click();
await page.locator("#cancelReset").click();
assert.equal(
  (await page.evaluate(() => __AION_TEST__.getState())).solved.length,
  30,
);
await page.locator("#menu").click();
await page.locator("#menuReset").click();
await page.locator("#confirmReset").click();
assert.equal(
  (await page.evaluate(() => __AION_TEST__.getState())).solved.length,
  0,
);
assert.deepEqual(errors, []);
fs.writeFileSync(
  out + "/result.json",
  JSON.stringify(
    {
      passed: true,
      coreQuestions: 30,
      locks: 5,
      exit: 1,
      bonus: 5,
      reachable: reach,
      viewports: 4,
      offline: true,
      reset: true,
      errors,
    },
    null,
    2,
  ),
);
console.log(fs.readFileSync(out + "/result.json", "utf8"));
await browser.close();
