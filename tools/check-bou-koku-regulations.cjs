const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const storage = new Map();
const context = vm.createContext({
  console,
  crypto: require("node:crypto").webcrypto,
  structuredClone,
  localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  document: { addEventListener() {} },
});
vm.runInContext(fs.readFileSync(path.join(root, "bou-koku-regulations.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "app.js"), "utf8"), context);
vm.runInContext(`
  this.api = {
    state, presets: BOUKOKU_REGULATIONS, roles: ROLE_LABELS, guessLabels: ROLE_GUESS_LABELS,
    guessCamps: ROLE_GUESS_CAMPS, getVisibleRoleSets, findRoleSet, normalizeRoleSet,
    normalizeRoleComposition, getRoleCompositionTotal, getRoleCompositionWolfCount,
    getRoleOptionsHtml, getRoleGuessClass, isRoleAvailableForEvent,
  };
`, context);
const api = context.api;
assert.equal(api.presets.length, 92);
assert.equal(new Set(api.presets.map((preset) => preset.code)).size, 92);
const mismatches = new Map([
  ["8D", 7], ["9D（アリス）", 10], ["11B", 12], ["11D", 10],
  ["14A", 15], ["14G", 13], ["14H", 13], ["15A", 16],
]);
for (const preset of api.presets) {
  const expected = mismatches.get(preset.code) || Number.parseInt(preset.code, 10);
  assert.equal(api.getRoleCompositionTotal(preset.composition), expected, preset.code);
  assert.deepEqual(JSON.parse(JSON.stringify(api.normalizeRoleComposition(preset.composition))), JSON.parse(JSON.stringify(preset.composition)), preset.code);
  assert.ok(api.getRoleCompositionWolfCount(preset.composition, preset) > 0, preset.code);
  if (mismatches.has(preset.code)) assert.match(preset.note, /配役合計/);
  for (const role of Object.keys(preset.composition)) {
    assert.ok(api.roles[role], `${preset.code}: CO role ${role}`);
    assert.ok(api.guessLabels[role], `${preset.code}: guess role ${role}`);
    assert.ok(Object.values(api.guessCamps).some((camp) => camp.some((item) => item.value === role)), `${preset.code}: selection ${role}`);
  }
}
api.state.tournaments = [{ id: "bou", name: "亡国の人狼会" }, { id: "fish", name: "おさかなじんろう" }];
api.state.selectedTournamentId = "fish";
assert.equal(api.getVisibleRoleSets().length, 0);
api.state.selectedTournamentId = "bou";
assert.equal(api.getVisibleRoleSets().length, 92);
const nineA = api.getVisibleRoleSets().find((preset) => preset.name === "9A（騎士）");
assert.equal(nineA.composition.guard, 1);
assert.equal(nineA.composition.medium, undefined);
const mediumA = api.getVisibleRoleSets().find((preset) => preset.name === "9A（霊媒師）");
assert.equal(mediumA.composition.medium, 1);
const roundTrip = api.normalizeRoleSet(JSON.parse(JSON.stringify(nineA)));
assert.deepEqual(JSON.parse(JSON.stringify(roundTrip.composition)), JSON.parse(JSON.stringify(nineA.composition)));
assert.equal(roundTrip.note, nineA.note);
api.state.roleSets.push({ ...roundTrip, id: "custom", composition: { werewolf: 2, seer: 1, villager: 6 } });
assert.equal(api.getVisibleRoleSets().length, 92);
assert.equal(api.getVisibleRoleSets().find((preset) => preset.name === nineA.name).id, "custom");
assert.equal(nineA.composition.guard, 1, "custom edit must not mutate built-in data");
assert.equal(api.isRoleAvailableForEvent("regBlackMage", "おさかなじんろう"), false);
assert.equal(api.isRoleAvailableForEvent("regBlackMage", "亡国の人狼会"), true);
assert.match(api.getRoleOptionsHtml("", "亡国の人狼会", { halfWerewolf: 1, musician: 1, madman: 1, villager: 3 }), /半人狼/);
assert.match(api.getRoleGuessClass("regBlackMage"), /role-regulation-other/);
assert.equal(api.getRoleCompositionWolfCount(api.presets.find((p) => p.code === "15F").composition, api.presets.find((p) => p.code === "15F")), 3);
console.log("PASS: 92 PDF presets, counts, role selections, tournament scope, custom priority, persistence, wolf attributes");
