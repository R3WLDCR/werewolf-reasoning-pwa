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
    getBuiltinRoleSets, normalizeBuiltinRoleSetOverride, normalizeTournament,
    renameEditingRoleSet, deleteEditingRoleSet, renameSelectedTournament, deleteSelectedTournament,
    getSyncPayload, getSelectableTournaments, ensureMatchDefaults,
    isRoleGuessSelectable, getHistoryRoleGuessOptionsHtml,
  };
`, context);
const api = context.api;
const guessComposition = { werewolf: 2, seer: 1, villager: 6, sister: 1 };
for (const role of ["werewolf", "seer", "villager", "sister", "unknown", "wolfSide", "confirmedWhite"]) {
  assert.equal(api.isRoleGuessSelectable(role, guessComposition, "おさかなじんろう"), true, role);
}
for (const role of ["medium", "guard", "fox", "other", "madman"]) {
  assert.equal(api.isRoleGuessSelectable(role, guessComposition, "亡国の人狼会", role), false, role);
}
assert.equal(api.isRoleGuessSelectable("sister", {}, "おさかなじんろう"), false);
const historyGuessOptions = api.getHistoryRoleGuessOptionsHtml({ id: "test", roleGuessCandidates: ["medium"], primaryRoleGuess: "medium" }, "おさかなじんろう", guessComposition);
assert.match(historyGuessOptions, /data-role-guess="sister"/);
assert.doesNotMatch(historyGuessOptions, /data-role-guess="medium"/);
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

// Name changes and deletion must never touch the board's role composition or history.
context.renderAndStore = () => {};
context.renderRoleCompositionEditor = () => {};
context.toast = () => {};
context.confirm = () => true;
context.prompt = () => "亡国の改名大会";
context.document.querySelectorAll = () => [];
vm.runInContext(`
  els.roleSetNameInput = { value: "新しいレギュ名" };
  els.roleSetNote = { hidden: false };
  els.roleCompositionSelfBiteInput = { checked: false };
  els.roleCompositionNoBiteInput = { checked: false };
`, context);
api.state.roleComposition = { werewolf: 2, seer: 1, guard: 1, villager: 4, regBigMan: 1 };
api.state.gameHistories = [{ id: "history", eventName: "亡国の人狼会", roleSetName: "6A", roleComposition: { werewolf: 1, villager: 3, madman: 1, wanderer: 1 } }];
api.state.boards = [{ id: "kept", payload: { selectedTournamentId: "bou", eventName: "亡国の人狼会", selectedRoleSetId: "", roleComposition: structuredClone(api.state.roleComposition), gameStatus: "preparing" } }];
const historyBefore = JSON.stringify(api.state.gameHistories);
const compositionBefore = JSON.stringify(api.state.roleComposition);
const standard = api.getVisibleRoleSets().find((preset) => preset.name === "6A");
vm.runInContext(`editingRoleSetId = ${JSON.stringify(standard.id)}; state.selectedRoleSetId = editingRoleSetId;`, context);
api.renameEditingRoleSet();
assert.equal(api.findRoleSet(standard.id).name, "新しいレギュ名");
assert.equal(JSON.stringify(api.state.roleComposition), compositionBefore);
assert.equal(JSON.stringify(api.state.gameHistories), historyBefore);
api.state.builtinRoleSetOverrides = JSON.parse(JSON.stringify(api.state.builtinRoleSetOverrides)).map(api.normalizeBuiltinRoleSetOverride);
assert.equal(api.findRoleSet(standard.id).name, "新しいレギュ名");
api.deleteEditingRoleSet();
assert.equal(api.findRoleSet(standard.id), undefined);
assert.equal(JSON.stringify(api.state.roleComposition), compositionBefore);
assert.equal(JSON.stringify(api.state.gameHistories), historyBefore);
api.state.builtinRoleSetOverrides = JSON.parse(JSON.stringify(api.state.builtinRoleSetOverrides)).map(api.normalizeBuiltinRoleSetOverride);
assert.equal(api.findRoleSet(standard.id), undefined, "deleted standard must stay deleted after normalization");
api.renameSelectedTournament();
assert.equal(api.state.tournaments.find((tournament) => tournament.id === "bou").name, "亡国の改名大会");
assert.equal(api.getVisibleRoleSets().length, 91);
assert.equal(api.isRoleAvailableForEvent("regBlackMage", "亡国の改名大会"), true);
assert.equal(api.state.boards[0].payload.eventName, "亡国の改名大会");
assert.equal(JSON.stringify(api.state.gameHistories), historyBefore);
api.state.tournaments = JSON.parse(JSON.stringify(api.state.tournaments)).map(api.normalizeTournament);
assert.equal(api.getVisibleRoleSets().length, 91, "catalog must survive tournament rename and normalization");
const syncPayload = api.getSyncPayload();
assert.equal(syncPayload.builtinRoleSetOverrides.find((override) => override.id === standard.id).deleted, true);
api.state.roleSets.push({ id: "rename-custom", name: "自作旧名", tournamentId: "bou", composition: { werewolf: 1, villager: 5 } });
vm.runInContext('editingRoleSetId = "rename-custom"; els.roleSetNameInput.value = "自作新名";', context);
api.renameEditingRoleSet();
assert.equal(api.findRoleSet("rename-custom").name, "自作新名");
assert.equal(JSON.stringify(api.state.roleComposition), compositionBefore);
api.deleteEditingRoleSet();
assert.equal(api.findRoleSet("rename-custom"), undefined);
const deletedCustom = api.state.roleSets[0];
vm.runInContext(`editingRoleSetId = ${JSON.stringify(deletedCustom.id)};`, context);
api.deleteEditingRoleSet();
assert.equal(api.getVisibleRoleSets().some((preset) => preset.name === deletedCustom.name), false, "deleting a custom override must not reveal its standard again");
context.saveCurrentBoardSnapshot = () => {};
context.createBoard = (_name, id) => { api.state.selectedTournamentId = id; };
api.deleteSelectedTournament();
assert.equal(api.getSelectableTournaments().some((tournament) => tournament.id === "bou"), false);
assert.equal(api.state.boards[0].payload.selectedTournamentId, "bou");
assert.equal(JSON.stringify(api.state.gameHistories), historyBefore);
assert.equal(api.state.builtinRoleSetOverrides.some((override) => override.deleted), true);
api.state.bouKokuCatalogInitialized = true;
api.ensureMatchDefaults();
assert.equal(api.getSelectableTournaments().some((tournament) => tournament.name === "亡国の人狼会"), false, "deleted/renamed tournament must not be seeded again");
api.state.selectedTournamentId = "fish";
api.deleteSelectedTournament();
assert.equal(api.getSelectableTournaments().length, 1);
assert.equal(api.getSelectableTournaments()[0].name, "未設定", "last tournament deletion must leave a usable preparation destination");
console.log("PASS: standard/custom rename and deletion, persistence/sync payload, tournament catalog rename, board/history preservation, no resurrection");
