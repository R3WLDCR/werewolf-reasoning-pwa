const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const watchdog = setTimeout(() => { console.error("UI verification timed out"); process.exit(1); }, 55000);

(async () => {
  const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
  const server = http.createServer((request, response) => {
    const file = path.join(root, new URL(request.url, "http://localhost").pathname.replace(/^\//, "") || "index.html");
    fs.readFile(file, (error, data) => {
      response.statusCode = error ? 404 : 200;
      response.setHeader("Content-Type", mime[path.extname(file)] || "text/plain");
      response.end(error ? "missing" : data);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
    const context = await browser.newContext();
    await context.route("https://cdn.jsdelivr.net/**", (route) => route.fulfill({ contentType: "text/javascript", body: "" }));
    const warmup = await context.newPage();
    await warmup.goto(`http://127.0.0.1:${server.address().port}/`);
    await warmup.evaluate(() => navigator.serviceWorker.ready);
    await warmup.close();
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    let promptAnswer;
    page.on("dialog", (dialog) => {
      const answer = promptAnswer;
      promptAnswer = undefined;
      return dialog.accept(answer);
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator("#tournamentSelect").selectOption({ label: "亡国の人狼会" });
    assert.equal(await page.locator("#roleSetSelect option").count(), 93);
    await page.locator("#roleSetSelect").selectOption({ label: "9A（騎士）" });
    for (let index = 1; index <= 9; index += 1) {
      await page.locator("#playerNameInput").fill(`検証参加者${index}`);
      await page.locator("#addPlayerForm button[type=submit]").click();
    }
    assert.match(await page.locator("#roleCompositionSummary").innerText(), /9 \/ 9人/);
    await page.evaluate(() => openRoleGuessDialog(state.players.find((player) => player.participating).id));
    const guessValues = await page.locator('#roleGuessCandidateOptions input[type="radio"]').evaluateAll((inputs) => inputs.map((input) => input.value));
    assert.deepEqual([...guessValues].sort(), ["villager", "seer", "guard", "werewolf", "regBigMan", "unknown", "wolfSide", "confirmedWhite"].sort());
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await page.locator("#roleGuessDialog").boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width);
      const screenshot = path.join(os.tmpdir(), `role-guess-composition-${width}.png`);
      await page.screenshot({ path: screenshot });
      console.log(`Screenshot: ${screenshot}`);
    }
    await page.locator("#closeRoleGuessBtn").click();
    await page.locator("#editRoleCompositionBtn").click();
    assert.equal(await page.locator("#roleSetNameInput").inputValue(), "9A（騎士）");
    assert.equal(await page.locator("#deleteRoleSetBtn").isVisible(), true);
    assert.equal(await page.locator("#saveRoleSetBtn").isVisible(), false);
    await page.locator("#roleCompositionRunoffTieLimitInput").selectOption("2");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator("#roleCompositionRunoffTieLimitInput").scrollIntoViewIfNeeded();
      const bounds = await page.locator("#roleCompositionRunoffTieLimitInput").boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width);
      await page.screenshot({ path: path.join(os.tmpdir(), `runoff-rule-${width}.png`) });
    }
    await page.locator("#roleSetNameInput").fill("検証用9A");
    await page.locator("#saveNewRoleSetBtn").click();
    await page.locator("#closeRoleCompositionBtn").click();
    await page.evaluate(() => stateWriteQueue);
    await page.reload();
    assert.equal(await page.locator("#roleSetSelect option:checked").innerText(), "検証用9A");
    assert.equal(await page.evaluate(() => state.runoffTieLimit), 2);
    await page.locator("#editRoleCompositionBtn").click();
    assert.equal(await page.locator("#roleCompositionRunoffTieLimitInput").inputValue(), "2");
    await page.locator("#closeRoleCompositionBtn").click();
    await page.locator("#roleSetSelect").selectOption({ label: "6C" });
    assert.equal(await page.evaluate(() => state.runoffTieLimit), 0);
    await page.locator("#editRoleCompositionBtn").click();
    assert.equal(await page.locator('[data-role-composition-role="halfWerewolf"][data-role-composition-delta="1"]').locator("..").locator("output").innerText(), "1");
    await page.locator("#closeRoleCompositionBtn").click();
    await page.locator("#roleSetSelect").selectOption({ label: "14A" });
    assert.match(await page.locator("#roleSetSetupNote").innerText(), /配役合計15人/);
    await page.locator("#editRoleCompositionBtn").click();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await page.locator("#roleSetNote").boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width);
      const screenshot = path.join(os.tmpdir(), `bou-koku-regulations-${width}.png`);
      await page.screenshot({ path: screenshot });
      console.log(`Screenshot: ${screenshot}`);
    }
    await page.locator("#closeRoleCompositionBtn").click();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; await stateWriteQueue; });
    await context.setOffline(true);
    await page.reload();
    assert.equal(await page.locator("#roleSetSelect option").count(), 94);
    assert.equal(await page.locator("#roleSetSelect option:checked").innerText(), "14A");
    await context.setOffline(false);
    await page.locator("#editRoleCompositionBtn").click();
    await page.locator("#roleSetNameInput").fill("14A 改名テスト");
    await page.locator("#renameRoleSetBtn").click();
    await page.locator("#closeRoleCompositionBtn").click();
    await page.evaluate(() => stateWriteQueue);
    await page.reload();
    assert.equal(await page.locator("#roleSetSelect option:checked").innerText(), "14A 改名テスト");
    assert.match(await page.locator("#roleCompositionSummary").innerText(), /15 \/ 9人/);
    await page.locator("#editRoleCompositionBtn").click();
    await page.locator("#deleteRoleSetBtn").click();
    await page.locator("#closeRoleCompositionBtn").click();
    await page.evaluate(() => stateWriteQueue);
    await page.reload();
    assert.equal(await page.locator("#roleSetSelect option").count(), 93);
    assert.equal((await page.locator("#roleSetSelect option").allTextContents()).some((name) => name.includes("14A")), false);
    assert.match(await page.locator("#roleCompositionSummary").innerText(), /15 \/ 9人/);
    promptAnswer = "亡国大会・変更後";
    await page.locator("#renameTournamentBtn").click();
    await page.evaluate(() => stateWriteQueue);
    await page.reload();
    assert.equal(await page.locator("#tournamentSelect option:checked").innerText(), "亡国大会・変更後");
    assert.equal(await page.locator("#roleSetSelect option").count(), 93);
    assert.equal((await page.locator("#tournamentSelect option").allTextContents()).includes("亡国の人狼会"), false);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await page.locator("#deleteTournamentBtn").boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width);
      await page.locator("#editRoleCompositionBtn").click();
      const renameBounds = await page.locator("#roleSetNameInput").boundingBox();
      assert.ok(renameBounds && renameBounds.x >= 0 && renameBounds.x + renameBounds.width <= width);
      await page.screenshot({ path: path.join(os.tmpdir(), `catalog-management-${width}.png`) });
      await page.locator("#closeRoleCompositionBtn").click();
    }
    const original = await page.evaluate(() => ({ boardId: activeBoardId, tournamentId: state.selectedTournamentId, composition: JSON.stringify(state.roleComposition), players: state.players.length }));
    await page.locator("#deleteTournamentBtn").click();
    await page.evaluate(() => stateWriteQueue);
    await page.reload();
    assert.equal((await page.locator("#tournamentSelect option").allTextContents()).includes("亡国大会・変更後"), false);
    const preserved = await page.evaluate((original) => ({
      composition: JSON.stringify(state.boards.find((board) => board.id === original.boardId)?.payload.roleComposition),
      players: state.players.length,
      deleted: state.tournaments.find((tournament) => tournament.id === original.tournamentId)?.deleted,
    }), original);
    assert.equal(preserved.composition, original.composition);
    assert.equal(preserved.players, original.players);
    assert.equal(preserved.deleted, true);
    await page.locator("#boardSwitcherBtn").click();
    await page.locator(`[data-board-id="${original.boardId}"]`).click();
    assert.match(await page.locator("#tournamentSelect option:checked").innerText(), /亡国大会・変更後（削除済み）/);
    assert.match(await page.locator("#roleCompositionSummary").innerText(), /15 \/ 9人/);
    assert.equal(errors.length, 0, errors.join(" | "));
    const runoffVoters = await page.evaluate(() => {
      state.players = state.players.slice(0, 6).map((p) => normalizePlayer({ ...p, status: "alive", statusDay: null }));
      state.runoffTieLimit = 2;
      state.results = [];
      state.roleActions = [];
      state.claimEvents = [];
      state.roleComposition = { werewolf: 1, villager: 5 };
      state.selectedRoleSetId = "";
      const ids = state.players.map((p) => p.id);
      const vote = (voterId, targetId, type = "normal", runoffRound = 0) => normalizeVoteHistory({ id: crypto.randomUUID(), day: 1, order: 1, voterId, targetId, type, runoffRound });
      state.voteHistories = ids.map((id, i) => vote(id, ids[i % 2 ? 0 : 1]));
      state.voteHistories.push(...ids.slice(2).map((id, i) => vote(id, ids[i < 2 ? 0 : 1], "runoff", 1)));
      renderAndStore();
      openVoteDialog();
      return ids;
    });
    assert.match(await page.locator("#voteModeNotice").innerText(), /決選投票/);
    await page.locator(`[data-runoff-target="${runoffVoters[0]}"]`).click();
    for (const id of runoffVoters.slice(2, 4)) await page.locator(`[data-runoff-voter="${id}"]`).click();
    await page.locator("[data-runoff-confirm]").click();
    assert.equal(await page.locator("#voteDayInput").inputValue(), "2");
    assert.match(await page.locator("#voteSummaryPanel").innerText(), /吊りなし/);
    assert.equal(await page.evaluate(() => state.players.every((p) => p.status === "alive")), true);
    await page.locator("#voteDayInput").fill("1");
    await page.locator("#voteDayInput").dispatchEvent("change");
    assert.match(await page.locator("#voteModeNotice").innerText(), /2回同票/);
    assert.equal(await page.locator("#addVoteBtn").isDisabled(), true);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.screenshot({ path: path.join(os.tmpdir(), `runoff-no-exile-${width}.png`) });
    }
    await page.evaluate(() => stateWriteQueue);
    await page.reload();
    await page.evaluate(() => openVoteDialog());
    assert.equal(await page.locator("#voteDayInput").inputValue(), "2");
    assert.match(await page.locator("#voteSummaryPanel").innerText(), /吊りなし/);
    assert.equal(errors.length, 0, errors.join(" | "));
    console.log("PASS: selection, custom save, desktop/mobile, offline, rename/delete persistence, tournament rename, preserved archived board and roster");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    clearTimeout(watchdog);
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
