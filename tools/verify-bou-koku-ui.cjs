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
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on("dialog", (dialog) => dialog.accept());
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("https://cdn.jsdelivr.net/**", (route) => route.fulfill({ contentType: "text/javascript", body: "" }));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator("#tournamentSelect").selectOption({ label: "亡国の人狼会" });
    assert.equal(await page.locator("#roleSetSelect option").count(), 93);
    await page.locator("#roleSetSelect").selectOption({ label: "亡国の人狼会 / 9A（騎士）" });
    for (let index = 1; index <= 9; index += 1) {
      await page.locator("#playerNameInput").fill(`検証参加者${index}`);
      await page.locator("#addPlayerForm button[type=submit]").click();
    }
    assert.match(await page.locator("#roleCompositionSummary").innerText(), /9 \/ 9人/);
    await page.locator("#editRoleCompositionBtn").click();
    assert.equal(await page.locator("#roleSetNameInput").inputValue(), "9A（騎士）");
    assert.equal(await page.locator("#deleteRoleSetBtn").isVisible(), false);
    assert.equal(await page.locator("#saveRoleSetBtn").isVisible(), false);
    await page.locator("#roleSetNameInput").fill("検証用9A");
    await page.locator("#saveNewRoleSetBtn").click();
    await page.locator("#closeRoleCompositionBtn").click();
    await page.evaluate(() => stateWriteQueue);
    await page.reload();
    assert.equal(await page.locator("#roleSetSelect option:checked").innerText(), "亡国の人狼会 / 検証用9A");
    await page.locator("#roleSetSelect").selectOption({ label: "亡国の人狼会 / 6C" });
    await page.locator("#editRoleCompositionBtn").click();
    assert.equal(await page.locator('[data-role-composition-role="halfWerewolf"][data-role-composition-delta="1"]').locator("..").locator("output").innerText(), "1");
    await page.locator("#closeRoleCompositionBtn").click();
    await page.locator("#roleSetSelect").selectOption({ label: "亡国の人狼会 / 14A" });
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
    assert.equal(await page.locator("#roleSetSelect option:checked").innerText(), "亡国の人狼会 / 14A");
    assert.equal(errors.length, 0, errors.join(" | "));
    console.log("PASS: built-in selection, application, custom save/reload, half-wolf, source warning, desktop/mobile, offline");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    clearTimeout(watchdog);
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
