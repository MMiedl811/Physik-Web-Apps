import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read = (name) =>
  fs.readFileSync(
    new URL("../aion-exit-game/" + name, import.meta.url),
    "utf8",
  );
const html = read("index.html"),
  game = read("game.js"),
  data = read("data.js"),
  css = read("style.css"),
  sw = read("service-worker.js");
for (const token of [
  'id="gameCanvas"',
  'id="touchPad"',
  'id="modal"',
  "data.js",
  "game.js",
  "style.css",
])
  assert.ok(html.includes(token), token);
const result = vm.runInNewContext(
  data +
    "\n" +
    game.slice(0, game.search(/const \$\s*=/)) +
    "\n({sectors,bonusTasks,lore})",
);
const tasks = result.sectors.flatMap((s) => s.tasks);
assert.equal(tasks.length, 30);
assert.equal(new Set(tasks.map((t) => t.taskId)).size, 30);
assert.equal(result.bonusTasks.length, 5);
assert.equal(result.lore.length, 5);
for (const s of result.sectors) {
  assert.equal(s.tasks.length, 6);
  for (const t of s.tasks) {
    assert.ok(t.hint);
    if (t.type === "choice")
      assert.ok(
        Number.isInteger(t.answer) &&
          t.answer >= 0 &&
          t.answer < t.options.length,
      );
    if (t.type === "sequence")
      assert.deepEqual([...t.items].sort(), [...t.answer].sort());
  }
}
assert.equal(tasks.filter((t) => t.type === "number").length, 2);
assert.ok(
  Math.abs(1.52 ** 1.5 - tasks.find((t) => t.taskId === "mars-period").answer) <
    0.03,
);
assert.ok(
  Math.abs(
    5.2 ** 1.5 - tasks.find((t) => t.taskId === "jupiter-period").answer,
  ) < 0.08,
);
assert.ok(
  !tasks.some((t) => /Bahnneigung|Schwarzschildradius|ΔI\/I/.test(t.question)),
);
assert.ok(/image-rendering:\s*pixelated/.test(css));
assert.ok(sw.includes("aion-eva-"));
assert.ok(!sw.includes("keys.filter(key=>key!==CACHE)"));
console.log(
  "AION contract OK: 30 EVA-scope tasks, 5 rooms, 5 bonus tasks, independent save and scoped offline cache.",
);
