const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, structuredClone, crypto: require("node:crypto").webcrypto,
  document: { addEventListener() {} }, localStorage: { getItem() { return null; }, setItem() {} } });
for (const file of ["bou-koku-regulations.js", "app.js"]) vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
vm.runInContext(`this.api = { state, getVoteInputContext, getCompletedVoteExileTargetId, getNextVoteInputDay,
  getDefaultVoteDialogDay, getNextStatusDayForStatus, getCurrentLogDay, applyAutoExileFromCompletedVotes,
  normalizeRunoffTieLimit, normalizeRoleSet, normalizeBoard, normalizeGameHistory, createGameHistory,
  getBoardPayload, createBoardPayloadFromHistory, buildCurrentTimeline, buildHistoryTimeline, resetBoardState };
  getActivePlayers = () => state.players;
  getSelectedTournament = () => null;
`, context);
const a = context.api;
a.state.players = "ABCDEF".split("").map((id) => ({ id, name: id, status: "alive", statusDay: null, participating: true,
  tournamentIds: ["test"], roleGuessCandidates: [], primaryRoleGuess: "", role: "" }));
a.state.selectedTournamentId = "test";
a.state.runoffTieLimit = 2;
const vote = (voterId, targetId, type = "normal", runoffRound = 0) => ({
  id: `${type}-${runoffRound}-${voterId}`, day: 1, voterId, targetId, type, runoffRound, order: 1 });
const normal = [vote("A", "B"), vote("B", "A"), vote("C", "A"), vote("D", "B"), vote("E", "A"), vote("F", "B")];
const tiedRound = (round) => [vote("C", "A", "runoff", round), vote("D", "A", "runoff", round),
  vote("E", "B", "runoff", round), vote("F", "B", "runoff", round)];
a.state.voteHistories = normal;
assert.equal(a.getVoteInputContext(1).runoffRound, 1, "normal tie does not count");
a.state.voteHistories = [...normal, ...tiedRound(1)];
assert.equal(a.getVoteInputContext(1).runoffRound, 2);
assert.equal(a.getVoteInputContext(1).noExile, undefined);
a.state.voteHistories.push(...tiedRound(2).slice(0, 3));
assert.equal(a.getVoteInputContext(1).voterPlayers.length, 1, "wait for all votes");
a.state.voteHistories.push(tiedRound(2)[3]);
assert.equal(a.getVoteInputContext(1).noExile, true);
assert.equal(a.getCompletedVoteExileTargetId(1), "");
assert.match(a.applyAutoExileFromCompletedVotes(1), /吊りなし/);
assert.ok(a.state.players.every((p) => p.status === "alive"));
assert.equal(a.getNextVoteInputDay(1), 2);
assert.equal(a.getDefaultVoteDialogDay(), 2);
assert.equal(a.getNextStatusDayForStatus("exiled"), 2);
assert.equal(a.getNextStatusDayForStatus("attacked"), 2);
assert.equal(a.getCurrentLogDay(), 2);
assert.match(a.buildCurrentTimeline().join("\n"), /追放なし/);
const history = a.createGameHistory("市民");
assert.equal(history.runoffTieLimit, 2);
assert.equal(a.normalizeGameHistory(history).runoffTieLimit, 2);
assert.equal(a.createBoardPayloadFromHistory(history).runoffTieLimit, 2);
assert.match(a.buildHistoryTimeline(history).join("\n"), /追放なし/);
const board = a.normalizeBoard({ id: "test", name: "test", payload: a.getBoardPayload() });
assert.equal(board.payload.runoffTieLimit, 2);
assert.equal(a.normalizeRoleSet({ id: "s", name: "s", composition: { werewolf: 1, villager: 5 }, runoffTieLimit: 2 }).runoffTieLimit, 2);
assert.equal(a.normalizeRoleSet({ id: "s", name: "s", composition: { werewolf: 1, villager: 5 } }).runoffTieLimit, 0);
assert.equal(a.getVoteInputContext(1, a.state.voteHistories, a.state.players, 0).runoffRound, 3, "unlimited keeps voting");
assert.equal(a.getVoteInputContext(1, a.state.voteHistories, a.state.players, 1).noExile, true);
assert.equal(a.getVoteInputContext(1, a.state.voteHistories.slice(0, -1)).noExile, undefined, "deletion reopens voting");
a.state.voteHistories = [...normal, ...tiedRound(1), ...tiedRound(2).map((v) => ({ ...v, targetId: "A" }))];
assert.equal(a.getCompletedVoteExileTargetId(1), "A", "single winner at limit still exiled");
assert.equal(a.getVoteInputContext(1).noExile, undefined);
for (const invalid of [undefined, -1, 1.5, 6, "bad"]) assert.equal(a.normalizeRunoffTieLimit(invalid), 0);
a.resetBoardState();
assert.equal(a.state.runoffTieLimit, 2);
assert.equal(a.state.voteHistories.length, 0);
console.log("PASS: runoff tie limits, completion, no-exile, next day, logs, board/history/set persistence, reset, unlimited, correction");
