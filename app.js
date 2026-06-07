const STORAGE_KEY = "werewolf-reasoning-note-v1";
const SYNC_META_KEY = "werewolf-reasoning-sync-meta-v1";
const DEVICE_ID_KEY = "werewolf-reasoning-device-id";
const SYNC_DELAY_MS = 10000;
const ROLE_LABELS = {
  seer: "預言者",
  medium: "霊媒師",
  guard: "ボディガード",
  villager: "市民",
  madman: "裏切り者",
  wolfSide: "狼狂",
  werewolf: "人狼",
  other: "その他",
  hunter: "ハンター",
  fox: "妖狐",
  teruteru: "てるてる",
};
const ROLE_ORDER = {
  seer: 0,
  medium: 1,
  guard: 2,
  hunter: 3,
};
const RIVAL_DISPLAY_ROLES = new Set(["medium", "guard", "hunter"]);
const STATUS_LABELS = {
  alive: "生存",
  exiled: "追放",
  attacked: "襲撃",
};
const RESULT_LABELS = {
  human: "村人",
  werewolf: "人狼",
};
const CIRCLED_NUMBERS = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
const STANDARD_IMPRESSION_REASONS = [
  { id: "standard-villager-light", label: "動きが軽い", side: "villager", custom: false },
  { id: "standard-villager-natural-talk", label: "発言が自然", side: "villager", custom: false },
  { id: "standard-villager-honest-reaction", label: "反応が素直", side: "villager", custom: false },
  { id: "standard-villager-natural-vote", label: "投票が自然", side: "villager", custom: false },
  { id: "standard-villager-natural-view", label: "視点が自然", side: "villager", custom: false },
  { id: "standard-villager-growing-reasoning", label: "推理が伸びる", side: "villager", custom: false },
  { id: "standard-werewolf-stiff", label: "動きが硬い", side: "werewolf", custom: false },
  { id: "standard-werewolf-heavy-talk", label: "発言が重い", side: "werewolf", custom: false },
  { id: "standard-werewolf-defensive", label: "反応が防御的", side: "werewolf", custom: false },
  { id: "standard-werewolf-unnatural-vote", label: "投票が不自然", side: "werewolf", custom: false },
  { id: "standard-werewolf-unnatural-view", label: "視点が不自然", side: "werewolf", custom: false },
  { id: "standard-werewolf-following", label: "便乗が多い", side: "werewolf", custom: false },
];
const ROLE_GUESS_LABELS = {
  unknown: "不明",
  seer: "預言者",
  medium: "霊媒師",
  guard: "ボディガード",
  villager: "市民",
  madman: "裏切り者",
  wolfSide: "狼狂",
  werewolf: "人狼",
  other: "その他",
  hunter: "ハンター",
  fox: "妖狐",
  teruteru: "てるてる",
};

const state = {
  day: 1,
  eventName: "",
  eventDate: "",
  gameNumber: 1,
  activeView: "participants",
  rosterFilter: "tournament",
  tournaments: [],
  selectedTournamentId: "",
  wolfCount: 2,
  players: [],
  results: [],
  gameStatus: "preparing",
  startedAt: "",
  gameHistories: [],
  customImpressionReasons: [],
};

const els = {};
let editingPlayerId = "";
let editingSeerId = "";
let membershipPlayerId = "";
let statusPlayerId = "";
let draggedPlayerId = "";
let selectedHistoryId = "";
let editingHistoryId = "";
let bulkDeleteHistoryScope = "";
let impressionPlayerId = "";
let impressionDraftReasons = [];
let roleGuessPlayerId = "";
let toastTimer = null;
let syncTimer = null;
let supabaseClient = null;
let syncUser = null;
let pendingCloudRecord = null;
let applyingCloudState = false;
let hadLocalDataAtStartup = Boolean(localStorage.getItem(STORAGE_KEY));
let syncMeta = restoreSyncMeta();
const deviceId = getOrCreateDeviceId();

document.addEventListener("DOMContentLoaded", () => {
  [
    "gameStatusBadge",
    "startGameBtn",
    "returnSetupBtn",
    "finishGameBtn",
    "nextGameBtn",
    "participantsView",
    "reasoningView",
    "exportView",
    "syncView",
    "remoteUpdateBanner",
    "tournamentSelect",
    "addTournamentBtn",
    "renameTournamentBtn",
    "eventDateInput",
    "openDatePickerBtn",
    "clearDateBtn",
    "gameNumberInput",
    "matchSummary",
    "wolfCountSelect",
    "addPlayerForm",
    "playerNameInput",
    "playerCountBadge",
    "participantRows",
    "participantEmptyState",
    "ropeCountBadge",
    "playerRows",
    "emptyState",
    "exportSummary",
    "copyExportBtn",
    "historyCountBadge",
    "historyList",
    "historyEmptyState",
    "historyDetailPanel",
    "historyDetailPreview",
    "closeHistoryDetailBtn",
    "editHistoryBtn",
    "copyHistoryBtn",
    "deleteHistoryBtn",
    "deleteTournamentHistoriesBtn",
    "deleteAllHistoriesBtn",
    "editDialog",
    "editForm",
    "editPlayerName",
    "closeEditBtn",
    "roleSelect",
    "resultSeerHint",
    "resultValueSelect",
    "memoInput",
    "statusDialog",
    "statusPlayerName",
    "closeStatusBtn",
    "markExiledBtn",
    "markAttackedBtn",
    "markAliveBtn",
    "membershipDialog",
    "membershipForm",
    "membershipPlayerName",
    "membershipOptions",
    "closeMembershipBtn",
    "finishGameDialog",
    "finishGameForm",
    "closeFinishGameBtn",
    "winnerSelect",
    "otherWinnerField",
    "otherWinnerInput",
    "finishTrueRoleFields",
    "historyEditDialog",
    "historyEditForm",
    "historyEditTitle",
    "closeHistoryEditBtn",
    "historyEventNameInput",
    "historyEventDateInput",
    "historyGameNumberInput",
    "historyWinnerInput",
    "historyPlayerEditor",
    "historyResultEditor",
    "addHistoryResultBtn",
    "bulkDeleteHistoryDialog",
    "bulkDeleteHistoryForm",
    "bulkDeleteHistoryTitle",
    "bulkDeleteHistoryMessage",
    "bulkDeleteConfirmInput",
    "confirmBulkDeleteHistoryBtn",
    "closeBulkDeleteHistoryBtn",
    "impressionDialog",
    "impressionPlayerName",
    "impressionSummary",
    "villagerReasonOptions",
    "werewolfReasonOptions",
    "customReasonList",
    "customReasonForm",
    "customReasonNameInput",
    "customReasonSideSelect",
    "addCustomReasonBtn",
    "saveImpressionBtn",
    "closeImpressionBtn",
    "roleGuessDialog",
    "roleGuessPlayerName",
    "roleGuessCandidateOptions",
    "primaryRoleGuessSelect",
    "saveRoleGuessBtn",
    "closeRoleGuessBtn",
    "syncStatusText",
    "syncStatusBadge",
    "syncConfigNotice",
    "syncSignedOutPanel",
    "syncSignedInPanel",
    "syncAccountEmail",
    "lastSyncText",
    "loginForm",
    "loginEmailInput",
    "loginPasswordInput",
    "signupForm",
    "signupEmailInput",
    "signupPasswordInput",
    "passwordResetForm",
    "resetEmailInput",
    "passwordUpdateForm",
    "newPasswordInput",
    "manualSyncBtn",
    "logoutBtn",
    "syncConflictPanel",
    "syncConflictTitle",
    "syncConflictMessage",
    "localUpdatedText",
    "cloudUpdatedText",
    "downloadCloudBtn",
    "uploadLocalBtn",
    "toast",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });

  restore();
  ensureMatchDefaults();
  bindEvents();
  render();
  registerServiceWorker();
  initializeSync();
});

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = normalizeActiveView(button.dataset.view);
      renderAndStore();
    });
  });
  document.querySelectorAll("[data-roster-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.rosterFilter = normalizeRosterFilter(button.dataset.rosterFilter);
      renderAndStore();
    });
  });
  els.tournamentSelect.addEventListener("change", () => switchTournament(els.tournamentSelect.value));
  els.addTournamentBtn.addEventListener("click", addTournament);
  els.renameTournamentBtn.addEventListener("click", renameSelectedTournament);
  els.eventDateInput.addEventListener("change", () => {
    if (isGameLocked()) return render();
    state.eventDate = normalizeDateValue(els.eventDateInput.value);
    renderAndStore();
  });
  els.openDatePickerBtn.addEventListener("click", openDatePicker);
  els.clearDateBtn.addEventListener("click", () => {
    if (isGameLocked()) return toast("進行中・終了済みは開催日を変更できません");
    state.eventDate = "";
    renderAndStore();
  });
  els.gameNumberInput.addEventListener("change", () => {
    if (isGameLocked()) return render();
    state.gameNumber = normalizeGameNumber(els.gameNumberInput.value);
    renderAndStore();
  });
  els.addPlayerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addPlayer();
  });
  els.wolfCountSelect.addEventListener("change", () => {
    if (isGameLocked()) return render();
    state.wolfCount = normalizeWolfCount(els.wolfCountSelect.value);
    renderAndStore();
  });
  els.startGameBtn.addEventListener("click", startGame);
  els.returnSetupBtn.addEventListener("click", returnToSetup);
  els.finishGameBtn.addEventListener("click", openFinishGameDialog);
  els.nextGameBtn.addEventListener("click", prepareNextGame);
  els.copyExportBtn.addEventListener("click", copyExport);
  els.closeHistoryDetailBtn.addEventListener("click", closeHistoryDetail);
  els.editHistoryBtn.addEventListener("click", openHistoryEditDialog);
  els.copyHistoryBtn.addEventListener("click", copySelectedHistory);
  els.deleteHistoryBtn.addEventListener("click", deleteSelectedHistory);
  els.deleteTournamentHistoriesBtn.addEventListener("click", () => openBulkDeleteHistoryDialog("tournament"));
  els.deleteAllHistoriesBtn.addEventListener("click", () => openBulkDeleteHistoryDialog("all"));
  els.closeEditBtn.addEventListener("click", closeEditDialog);
  els.editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEditingPlayer();
  });
  els.editDialog.addEventListener("click", (event) => {
    if (event.target === els.editDialog) closeEditDialog();
  });
  els.closeStatusBtn.addEventListener("click", closeStatusDialog);
  els.statusDialog.addEventListener("click", (event) => {
    if (event.target === els.statusDialog) closeStatusDialog();
  });
  els.markExiledBtn.addEventListener("click", () => setPlayerStatus("exiled"));
  els.markAttackedBtn.addEventListener("click", () => setPlayerStatus("attacked"));
  els.markAliveBtn.addEventListener("click", () => setPlayerStatus("alive"));
  els.closeMembershipBtn.addEventListener("click", closeMembershipDialog);
  els.membershipDialog.addEventListener("click", (event) => {
    if (event.target === els.membershipDialog) closeMembershipDialog();
  });
  els.membershipForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveMemberships();
  });
  els.closeFinishGameBtn.addEventListener("click", closeFinishGameDialog);
  els.winnerSelect.addEventListener("change", () => {
    els.otherWinnerField.hidden = els.winnerSelect.value !== "その他";
  });
  els.finishGameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    finishGame();
  });
  els.finishGameDialog.addEventListener("click", (event) => {
    if (event.target === els.finishGameDialog) closeFinishGameDialog();
  });
  els.closeHistoryEditBtn.addEventListener("click", closeHistoryEditDialog);
  els.historyEditForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveHistoryEdits();
  });
  els.addHistoryResultBtn.addEventListener("click", addHistoryResultEditorRow);
  els.historyEditDialog.addEventListener("click", (event) => {
    if (event.target === els.historyEditDialog) closeHistoryEditDialog();
  });
  els.closeBulkDeleteHistoryBtn.addEventListener("click", closeBulkDeleteHistoryDialog);
  els.bulkDeleteConfirmInput.addEventListener("input", renderBulkDeleteConfirmation);
  els.bulkDeleteHistoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    deleteHistoriesInScope();
  });
  els.bulkDeleteHistoryDialog.addEventListener("click", (event) => {
    if (event.target === els.bulkDeleteHistoryDialog) closeBulkDeleteHistoryDialog();
  });
  els.closeImpressionBtn.addEventListener("click", closeImpressionDialog);
  els.saveImpressionBtn.addEventListener("click", saveImpressionSelection);
  els.addCustomReasonBtn.addEventListener("click", addCustomImpressionReason);
  els.impressionDialog.addEventListener("click", (event) => {
    if (event.target === els.impressionDialog) closeImpressionDialog();
  });
  els.closeRoleGuessBtn.addEventListener("click", closeRoleGuessDialog);
  els.saveRoleGuessBtn.addEventListener("click", saveRoleGuess);
  els.roleGuessDialog.addEventListener("click", (event) => {
    if (event.target === els.roleGuessDialog) closeRoleGuessDialog();
  });
  els.remoteUpdateBanner.addEventListener("click", () => {
    state.activeView = "sync";
    render();
  });
  els.loginForm.addEventListener("submit", handleLogin);
  els.signupForm.addEventListener("submit", handleSignup);
  els.passwordResetForm.addEventListener("submit", handlePasswordReset);
  els.passwordUpdateForm.addEventListener("submit", handlePasswordUpdate);
  els.manualSyncBtn.addEventListener("click", () => synchronizeNow({ manual: true }));
  els.logoutBtn.addEventListener("click", logoutAndClearLocalData);
  els.downloadCloudBtn.addEventListener("click", downloadPendingCloudState);
  els.uploadLocalBtn.addEventListener("click", uploadLocalState);
  window.addEventListener("online", () => {
    if (document.visibilityState === "visible") synchronizeNow();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      synchronizeNow();
    } else {
      cancelScheduledSync();
    }
  });
}

function openDatePicker() {
  if (typeof els.eventDateInput.showPicker === "function") {
    els.eventDateInput.showPicker();
    return;
  }
  els.eventDateInput.focus();
  els.eventDateInput.click();
}

function addTournament() {
  if (isGameLocked()) return toast("進行中・終了済みは大会を追加できません");
  const name = prompt("追加する大会名");
  if (!name?.trim()) return;
  const tournament = { id: crypto.randomUUID(), name: name.trim() };
  state.tournaments.push(tournament);
  switchTournament(tournament.id, { skipConfirm: true });
}

function renameSelectedTournament() {
  if (isGameLocked()) return toast("進行中・終了済みは大会名を変更できません");
  const tournament = getSelectedTournament();
  if (!tournament) return;
  const name = prompt("大会名を変更", tournament.name);
  if (!name?.trim()) return;
  tournament.name = name.trim();
  state.eventName = tournament.name;
  renderAndStore();
  toast("大会名を変更しました");
}

function switchTournament(tournamentId, { skipConfirm = false } = {}) {
  if (!state.tournaments.some((tournament) => tournament.id === tournamentId)) return;
  if (tournamentId === state.selectedTournamentId) return;
  if (isGameLocked()) {
    render();
    toast("ゲーム終了または準備へ戻ってから大会を切り替えてください");
    return;
  }
  if (!skipConfirm && !confirm("大会を切り替えて、新しい卓を開始しますか？")) {
    render();
    return;
  }
  state.selectedTournamentId = tournamentId;
  state.eventName = getSelectedTournament()?.name || "";
  state.eventDate = "";
  state.gameNumber = 1;
  resetBoardState();
  applySelectedTournamentParticipation();
  state.rosterFilter = "tournament";
  renderAndStore();
  toast("大会を切り替えました");
}

function addPlayer() {
  if (isGameLocked()) return toast("進行中・終了済みは参加者を変更できません");
  const name = els.playerNameInput.value.trim();
  if (!name) return;
  const existing = state.players.find((player) => player.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase());
  if (existing) {
    if (state.rosterFilter === "tournament" && state.selectedTournamentId && !existing.tournamentIds.includes(state.selectedTournamentId)) {
      existing.tournamentIds.push(state.selectedTournamentId);
      existing.participationByTournament[state.selectedTournamentId] = true;
      existing.participating = true;
      toast("既存メンバーを大会名簿へ追加しました");
    } else {
      toast("同じ名前は登録済みです");
    }
    els.playerNameInput.value = "";
    renderAndStore();
    return;
  }
  const tournamentIds = state.rosterFilter === "tournament" && state.selectedTournamentId ? [state.selectedTournamentId] : [];
  const participationByTournament = tournamentIds.length ? { [state.selectedTournamentId]: true } : {};
  state.players.push({
    id: crypto.randomUUID(),
    name,
    role: "",
    participating: tournamentIds.length > 0,
    tournamentIds,
    participationByTournament,
    status: "alive",
    statusDay: null,
    memo: "",
    impressionReasons: [],
    roleGuessCandidates: [],
    primaryRoleGuess: "",
    trueRole: "",
    roleClaimOrder: null,
  });
  els.playerNameInput.value = "";
  renderAndStore();
}

function startGame() {
  const activeCount = getActivePlayers().length;
  if (!activeCount) return toast("参加者を1人以上選んでください");
  if (!state.wolfCount || state.wolfCount >= activeCount) return toast("人狼数は参加者数より少なくしてください");
  state.gameStatus = "in_progress";
  state.startedAt = new Date().toISOString();
  state.activeView = "reasoning";
  renderAndStore();
  toast("ゲームを開始しました");
}

function autoStartGameFromBoardInput() {
  if (state.gameStatus !== "preparing" || !hasBoardProgress()) return false;
  const activeCount = getActivePlayers().length;
  if (!activeCount || !state.wolfCount || state.wolfCount >= activeCount) return false;
  state.gameStatus = "in_progress";
  state.startedAt = new Date().toISOString();
  return true;
}

function hasBoardProgress() {
  if (state.results.length) return true;
  return getActivePlayers().some(
    (player) =>
      Boolean(player.role) ||
      Boolean(player.memo) ||
      isInactiveStatus(player.status) ||
      player.impressionReasons.length > 0 ||
      player.roleGuessCandidates.some((value) => value !== "unknown") ||
      Boolean(player.primaryRoleGuess),
  );
}

function returnToSetup() {
  if (!isGameInProgress()) return;
  if (!confirm("盤面を残したまま準備中へ戻りますか？")) return;
  state.gameStatus = "preparing";
  state.startedAt = "";
  state.activeView = "participants";
  renderAndStore();
  toast("準備中へ戻りました");
}

function openFinishGameDialog() {
  if (!isGameInProgress()) return;
  els.winnerSelect.value = "";
  els.otherWinnerInput.value = "";
  els.otherWinnerField.hidden = true;
  renderFinishTrueRoleFields();
  els.finishGameDialog.showModal();
}

function closeFinishGameDialog() {
  els.finishGameDialog.close();
}

function finishGame() {
  if (!isGameInProgress()) return;
  const selectedWinner = els.winnerSelect.value;
  const winner = selectedWinner === "その他" ? els.otherWinnerInput.value.trim() : selectedWinner;
  if (!winner) return toast("勝利陣営を選んでください");
  const trueRoles = getFinishTrueRoles();
  if (!trueRoles) return toast("参加者全員の真の役職を選んでください");
  const history = createGameHistory(winner, trueRoles);
  state.gameHistories.unshift(history);
  state.players.forEach((player) => {
    player.trueRole = trueRoles.get(player.id) || "";
  });
  state.gameStatus = "finished";
  state.activeView = "reasoning";
  selectedHistoryId = state.gameHistories[0].id;
  closeFinishGameDialog();
  renderAndStore();
  toast("ゲームを終了して盤面を保存しました");
}

function prepareNextGame() {
  if (!isGameFinished() || !confirm("終了済み盤面を初期化して次試合の準備へ進みますか？")) return;
  state.gameStatus = "preparing";
  state.startedAt = "";
  state.gameNumber = normalizeGameNumber(state.gameNumber + 1);
  resetBoardState();
  state.activeView = "participants";
  renderAndStore();
  toast("次試合の準備へ進みました");
}

function renderFinishTrueRoleFields() {
  els.finishTrueRoleFields.innerHTML = getActivePlayers()
    .map(
      (player) => `
        <label class="finish-true-role-field">
          <span>${escapeHtml(player.name)}</span>
          <select data-true-role-player-id="${escapeHtml(player.id)}" required>
            <option value="">役職を選択</option>
            ${getTrueRoleOptionsHtml(player.primaryRoleGuess)}
          </select>
        </label>
      `,
    )
    .join("");
}

function getTrueRoleOptionsHtml(selectedRole = "") {
  return Object.entries(ROLE_GUESS_LABELS)
    .filter(([role]) => role !== "unknown" && role !== "wolfSide")
    .map(([role, label]) => `<option value="${role}" ${role === selectedRole ? "selected" : ""}>${label}</option>`)
    .join("");
}

function getFinishTrueRoles() {
  const entries = Array.from(els.finishTrueRoleFields.querySelectorAll("[data-true-role-player-id]")).map((select) => [
    select.dataset.trueRolePlayerId,
    select.value,
  ]);
  if (entries.length !== getActivePlayers().length || entries.some(([, role]) => !role)) return null;
  return new Map(entries);
}

function createGameHistory(winner, trueRoles = new Map()) {
  const players = structuredClone(state.players);
  players.forEach((player) => {
    player.trueRole = trueRoles.get(player.id) || "";
  });
  return {
    id: crypto.randomUUID(),
    eventName: getSelectedTournament()?.name || state.eventName || "未設定",
    eventDate: state.eventDate,
    gameNumber: state.gameNumber,
    wolfCount: state.wolfCount,
    winner,
    startedAt: state.startedAt,
    finishedAt: new Date().toISOString(),
    players,
    results: structuredClone(state.results),
    selectedTournamentId: state.selectedTournamentId,
  };
}

function resetBoardState() {
  state.day = 1;
  state.players = state.players.map((player) => ({
    ...player,
    role: "",
    status: "alive",
    statusDay: null,
    memo: "",
    impressionReasons: [],
    roleGuessCandidates: [],
    primaryRoleGuess: "",
    trueRole: "",
    roleClaimOrder: null,
  }));
  state.results = [];
}

function applySelectedTournamentParticipation() {
  state.players.forEach((player) => {
    player.participating = isPlayerInSelectedTournament(player)
      ? player.participationByTournament[state.selectedTournamentId] !== false
      : false;
  });
}

function openMembershipDialog(playerId) {
  if (isGameLocked()) return toast("進行中・終了済みは所属大会を変更できません");
  const player = findPlayer(playerId);
  if (!player) return;
  membershipPlayerId = playerId;
  els.membershipPlayerName.textContent = player.name;
  els.membershipOptions.innerHTML = state.tournaments
    .map(
      (tournament) => `
        <label class="membership-option">
          <input type="checkbox" value="${escapeHtml(tournament.id)}" ${player.tournamentIds.includes(tournament.id) ? "checked" : ""} />
          <span>${escapeHtml(tournament.name)}</span>
        </label>
      `,
    )
    .join("");
  els.membershipDialog.showModal();
}

function closeMembershipDialog() {
  membershipPlayerId = "";
  els.membershipDialog.close();
}

function saveMemberships() {
  const player = findPlayer(membershipPlayerId);
  if (!player) return;
  const selectedIds = Array.from(els.membershipOptions.querySelectorAll('input[type="checkbox"]:checked')).map(
    (input) => input.value,
  );
  player.tournamentIds = selectedIds;
  selectedIds.forEach((tournamentId) => {
    if (!Object.hasOwn(player.participationByTournament, tournamentId)) player.participationByTournament[tournamentId] = true;
  });
  player.participating = isPlayerInSelectedTournament(player)
    ? player.participationByTournament[state.selectedTournamentId] !== false
    : false;
  closeMembershipDialog();
  renderAndStore();
  toast("所属を保存しました");
}

function openImpressionDialog(playerId) {
  if (isGameFinished()) return toast("終了済み盤面は編集できません");
  const player = findPlayer(playerId);
  if (!player) return;
  impressionPlayerId = playerId;
  impressionDraftReasons = player.impressionReasons.map((reason) => ({ ...reason }));
  els.impressionPlayerName.textContent = player.name;
  renderImpressionDialog();
  els.impressionDialog.showModal();
}

function closeImpressionDialog() {
  impressionPlayerId = "";
  impressionDraftReasons = [];
  els.impressionDialog.close();
}

function renderImpressionDialog() {
  const player = findPlayer(impressionPlayerId);
  if (!player) return;
  const selectedIds = new Set(impressionDraftReasons.map((reason) => reason.id));
  const reasons = getAvailableImpressionReasons();
  els.villagerReasonOptions.innerHTML = getImpressionReasonOptionsHtml(
    reasons.filter((reason) => reason.side === "villager"),
    selectedIds,
  );
  els.werewolfReasonOptions.innerHTML = getImpressionReasonOptionsHtml(
    reasons.filter((reason) => reason.side === "werewolf"),
    selectedIds,
  );
  els.customReasonList.innerHTML = state.customImpressionReasons.length
    ? state.customImpressionReasons
        .map(
          (reason) => `
            <div class="custom-reason-item">
              <span class="impression-dot ${reason.side}"></span>
              <span>${escapeHtml(reason.label)}</span>
              <button class="danger-button" type="button" data-delete-custom-reason="${escapeHtml(reason.id)}">削除</button>
            </div>
          `,
        )
        .join("")
    : '<div class="empty-inline">自由ラベルなし</div>';
  els.customReasonList.querySelectorAll("[data-delete-custom-reason]").forEach((button) => {
    button.addEventListener("click", () => deleteCustomImpressionReason(button.dataset.deleteCustomReason));
  });
  updateImpressionDialogSummary();
}

function getImpressionReasonOptionsHtml(reasons, selectedIds) {
  return reasons
    .map(
      (reason) => `
        <label class="impression-reason-option ${reason.side}">
          <input type="checkbox" value="${escapeHtml(reason.id)}" ${selectedIds.has(reason.id) ? "checked" : ""} />
          <span>${escapeHtml(reason.label)}</span>
        </label>
      `,
    )
    .join("");
}

function getAvailableImpressionReasons() {
  const player = findPlayer(impressionPlayerId);
  const available = [...STANDARD_IMPRESSION_REASONS, ...state.customImpressionReasons];
  const ids = new Set(available.map((reason) => reason.id));
  impressionDraftReasons.forEach((reason) => {
    if (!ids.has(reason.id)) available.push(reason);
  });
  return available;
}

function updateImpressionDialogSummary() {
  const reasons = getSelectedImpressionReasonsFromDialog();
  impressionDraftReasons = reasons;
  const impression = getImpressionFromReasons(reasons);
  els.impressionSummary.textContent = `${impression.label} / 村${impression.villagerCount}・狼${impression.werewolfCount}`;
  els.impressionSummary.className = `impression-summary impression-${impression.value}`;
  els.impressionDialog.querySelectorAll('.impression-reason-options input[type="checkbox"]').forEach((input) => {
    input.onchange = updateImpressionDialogSummary;
  });
}

function getSelectedImpressionReasonsFromDialog() {
  const reasonMap = new Map(getAvailableImpressionReasons().map((reason) => [reason.id, reason]));
  return Array.from(els.impressionDialog.querySelectorAll('.impression-reason-options input[type="checkbox"]:checked'))
    .map((input) => reasonMap.get(input.value))
    .filter(Boolean)
    .map((reason) => ({ ...reason }));
}

function saveImpressionSelection() {
  const player = findPlayer(impressionPlayerId);
  if (!player) return;
  player.impressionReasons = impressionDraftReasons.map((reason) => ({ ...reason }));
  autoStartGameFromBoardInput();
  closeImpressionDialog();
  renderAndStore();
  toast("印象を保存しました");
}

function addCustomImpressionReason() {
  const label = els.customReasonNameInput.value.trim();
  const side = normalizeImpressionSide(els.customReasonSideSelect.value);
  if (!label) return;
  if (getAvailableImpressionReasons().some((reason) => reason.label.toLocaleLowerCase() === label.toLocaleLowerCase())) {
    return toast("同じ観察ラベルがあります");
  }
  state.customImpressionReasons.push({ id: crypto.randomUUID(), label, side, custom: true });
  els.customReasonNameInput.value = "";
  renderImpressionDialog();
  store();
  toast("観察ラベルを追加しました");
}

function deleteCustomImpressionReason(reasonId) {
  const reason = state.customImpressionReasons.find((item) => item.id === reasonId);
  if (!reason || !confirm(`「${reason.label}」を今後の候補から削除しますか？`)) return;
  state.customImpressionReasons = state.customImpressionReasons.filter((item) => item.id !== reasonId);
  renderImpressionDialog();
  store();
  toast("候補から削除しました");
}

function openRoleGuessDialog(playerId) {
  if (isGameFinished()) return toast("終了済み盤面は編集できません");
  const player = findPlayer(playerId);
  if (!player) return;
  roleGuessPlayerId = playerId;
  els.roleGuessPlayerName.textContent = player.name;
  renderRoleGuessDialog(player);
  els.roleGuessDialog.showModal();
}

function closeRoleGuessDialog() {
  roleGuessPlayerId = "";
  els.roleGuessDialog.close();
}

function renderRoleGuessDialog(player) {
  const selected = new Set(player.roleGuessCandidates);
  els.roleGuessCandidateOptions.innerHTML = Object.entries(ROLE_GUESS_LABELS)
    .map(
      ([value, label]) => `
        <label class="role-guess-option ${getRoleGuessClass(value)}">
          <input type="checkbox" value="${value}" ${selected.has(value) ? "checked" : ""} />
          <span>${label}</span>
        </label>
      `,
    )
    .join("");
  els.roleGuessCandidateOptions.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", handleRoleGuessCandidateChange);
  });
  renderPrimaryRoleGuessOptions(player.primaryRoleGuess);
}

function handleRoleGuessCandidateChange(event) {
  const input = event.currentTarget;
  const checkboxes = Array.from(els.roleGuessCandidateOptions.querySelectorAll('input[type="checkbox"]'));
  if (input.checked && input.value === "unknown") {
    checkboxes.forEach((item) => {
      item.checked = item.value === "unknown";
    });
  } else if (input.checked) {
    const unknown = checkboxes.find((item) => item.value === "unknown");
    if (unknown) unknown.checked = false;
  }
  renderPrimaryRoleGuessOptions(els.primaryRoleGuessSelect.value);
}

function renderPrimaryRoleGuessOptions(currentValue = "") {
  const candidates = getSelectedRoleGuessCandidates();
  const primaryCandidates = candidates.filter((value) => value !== "unknown");
  els.primaryRoleGuessSelect.innerHTML = [
    '<option value="">不明</option>',
    ...primaryCandidates.map((value) => `<option value="${value}">${ROLE_GUESS_LABELS[value]}</option>`),
  ].join("");
  els.primaryRoleGuessSelect.value = primaryCandidates.includes(currentValue) ? currentValue : primaryCandidates[0] || "";
}

function getSelectedRoleGuessCandidates() {
  return Array.from(els.roleGuessCandidateOptions.querySelectorAll('input[type="checkbox"]:checked')).map(
    (input) => input.value,
  );
}

function saveRoleGuess() {
  const player = findPlayer(roleGuessPlayerId);
  if (!player) return;
  player.roleGuessCandidates = normalizeRoleGuessCandidates(getSelectedRoleGuessCandidates());
  player.primaryRoleGuess =
    normalizePrimaryRoleGuess(els.primaryRoleGuessSelect.value, player.roleGuessCandidates) ||
    player.roleGuessCandidates.find((value) => value !== "unknown") ||
    "";
  autoStartGameFromBoardInput();
  closeRoleGuessDialog();
  renderAndStore();
  toast("役職推理を保存しました");
}

function getRoleGuessDisplay(player) {
  const primary = normalizePrimaryRoleGuess(player.primaryRoleGuess, player.roleGuessCandidates);
  return {
    value: primary || "unknown",
    label: primary ? ROLE_GUESS_LABELS[primary] : ROLE_GUESS_LABELS.unknown,
  };
}

function getRoleGuessClass(value) {
  if (value === "werewolf") return "role-werewolf";
  if (value === "unknown") return "role-unknown";
  return Object.hasOwn(ROLE_LABELS, value) ? `role-${value}` : "role-unknown";
}

function normalizeRoleGuessCandidates(values) {
  const candidates = [...new Set(Array.isArray(values) ? values.filter((value) => Object.hasOwn(ROLE_GUESS_LABELS, value)) : [])];
  if (candidates.includes("unknown")) return ["unknown"];
  return candidates;
}

function normalizePrimaryRoleGuess(value, candidates) {
  return value && value !== "unknown" && candidates.includes(value) ? value : "";
}

function openEditDialog(playerId, seerId = "") {
  if (isGameFinished()) return toast("終了済み盤面は編集できません");
  const player = findPlayer(playerId);
  if (!player) return;
  editingPlayerId = playerId;
  editingSeerId = seerId || getSeers()[0]?.id || "";
  els.editPlayerName.textContent = player.name;
  els.roleSelect.value = player.role || "";
  els.memoInput.value = player.memo || "";
  renderResultControls(player);
  els.editDialog.showModal();
}

function closeEditDialog() {
  editingPlayerId = "";
  editingSeerId = "";
  els.editDialog.close();
}

function openStatusDialog(playerId) {
  if (isGameFinished()) return toast("終了済み盤面は編集できません");
  const player = findPlayer(playerId);
  if (!player) return;
  statusPlayerId = playerId;
  els.statusPlayerName.textContent = player.name;
  els.markAliveBtn.hidden = !isInactiveStatus(player.status);
  els.statusDialog.showModal();
}

function closeStatusDialog() {
  statusPlayerId = "";
  els.statusDialog.close();
}

function setPlayerStatus(status) {
  const player = findPlayer(statusPlayerId);
  if (!player) return;
  const wasInactive = isInactiveStatus(player.status);
  const isBecomingInactive = isInactiveStatus(status);
  const nextStatusDay = isBecomingInactive && !wasInactive ? getNextStatusDayForStatus(status) : player.statusDay;
  player.status = status;
  player.statusDay = isBecomingInactive ? nextStatusDay || getNextStatusDayForStatus(status) : null;
  if (status === "attacked") {
    applyAttackRoleUpdates(player);
  }
  if (isBecomingInactive && !wasInactive) {
    movePlayerToInactiveTop(player.id);
  } else {
    reorderPlayersForBoard();
  }
  autoStartGameFromBoardInput();
  closeStatusDialog();
  renderAndStore();
  toast(status === "alive" ? "生存に戻しました" : `${STATUS_LABELS[status]}にしました`);
}

function saveEditingPlayer() {
  const player = findPlayer(editingPlayerId);
  if (!player) return;
  const previousRole = player.role;
  player.role = els.roleSelect.value;
  player.memo = els.memoInput.value.trim();
  if (previousRole !== player.role) {
    player.roleClaimOrder = player.role ? getNextRoleClaimOrder() : null;
    reorderPlayersForBoard();
  }
  saveDivinationResult({ silent: true });
  autoStartGameFromBoardInput();
  closeEditDialog();
  renderAndStore();
  toast("保存しました");
}

function saveDivinationResult({ silent = false } = {}) {
  const target = findPlayer(editingPlayerId);
  const seer = findPlayer(editingSeerId);
  const value = els.resultValueSelect.value;
  if (!target || !seer) {
    if (silent) return false;
    toast("占い列を選んでください");
    return false;
  }
  const existing = state.results.find((result) => result.seerId === seer.id && result.targetId === target.id);
  if (!value) {
    if (!existing) return false;
    state.results = state.results.filter((result) => result.id !== existing.id);
    if (!silent) renderAndStore();
    return true;
  }
  if (existing) {
    existing.value = value;
    existing.order = existing.order || existing.day || getNextDivinationOrder(seer.id);
  } else {
    state.results.push({
      id: crypto.randomUUID(),
      order: getNextDivinationOrder(seer.id),
      seerId: seer.id,
      targetId: target.id,
      value,
    });
  }
  autoStartGameFromBoardInput();
  if (!silent) renderAndStore();
  return true;
}

function applyAttackRoleUpdates(attackedPlayer) {
  const hadRole = Boolean(attackedPlayer.role);
  if (!hadRole && !hasVisibleDivinationResultForTarget(attackedPlayer.id)) {
    attackedPlayer.role = "villager";
  }

  state.results
    .filter((result) => result.targetId === attackedPlayer.id && result.value === "werewolf")
    .forEach((result) => {
      const seer = findPlayer(result.seerId);
      if (seer) seer.role = "wolfSide";
    });
}

function render() {
  renderActiveView();
  renderMatchMeta();
  renderGameLifecycle();
  renderSyncStatus();
  els.wolfCountSelect.value = String(state.wolfCount);
  els.playerCountBadge.textContent = `参加${getActivePlayers().length}/${getSelectedTournamentPlayers().length}人`;
  if (state.activeView === "participants") renderParticipantRows();
  if (state.activeView === "reasoning") {
    renderRopeCount();
    renderRows();
  }
  if (state.activeView === "export") renderHistories();
}

function renderActiveView() {
  const activeView = normalizeActiveView(state.activeView);
  state.activeView = activeView;
  document.body.dataset.activeView = activeView;
  [
    ["participants", els.participantsView],
    ["reasoning", els.reasoningView],
    ["export", els.exportView],
    ["sync", els.syncView],
  ].forEach(([view, element]) => {
    element.hidden = view !== activeView;
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    const selected = button.dataset.view === activeView;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-current", selected ? "page" : "false");
  });
}

function renderMatchMeta() {
  els.tournamentSelect.innerHTML = state.tournaments
    .map(
      (tournament) =>
        `<option value="${escapeHtml(tournament.id)}" ${tournament.id === state.selectedTournamentId ? "selected" : ""}>${escapeHtml(tournament.name)}</option>`,
    )
    .join("");
  els.eventDateInput.value = state.eventDate;
  els.openDatePickerBtn.textContent = state.eventDate || "日付未選択";
  els.gameNumberInput.value = String(state.gameNumber);
  document.querySelectorAll("[data-roster-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.rosterFilter === state.rosterFilter);
  });
  const summary = getMatchSummary();
  els.matchSummary.textContent = summary;
  els.exportSummary.textContent = summary;
}

function renderGameLifecycle() {
  const inProgress = isGameInProgress();
  const finished = isGameFinished();
  els.gameStatusBadge.textContent = finished ? "終了済み" : inProgress ? "進行中" : "準備中";
  els.gameStatusBadge.classList.toggle("in-progress", inProgress);
  els.gameStatusBadge.classList.toggle("finished", finished);
  els.startGameBtn.hidden = inProgress || finished;
  els.returnSetupBtn.hidden = !inProgress;
  els.finishGameBtn.hidden = !inProgress;
  els.nextGameBtn.hidden = !finished;
  [
    els.tournamentSelect,
    els.addTournamentBtn,
    els.renameTournamentBtn,
    els.openDatePickerBtn,
    els.clearDateBtn,
    els.gameNumberInput,
    els.playerNameInput,
    els.addPlayerForm.querySelector('button[type="submit"]'),
    els.wolfCountSelect,
  ].forEach((element) => {
    element.disabled = inProgress || finished;
  });
  document.querySelectorAll("[data-roster-filter]").forEach((button) => {
    button.disabled = inProgress || finished;
  });
}

function renderHistories() {
  els.historyCountBadge.textContent = `${state.gameHistories.length}試合`;
  els.historyList.innerHTML = "";
  els.historyEmptyState.hidden = state.gameHistories.length > 0;
  state.gameHistories.forEach((history) => {
    const button = document.createElement("button");
    button.className = `history-item ${history.id === selectedHistoryId ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="history-item-main">
        <strong>${escapeHtml(history.eventName || "未設定")} / 第${normalizeGameNumber(history.gameNumber)}試合</strong>
        <span>${escapeHtml(history.eventDate || "日付未選択")}</span>
      </span>
      <span class="winner-label">${escapeHtml(history.winner || "勝利陣営未設定")}</span>
    `;
    button.addEventListener("click", () => openHistoryDetail(history.id));
    els.historyList.appendChild(button);
  });
  const selected = getSelectedHistory();
  els.historyDetailPanel.hidden = !selected;
  if (selected) els.historyDetailPreview.textContent = buildHistoryText(selected);
  els.deleteTournamentHistoriesBtn.disabled = getHistoriesForTournament(state.selectedTournamentId).length === 0;
  els.deleteAllHistoriesBtn.disabled = state.gameHistories.length === 0;
}

function renderSyncStatus() {
  if (!els.syncStatusText) return;
  const configured = Boolean(supabaseClient);
  const signedIn = Boolean(syncUser);
  els.syncConfigNotice.hidden = configured;
  els.syncSignedOutPanel.hidden = signedIn || !configured;
  els.syncSignedInPanel.hidden = !signedIn;
  els.syncAccountEmail.textContent = syncUser?.email || "-";
  els.lastSyncText.textContent = formatSyncTime(syncMeta.lastSyncedAt) || "未同期";
  els.remoteUpdateBanner.hidden = !pendingCloudRecord;
  els.syncConflictPanel.hidden = !pendingCloudRecord;
  if (pendingCloudRecord) {
    els.syncConflictTitle.textContent =
      syncMeta.status === "conflict" ? "両方に変更があります" : "別端末の更新があります";
    els.syncConflictMessage.textContent =
      syncMeta.status === "conflict"
        ? "残すデータを選択してください。"
        : "クラウドの最新版を取得するか、この端末の状態で上書きできます。";
    els.localUpdatedText.textContent = formatSyncTime(syncMeta.localUpdatedAt) || "未記録";
    els.cloudUpdatedText.textContent = formatSyncTime(pendingCloudRecord.updated_at) || "未記録";
  }
  const statusMap = {
    unconfigured: ["未設定", "Supabaseの接続設定が必要です"],
    local: ["端末内", "端末内に保存中"],
    offline: ["オフライン", "通信復帰後に同期します"],
    syncing: ["同期中", syncMeta.error || "同期中"],
    synced: ["同期済み", "クラウドと同期されています"],
    remote: ["更新あり", "別端末の更新があります"],
    conflict: ["競合", "残すデータを選択してください"],
    error: ["エラー", syncMeta.error || "同期できませんでした"],
  };
  const [badge, text] = statusMap[syncMeta.status] || statusMap.local;
  els.syncStatusBadge.textContent = signedIn ? badge : configured ? "未ログイン" : "未設定";
  els.syncStatusBadge.className = `sync-status-badge status-${syncMeta.status}`;
  els.syncStatusText.textContent = signedIn ? text : configured ? "ログインすると同期できます" : text;
  els.manualSyncBtn.disabled = !signedIn || syncMeta.status === "syncing";
}

function formatSyncTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function renderParticipantRows() {
  els.participantRows.innerHTML = "";
  const players = getParticipantViewPlayers();
  els.participantEmptyState.hidden = players.length > 0;
  players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = `participant-row player-status-${player.status || "alive"} ${isParticipating(player) ? "" : "participant-resting"}`;
    row.draggable = !isGameLocked();
    row.dataset.playerId = player.id;
    row.addEventListener("dragstart", handlePlayerDragStart);
    row.addEventListener("dragover", handlePlayerDragOver);
    row.addEventListener("dragleave", handlePlayerDragLeave);
    row.addEventListener("drop", handlePlayerDrop);
    row.addEventListener("dragend", handlePlayerDragEnd);
    const participationButton =
      state.rosterFilter === "tournament"
        ? `<button class="participation-button ${isParticipating(player) ? "active" : "resting"}" type="button" ${isGameLocked() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}の参加状態を変更">${isParticipating(player) ? "参加" : "休憩"}</button>`
        : '<span class="membership-count"></span>';
    row.innerHTML = `
      <button class="participant-info" type="button">
        <span class="player-name">${escapeHtml(player.name)}</span>
      </button>
      ${participationButton}
      <span class="order-actions" aria-label="${escapeHtml(player.name)}の並び替え">
        <button class="order-button" type="button" data-direction="-1" ${index === 0 || isGameLocked() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}を上へ">↑</button>
        <button class="order-button" type="button" data-direction="1" ${index === players.length - 1 || isGameLocked() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}を下へ">↓</button>
      </span>
    `;
    row.querySelector(".participant-info").addEventListener("click", () => openMembershipDialog(player.id));
    row.querySelector(".participation-button")?.addEventListener("click", () => toggleParticipation(player.id));
    row.querySelectorAll(".order-button").forEach((button) => {
      button.addEventListener("click", () => moveRosterPlayer(players, player.id, Number(button.dataset.direction)));
    });
    els.participantRows.appendChild(row);
  });
}

function renderRopeCount() {
  const aliveCount = getAliveActivePlayers().length;
  els.ropeCountBadge.textContent = `生存${aliveCount} / 残り${getRemainingRopeCount()}縄`;
}

function renderRows() {
  els.playerRows.innerHTML = "";
  const players = getActivePlayers();
  els.emptyState.hidden = players.length > 0;
  players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = `player-row player-status-${player.status || "alive"}`;
    row.draggable = !isGameFinished();
    row.dataset.playerId = player.id;
    row.addEventListener("dragstart", handlePlayerDragStart);
    row.addEventListener("dragover", handlePlayerDragOver);
    row.addEventListener("dragleave", handlePlayerDragLeave);
    row.addEventListener("drop", handlePlayerDrop);
    row.addEventListener("dragend", handlePlayerDragEnd);

    const memo = player.memo || "メモなし";
    const seerGrid = getSeerGridHtml(player);
    const impression = getPlayerImpression(player);
    const roleGuess = getRoleGuessDisplay(player);
    row.innerHTML = `
      <button class="sticky-player-name" type="button" ${isGameFinished() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}を編集">${escapeHtml(player.name)}</button>
      <button class="player-info" type="button" ${isGameFinished() ? "disabled" : ""}>
        <span class="player-main">
          <span class="player-name-row">
            <span class="player-name">${escapeHtml(player.name)}</span>
            ${isGameFinished() && player.trueRole ? `<span class="true-role-label ${getRoleGuessClass(player.trueRole)}">${escapeHtml(ROLE_GUESS_LABELS[player.trueRole] || player.trueRole)}</span>` : ""}
            <span class="role-guess-label ${getRoleGuessClass(roleGuess.value)}">${escapeHtml(roleGuess.label)}</span>
          </span>
        </span>
        ${seerGrid}
      </button>
      <button class="impression-button impression-${impression.value}" type="button" ${isGameFinished() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}の要素を変更">${escapeHtml(impression.label)}</button>
      <button class="memo-button" type="button" ${isGameFinished() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}のメモを変更">${escapeHtml(memo)}</button>
      <button class="status-button status-${escapeHtml(player.status || "alive")}" type="button" ${isGameFinished() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}の状態を変更">${escapeHtml(getStatusDisplay(player))}</button>
      <span class="order-actions" aria-label="${escapeHtml(player.name)}の並び替え">
        <button class="order-button" type="button" data-direction="-1" ${index === 0 || isGameFinished() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}を上へ">↑</button>
        <button class="order-button" type="button" data-direction="1" ${index === state.players.length - 1 || isGameFinished() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}を下へ">↓</button>
      </span>
    `;
    row.querySelector(".sticky-player-name").addEventListener("click", () => openEditDialog(player.id));
    row.querySelector(".player-info").addEventListener("click", (event) => {
      if (event.target.closest(".role-guess-label")) {
        event.stopPropagation();
        openRoleGuessDialog(player.id);
        return;
      }
      const seerCell = event.target.closest("[data-seer-id]");
      openEditDialog(player.id, seerCell?.dataset.seerId || "");
    });
    row.querySelectorAll(".order-button").forEach((button) => {
      button.addEventListener("click", () => movePlayer(player.id, Number(button.dataset.direction)));
    });
    row.querySelector(".status-button").addEventListener("click", () => openStatusDialog(player.id));
    row.querySelector(".impression-button").addEventListener("click", () => openImpressionDialog(player.id));
    row.querySelector(".memo-button").addEventListener("click", () => openEditDialog(player.id));
    els.playerRows.appendChild(row);
  });
}

function getPlayerImpression(player) {
  return getImpressionFromReasons(player.impressionReasons || []);
}

function getRivalRoleCellsHtml(player, players = getActivePlayers()) {
  if (!RIVAL_DISPLAY_ROLES.has(player.role)) return "";
  const claimants = getRoleClaimants(player.role, players);
  if (claimants.length < 2) return "";
  return claimants
    .map((claimant, index) => {
      if (claimant.id === player.id) {
        return `<span class="seer-result-label ${getRoleClass(player)}">${escapeHtml(`${ROLE_LABELS[player.role]}${getCircledNumber(index + 1)}`)}</span>`;
      }
      const attacked = claimant.status === "attacked";
      return `<span class="seer-result-label ${attacked ? "role-madman" : "role-wolfSide"}">${attacked ? ROLE_LABELS.madman : ROLE_LABELS.wolfSide}</span>`;
    })
    .join("");
}

function getRoleClaimants(role, players = getActivePlayers()) {
  return players
    .filter((player) => player.role === role)
    .slice()
    .sort((a, b) => getRoleClaimOrder(a) - getRoleClaimOrder(b));
}

function getRoleClaimOrder(player) {
  if (player.roleClaimOrder === null || player.roleClaimOrder === undefined || player.roleClaimOrder === "") {
    return Number.MAX_SAFE_INTEGER;
  }
  const order = Number(player.roleClaimOrder);
  return Number.isFinite(order) && order > 0 ? order : Number.MAX_SAFE_INTEGER;
}

function getNextRoleClaimOrder(players = state.players) {
  const orders = players.map(getRoleClaimOrder).filter((order) => Number.isFinite(order) && order < Number.MAX_SAFE_INTEGER);
  return orders.length ? Math.max(...orders) + 1 : 1;
}

function getImpressionFromReasons(reasons) {
  const villagerCount = reasons.filter((reason) => reason.side === "villager").length;
  const werewolfCount = reasons.filter((reason) => reason.side === "werewolf").length;
  if (villagerCount > werewolfCount) return { value: "villager", label: "村人", villagerCount, werewolfCount };
  if (werewolfCount > villagerCount) return { value: "werewolf", label: "人狼", villagerCount, werewolfCount };
  return { value: "none", label: "なし", villagerCount, werewolfCount };
}

function normalizeImpressionSide(value) {
  return value === "werewolf" ? "werewolf" : "villager";
}

function normalizeImpressionReason(reason) {
  if (!reason?.id || !String(reason.label || "").trim()) return null;
  return {
    id: String(reason.id),
    label: String(reason.label).trim(),
    side: normalizeImpressionSide(reason.side),
    custom: reason.custom === true,
  };
}

function movePlayer(playerId, direction) {
  if (isGameFinished()) return toast("終了済み盤面は並び替えできません");
  const fromIndex = state.players.findIndex((player) => player.id === playerId);
  const toIndex = fromIndex + direction;
  if (fromIndex < 0 || toIndex < 0 || toIndex >= state.players.length) return;
  const [player] = state.players.splice(fromIndex, 1);
  state.players.splice(toIndex, 0, player);
  renderAndStore();
}

function toggleParticipation(playerId) {
  if (isGameLocked()) return toast("進行中・終了済みは参加・休憩を変更できません");
  const player = findPlayer(playerId);
  if (!player) return;
  player.participating = !isParticipating(player);
  if (state.selectedTournamentId && isPlayerInSelectedTournament(player)) {
    player.participationByTournament[state.selectedTournamentId] = player.participating;
  }
  renderAndStore();
}

function moveRosterPlayer(visiblePlayers, playerId, direction) {
  if (isGameLocked()) return toast("進行中・終了済みは名簿順を変更できません");
  const fromIndex = visiblePlayers.findIndex((player) => player.id === playerId);
  const target = visiblePlayers[fromIndex + direction];
  if (fromIndex < 0 || !target) return;
  movePlayerToPosition(playerId, target.id);
}

function movePlayerToPosition(fromId, toId) {
  const fromParticipantView = state.activeView === "participants";
  if (isGameFinished() || (fromParticipantView && isGameInProgress())) return toast("進行中・終了済みは並び替えできません");
  const fromIndex = state.players.findIndex((player) => player.id === fromId);
  const toIndex = state.players.findIndex((player) => player.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
  const [player] = state.players.splice(fromIndex, 1);
  state.players.splice(toIndex, 0, player);
  renderAndStore();
}

function movePlayerToInactiveTop(playerId) {
  const fromIndex = state.players.findIndex((player) => player.id === playerId);
  if (fromIndex < 0) return;
  const [player] = state.players.splice(fromIndex, 1);
  const inactiveStartIndex = state.players.findIndex((item) => isInactiveStatus(item.status));
  if (inactiveStartIndex < 0) {
    state.players.push(player);
  } else {
    state.players.splice(inactiveStartIndex, 0, player);
  }
}

function isInactiveStatus(status) {
  return status === "exiled" || status === "attacked";
}

function reorderPlayersForBoard() {
  const indexed = state.players.map((player, index) => ({ player, index }));
  const active = indexed
    .filter(({ player }) => !isInactiveStatus(player.status))
    .sort((a, b) => getRoleOrder(a.player) - getRoleOrder(b.player) || a.index - b.index)
    .map(({ player }) => player);
  const inactive = indexed.filter(({ player }) => isInactiveStatus(player.status)).map(({ player }) => player);
  state.players = [...active, ...inactive];
}

function getRoleOrder(player) {
  return Object.hasOwn(ROLE_ORDER, player.role) ? ROLE_ORDER[player.role] : 99;
}

function getStatusDisplay(player) {
  const label = STATUS_LABELS[player.status] || "生存";
  if (!isInactiveStatus(player.status)) return label;
  return player.statusDay ? `${player.statusDay}日目 ${label}` : label;
}

function getNextStatusDayForStatus(status) {
  backfillStatusDays();
  const days = getActivePlayers()
    .filter((player) => player.status === status)
    .map((player) => Number(player.statusDay))
    .filter((day) => Number.isFinite(day) && day > 0);
  return days.length ? Math.max(...days) + 1 : 1;
}

function handlePlayerDragStart(event) {
  if (isGameFinished()) {
    event.preventDefault();
    return;
  }
  draggedPlayerId = event.currentTarget.dataset.playerId || "";
  event.currentTarget.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedPlayerId);
}

function handlePlayerDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drop-target");
  event.dataTransfer.dropEffect = "move";
}

function handlePlayerDragLeave(event) {
  event.currentTarget.classList.remove("drop-target");
}

function handlePlayerDrop(event) {
  event.preventDefault();
  const fromId = event.dataTransfer.getData("text/plain") || draggedPlayerId;
  const toId = event.currentTarget.dataset.playerId;
  clearDragState();
  movePlayerToPosition(fromId, toId);
}

function handlePlayerDragEnd() {
  clearDragState();
}

function clearDragState() {
  draggedPlayerId = "";
  document.querySelectorAll(".player-row, .participant-row").forEach((row) => {
    row.classList.remove("dragging", "drop-target");
  });
}

function renderResultControls(target) {
  const seers = getSeers();
  if (!seers.length) {
    editingSeerId = "";
    els.resultSeerHint.textContent = "預言者COなし";
    els.resultValueSelect.value = "";
    return;
  }
  if (!seers.some((seer) => seer.id === editingSeerId)) editingSeerId = seers[0].id;
  const seer = findPlayer(editingSeerId);
  els.resultSeerHint.textContent = `${seer ? seer.name : "預言者"}の占い結果`;
  const existing = state.results.find((result) => result.seerId === editingSeerId && result.targetId === target.id);
  els.resultValueSelect.value = existing?.value || "";
}

function getSeerGridHtml(player) {
  const rivalRoleCells = getRivalRoleCellsHtml(player);
  if (rivalRoleCells) {
    const columnCount = getRoleClaimants(player.role).length;
    return `
      <span class="seer-grid" style="--seer-columns: ${columnCount}">
        ${rivalRoleCells}
      </span>
    `;
  }
  const seers = getSeers();
  const perspectiveCells = getSeerPerspectiveCellsHtml(player, seers);
  if (!perspectiveCells) return "";
  const columnCount = Math.max(1, seers.length);
  return `
    <span class="seer-grid" style="--seer-columns: ${columnCount}">
      ${perspectiveCells}
    </span>
  `;
}

function getSeerPerspectiveCellsHtml(player, seers = getSeers()) {
  if (!seers.length) {
    const roleClaim = getSeerGridRoleLabel(player);
    return roleClaim ? `<span class="seer-result-label ${getWolfSideAwareRoleClass(player)}">${escapeHtml(roleClaim)}</span>` : "";
  }
  return seers
    .map((seer) => {
      if (player.id === seer.id) {
        const className = getWolfSideAwareRoleClass(player);
        return `<span class="seer-result-label ${className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(getSeerGridRoleLabel(player))}</span>`;
      }
      if (isWolfSideDisplayTarget(player)) {
        const className = isInactiveStatus(player.status) ? "role-madman" : "judgement-rival";
        return `<span class="seer-result-label ${className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(getWolfSideDisplayLabel(player))}</span>`;
      }
      const result = state.results.find((item) => item.seerId === seer.id && item.targetId === player.id);
      const roleClaim = getSeerGridRoleLabel(player);
      const autoVillagerClaim = roleClaim || getAutoVillagerClaimForSeer(player, seer.id);
      if (!result) {
        return autoVillagerClaim
          ? `<span class="seer-result-label ${getAutoVillagerClass(player)}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(autoVillagerClaim)}</span>`
          : `<span class="seer-result-label empty" data-seer-id="${escapeHtml(seer.id)}" aria-hidden="true"></span>`;
      }
      const className = result.value === "werewolf" ? "judgement-werewolf" : "judgement-human";
      const resultLabel = `占い${getDivinationOrder(result)} ${RESULT_LABELS[result.value] || "未記録"}`;
      const label = roleClaim ? `${roleClaim} / ${resultLabel}` : resultLabel;
      return `<span class="seer-result-label ${className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(label)}</span>`;
    })
    .filter(Boolean)
    .join("");
}

function getRoleClaimLabel(player) {
  if (!player.role || !Object.hasOwn(ROLE_LABELS, player.role)) return "";
  const sameRolePlayers = getRoleClaimants(player.role);
  const suffix = sameRolePlayers.length > 1 ? getCircledNumber(sameRolePlayers.findIndex((item) => item.id === player.id) + 1) : "";
  return `${ROLE_LABELS[player.role]}${suffix}`;
}

function getWolfSideAwareRoleLabel(player) {
  return player.role === "wolfSide" ? getWolfSideDisplayLabel(player) : getRoleClaimLabel(player);
}

function getSeerGridRoleLabel(player) {
  if (RIVAL_DISPLAY_ROLES.has(player.role) && getRoleClaimants(player.role).length >= 2) return "";
  return getWolfSideAwareRoleLabel(player);
}

function getWolfSideAwareRoleClass(player) {
  return player.role === "wolfSide" && isInactiveStatus(player.status) ? "role-madman" : getRoleClass(player);
}

function getWolfSideDisplayLabel(player) {
  return isInactiveStatus(player.status) ? ROLE_LABELS.madman : ROLE_LABELS.wolfSide;
}

function getAutoVillagerClaimForSeer(player, seerId) {
  if (player.role || player.status !== "attacked") return "";
  return hasDivinationResultForSeer(player.id, seerId) ? "" : ROLE_LABELS.villager;
}

function getAutoVillagerClass(player) {
  return player.role ? getRoleClass(player) : "role-villager";
}

function getRoleClass(player) {
  return player.role && Object.hasOwn(ROLE_LABELS, player.role) ? `role-${player.role}` : "role-claim";
}

function getCircledNumber(value) {
  return CIRCLED_NUMBERS[value] || `(${value})`;
}

function getSeers() {
  const seerIds = new Set(state.results.map((result) => result.seerId));
  return getActivePlayers().filter(
    (player) => player.role === "seer" || (player.role === "wolfSide" && seerIds.has(player.id)),
  );
}

function getActivePlayers() {
  return getSelectedTournamentPlayers().filter(isParticipating);
}

function getAliveActivePlayers() {
  return getActivePlayers().filter((player) => !isInactiveStatus(player.status));
}

function isParticipating(player) {
  return player.participating !== false;
}

function getSelectedTournament() {
  return state.tournaments.find((tournament) => tournament.id === state.selectedTournamentId);
}

function getSelectedTournamentPlayers() {
  return state.players.filter(isPlayerInSelectedTournament);
}

function isPlayerInSelectedTournament(player) {
  return Boolean(state.selectedTournamentId && player.tournamentIds.includes(state.selectedTournamentId));
}

function getRosterPlayers() {
  if (state.rosterFilter === "all") return state.players;
  if (state.rosterFilter === "unassigned") return state.players.filter((player) => player.tournamentIds.length === 0);
  return getSelectedTournamentPlayers();
}

function getParticipantViewPlayers() {
  const players = getRosterPlayers();
  if (state.rosterFilter !== "tournament") return players;
  return players.slice().sort((a, b) => Number(isParticipating(b)) - Number(isParticipating(a)));
}

function isWolfSideDisplayTarget(player) {
  if (player.role === "wolfSide") return true;
  return player.role === "seer" && getSeers().some((seer) => seer.id !== player.id);
}

function hasVisibleDivinationResultForTarget(playerId) {
  const target = findPlayer(playerId);
  if (!target || !isParticipating(target)) return false;
  const visibleSeerIds = new Set(getSeers().map((seer) => seer.id));
  return state.results.some((result) => result.targetId === playerId && visibleSeerIds.has(result.seerId));
}

function hasDivinationResultForSeer(playerId, seerId) {
  return state.results.some((result) => result.targetId === playerId && result.seerId === seerId);
}

function getRemainingRopeCount() {
  return Math.max(0, Math.floor((getAliveActivePlayers().length - 1) / 2));
}

function getNextDivinationOrder(seerId) {
  const orders = state.results
    .filter((result) => result.seerId === seerId)
    .map(getDivinationOrder)
    .filter((order) => Number.isFinite(order));
  return orders.length ? Math.max(...orders) + 1 : 1;
}

function getDivinationOrder(result) {
  return Number.isFinite(Number(result.order)) ? Number(result.order) : Number(result.day) || 1;
}

async function copyExport() {
  const text = buildExportText();
  try {
    await navigator.clipboard.writeText(text);
    toast("ログをコピーしました");
  } catch {
    showExportFallback(text);
  }
}

function openHistoryDetail(historyId) {
  selectedHistoryId = historyId;
  render();
}

function closeHistoryDetail() {
  selectedHistoryId = "";
  render();
}

async function copySelectedHistory() {
  const history = getSelectedHistory();
  if (!history) return;
  const text = buildHistoryText(history);
  try {
    await navigator.clipboard.writeText(text);
    toast("履歴をコピーしました");
  } catch {
    showExportFallback(text);
  }
}

function deleteSelectedHistory() {
  const history = getSelectedHistory();
  if (!history || !confirm(`${history.eventName} 第${history.gameNumber}試合の履歴を削除しますか？`)) return;
  state.gameHistories = state.gameHistories.filter((item) => item.id !== history.id);
  selectedHistoryId = "";
  renderAndStore();
  toast("履歴を削除しました");
}

function openBulkDeleteHistoryDialog(scope) {
  const histories = scope === "tournament" ? getHistoriesForTournament(state.selectedTournamentId) : state.gameHistories;
  if (!histories.length) return toast("削除できる履歴がありません");
  bulkDeleteHistoryScope = scope;
  els.bulkDeleteConfirmInput.value = "";
  const tournamentName = getSelectedTournament()?.name || "選択中の大会";
  els.bulkDeleteHistoryTitle.textContent = scope === "tournament" ? `${tournamentName}の履歴を削除` : "すべての履歴を削除";
  els.bulkDeleteHistoryMessage.innerHTML = `
    <strong>${histories.length}試合分の履歴を削除します。</strong>
    <span>削除した履歴は復元できません。現在の盤面、大会設定、参加者名簿は残ります。</span>
  `;
  renderBulkDeleteConfirmation();
  els.bulkDeleteHistoryDialog.showModal();
}

function closeBulkDeleteHistoryDialog() {
  bulkDeleteHistoryScope = "";
  els.bulkDeleteConfirmInput.value = "";
  els.bulkDeleteHistoryDialog.close();
}

function renderBulkDeleteConfirmation() {
  els.confirmBulkDeleteHistoryBtn.disabled = els.bulkDeleteConfirmInput.value.trim() !== "削除";
}

function deleteHistoriesInScope() {
  if (els.bulkDeleteConfirmInput.value.trim() !== "削除") return;
  const selectedTournamentId = state.selectedTournamentId;
  const targetCount =
    bulkDeleteHistoryScope === "tournament"
      ? getHistoriesForTournament(selectedTournamentId).length
      : state.gameHistories.length;
  if (!targetCount) return closeBulkDeleteHistoryDialog();
  state.gameHistories =
    bulkDeleteHistoryScope === "tournament"
      ? state.gameHistories.filter((history) => history.selectedTournamentId !== selectedTournamentId)
      : [];
  selectedHistoryId = "";
  closeBulkDeleteHistoryDialog();
  renderAndStore();
  toast(`${targetCount}試合分の履歴を削除しました`);
}

function getHistoriesForTournament(tournamentId) {
  return state.gameHistories.filter((history) => history.selectedTournamentId === tournamentId);
}

function openHistoryEditDialog() {
  const history = getSelectedHistory();
  if (!history) return;
  editingHistoryId = history.id;
  els.historyEditTitle.textContent = `${history.eventName || "未設定"} 第${history.gameNumber}試合`;
  els.historyEventNameInput.value = history.eventName || "";
  els.historyEventDateInput.value = history.eventDate || "";
  els.historyGameNumberInput.value = String(history.gameNumber || 1);
  els.historyWinnerInput.value = history.winner || "";
  renderHistoryEditor(history);
  els.historyEditDialog.showModal();
}

function closeHistoryEditDialog() {
  editingHistoryId = "";
  els.historyEditDialog.close();
}

function renderHistoryEditor(history) {
  const rosterPlayers = getHistoryTournamentPlayers(history);
  const activePlayers = getHistoryActivePlayers(history);
  els.historyPlayerEditor.innerHTML = rosterPlayers
    .map(
      (player) => `
        <div class="history-player-edit" data-player-id="${escapeHtml(player.id)}">
          <input data-field="name" type="text" value="${escapeHtml(player.name)}" maxlength="40" aria-label="参加者名" />
          <label class="history-participation"><input data-field="participating" type="checkbox" ${player.participating !== false ? "checked" : ""} /><span>参加</span></label>
          <select data-field="role" aria-label="${escapeHtml(player.name)}の役職">
            ${getRoleOptionsHtml(player.role)}
          </select>
          <select data-field="trueRole" aria-label="${escapeHtml(player.name)}の真の役職">
            <option value="">真役職未設定</option>
            ${getTrueRoleOptionsHtml(player.trueRole)}
          </select>
          <select data-field="status" aria-label="${escapeHtml(player.name)}の状態">
            ${getStatusOptionsHtml(player.status)}
          </select>
          <input data-field="statusDay" type="number" min="1" value="${player.statusDay || ""}" placeholder="日" aria-label="${escapeHtml(player.name)}の追放・襲撃順" />
          <input data-field="memo" type="text" maxlength="80" value="${escapeHtml(player.memo || "")}" placeholder="メモ" aria-label="${escapeHtml(player.name)}のメモ" />
          <div class="history-impression-edit">
            <span class="impression-label impression-${getPlayerImpression(player).value}">${getPlayerImpression(player).label}</span>
            <div class="history-impression-options">${getHistoryImpressionOptionsHtml(player)}</div>
          </div>
          <div class="history-role-guess-edit">
            <label class="field">
              <span>役職推理候補</span>
              <div class="history-role-guess-options">${getHistoryRoleGuessOptionsHtml(player)}</div>
            </label>
            <label class="field">
              <span>本命役職</span>
              <select data-field="primaryRoleGuess">${getPrimaryRoleGuessOptionsHtml(player.roleGuessCandidates, player.primaryRoleGuess)}</select>
            </label>
          </div>
        </div>
      `,
    )
    .join("");
  els.historyResultEditor.innerHTML = history.results.length
    ? history.results
        .map((result) => {
          const seer = history.players.find((player) => player.id === result.seerId);
          const target = history.players.find((player) => player.id === result.targetId);
          return `
            <div class="history-result-edit" data-result-id="${escapeHtml(result.id)}">
              <select data-field="seerId" aria-label="預言者">${getHistoryPlayerOptionsHtml(activePlayers, seer?.id)}</select>
              <select data-field="targetId" aria-label="占い対象">${getHistoryPlayerOptionsHtml(activePlayers, target?.id)}</select>
              <input data-field="order" type="number" min="1" value="${getDivinationOrder(result)}" aria-label="占い順" />
              <select data-field="value" aria-label="占い結果">
                <option value="human" ${result.value === "human" ? "selected" : ""}>村人</option>
                <option value="werewolf" ${result.value === "werewolf" ? "selected" : ""}>人狼</option>
              </select>
              <button class="danger-button" type="button" data-delete-result>削除</button>
            </div>
          `;
        })
        .join("")
    : '<div class="empty-inline">占い結果なし</div>';
  bindHistoryResultDeleteButtons();
  bindHistoryRoleGuessControls();
}

function getHistoryPlayerOptionsHtml(players, selectedId) {
  return players
    .map((player) => `<option value="${escapeHtml(player.id)}" ${player.id === selectedId ? "selected" : ""}>${escapeHtml(player.name)}</option>`)
    .join("");
}

function getHistoryImpressionOptionsHtml(player) {
  const selectedIds = new Set(player.impressionReasons.map((reason) => reason.id));
  const reasons = [...STANDARD_IMPRESSION_REASONS, ...state.customImpressionReasons];
  const knownIds = new Set(reasons.map((reason) => reason.id));
  player.impressionReasons.forEach((reason) => {
    if (!knownIds.has(reason.id)) reasons.push(reason);
  });
  return reasons
    .map(
      (reason) => `
        <label class="history-impression-option ${reason.side}">
          <input type="checkbox" data-impression-reason="${escapeHtml(reason.id)}" ${selectedIds.has(reason.id) ? "checked" : ""} />
          <span>${escapeHtml(reason.label)}</span>
        </label>
      `,
    )
    .join("");
}

function getHistoryRoleGuessOptionsHtml(player) {
  const selected = new Set(player.roleGuessCandidates);
  return Object.entries(ROLE_GUESS_LABELS)
    .map(
      ([value, label]) => `
        <label class="history-role-guess-option ${getRoleGuessClass(value)}">
          <input type="checkbox" data-role-guess="${value}" ${selected.has(value) ? "checked" : ""} />
          <span>${label}</span>
        </label>
      `,
    )
    .join("");
}

function getPrimaryRoleGuessOptionsHtml(candidates, primary) {
  const normalized = normalizeRoleGuessCandidates(candidates).filter((value) => value !== "unknown");
  return [
    `<option value="" ${primary ? "" : "selected"}>不明</option>`,
    ...normalized.map(
      (value) => `<option value="${value}" ${value === primary ? "selected" : ""}>${ROLE_GUESS_LABELS[value]}</option>`,
    ),
  ].join("");
}

function bindHistoryRoleGuessControls() {
  els.historyPlayerEditor.querySelectorAll("[data-player-id]").forEach((row) => {
    row.querySelectorAll("[data-role-guess]").forEach((input) => {
      input.addEventListener("change", () => {
        const checkboxes = Array.from(row.querySelectorAll("[data-role-guess]"));
        if (input.checked && input.dataset.roleGuess === "unknown") {
          checkboxes.forEach((item) => {
            item.checked = item.dataset.roleGuess === "unknown";
          });
        } else if (input.checked) {
          const unknown = checkboxes.find((item) => item.dataset.roleGuess === "unknown");
          if (unknown) unknown.checked = false;
        }
        const candidates = normalizeRoleGuessCandidates(
          checkboxes.filter((item) => item.checked).map((item) => item.dataset.roleGuess),
        );
        const select = row.querySelector('[data-field="primaryRoleGuess"]');
        select.innerHTML = getPrimaryRoleGuessOptionsHtml(candidates, select.value);
      });
    });
  });
}

function bindHistoryResultDeleteButtons() {
  els.historyResultEditor.querySelectorAll("[data-delete-result]").forEach((button) => {
    button.addEventListener("click", () => button.closest("[data-result-id]").remove());
  });
}

function addHistoryResultEditorRow() {
  const history = state.gameHistories.find((item) => item.id === editingHistoryId);
  const players = history ? getHistoryActivePlayers(history) : [];
  if (!players.length) return toast("参加者がいません");
  els.historyResultEditor.querySelector(".empty-inline")?.remove();
  const row = document.createElement("div");
  row.className = "history-result-edit";
  row.dataset.resultId = `new-${crypto.randomUUID()}`;
  row.innerHTML = `
    <select data-field="seerId" aria-label="預言者">${getHistoryPlayerOptionsHtml(players, players[0].id)}</select>
    <select data-field="targetId" aria-label="占い対象">${getHistoryPlayerOptionsHtml(players, players[0].id)}</select>
    <input data-field="order" type="number" min="1" value="1" aria-label="占い順" />
    <select data-field="value" aria-label="占い結果"><option value="human">村人</option><option value="werewolf">人狼</option></select>
    <button class="danger-button" type="button" data-delete-result>削除</button>
  `;
  els.historyResultEditor.appendChild(row);
  bindHistoryResultDeleteButtons();
}

function getRoleOptionsHtml(selectedRole) {
  return [
    ["", "なし"],
    ...Object.entries(ROLE_LABELS),
  ]
    .map(([value, label]) => `<option value="${value}" ${value === selectedRole ? "selected" : ""}>${label}</option>`)
    .join("");
}

function getStatusOptionsHtml(selectedStatus) {
  return Object.entries(STATUS_LABELS)
    .map(([value, label]) => `<option value="${value}" ${value === selectedStatus ? "selected" : ""}>${label}</option>`)
    .join("");
}

function saveHistoryEdits() {
  const history = state.gameHistories.find((item) => item.id === editingHistoryId);
  if (!history) return;
  history.eventName = els.historyEventNameInput.value.trim() || "未設定";
  history.eventDate = normalizeDateValue(els.historyEventDateInput.value);
  history.gameNumber = normalizeGameNumber(els.historyGameNumberInput.value);
  history.winner = els.historyWinnerInput.value.trim() || "勝利陣営未設定";
  els.historyPlayerEditor.querySelectorAll("[data-player-id]").forEach((row) => {
    const player = history.players.find((item) => item.id === row.dataset.playerId);
    if (!player) return;
    const previousRole = player.role;
    player.name = row.querySelector('[data-field="name"]').value.trim() || "名無し";
    player.participating = row.querySelector('[data-field="participating"]').checked;
    player.role = row.querySelector('[data-field="role"]').value;
    player.trueRole = row.querySelector('[data-field="trueRole"]').value;
    if (previousRole !== player.role) {
      player.roleClaimOrder = player.role ? getNextRoleClaimOrder(history.players) : null;
    }
    player.status = row.querySelector('[data-field="status"]').value;
    player.statusDay = isInactiveStatus(player.status)
      ? Math.max(1, Number(row.querySelector('[data-field="statusDay"]').value) || 1)
      : null;
    player.memo = row.querySelector('[data-field="memo"]').value.trim();
    const reasonMap = new Map(
      [...STANDARD_IMPRESSION_REASONS, ...state.customImpressionReasons, ...player.impressionReasons].map((reason) => [
        reason.id,
        reason,
      ]),
    );
    player.impressionReasons = Array.from(row.querySelectorAll("[data-impression-reason]:checked"))
      .map((input) => reasonMap.get(input.dataset.impressionReason))
      .filter(Boolean)
      .map((reason) => ({ ...reason }));
    player.roleGuessCandidates = normalizeRoleGuessCandidates(
      Array.from(row.querySelectorAll("[data-role-guess]:checked")).map((input) => input.dataset.roleGuess),
    );
    player.primaryRoleGuess = normalizePrimaryRoleGuess(
      row.querySelector('[data-field="primaryRoleGuess"]').value,
      player.roleGuessCandidates,
    );
  });
  history.results = Array.from(els.historyResultEditor.querySelectorAll("[data-result-id]")).map((row) => ({
    id: row.dataset.resultId.startsWith("new-") ? crypto.randomUUID() : row.dataset.resultId,
    seerId: row.querySelector('[data-field="seerId"]').value,
    targetId: row.querySelector('[data-field="targetId"]').value,
    order: Math.max(1, Number(row.querySelector('[data-field="order"]').value) || 1),
    value: row.querySelector('[data-field="value"]').value,
  }));
  backfillRoleClaimOrders(history.players);
  closeHistoryEditDialog();
  renderAndStore();
  toast("履歴の変更を保存しました");
}

function showExportFallback(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.inset = "12px";
  area.style.zIndex = "100";
  document.body.appendChild(area);
  area.focus();
  area.select();
  toast("テキストを選択しました");
}

function buildExportText() {
  const lines = [getMatchSummary(), `人狼: ${state.wolfCount}`];
  lines.push(`残り縄: ${getRemainingRopeCount()}`);
  lines.push("", "参加者");
  getActivePlayers().forEach((player) => {
    lines.push(`- ${player.name} / ${getStatusDisplay(player)} / ${player.role ? ROLE_LABELS[player.role] : "COなし"} / ${formatRoleGuessForExport(player)} / ${formatImpressionForExport(player)}${player.memo ? ` / ${player.memo}` : ""}`);
  });
  return lines.join("\n");
}

function buildHistoryText(history) {
  const lines = [
    `${history.eventName || "未設定"} / ${history.eventDate || "日付未選択"} / 第${history.gameNumber}試合`,
    `勝利: ${history.winner || "未設定"}`,
    `人狼: ${history.wolfCount}`,
    "",
    "真の役職",
  ];
  getHistoryActivePlayers(history).forEach((player) => {
    lines.push(`- ${player.name}: ${ROLE_GUESS_LABELS[player.trueRole] || "未設定"}`);
  });
  lines.push("", "時系列");
  lines.push(...buildHistoryTimeline(history));
  return lines.join("\n");
}

function buildHistoryTimeline(history) {
  const activePlayers = getHistoryActivePlayers(history);
  const trueSeerIds = new Set(activePlayers.filter((player) => player.trueRole === "seer").map((player) => player.id));
  const trueResults = history.results.filter((result) => trueSeerIds.has(result.seerId));
  const maxDay = Math.max(
    0,
    ...trueResults.map(getDivinationOrder),
    ...activePlayers.filter((player) => isInactiveStatus(player.status)).map((player) => Number(player.statusDay) || 1),
  );
  if (!maxDay) return ["- 出来事なし"];
  const lines = [];
  for (let day = 1; day <= maxDay; day += 1) {
    const events = [];
    trueResults
      .filter((result) => getDivinationOrder(result) === day)
      .forEach((result) => {
        const seer = history.players.find((player) => player.id === result.seerId);
        const target = history.players.find((player) => player.id === result.targetId);
        if (seer && target) events.push(`占い: ${seer.name} -> ${target.name} ${RESULT_LABELS[result.value]}`);
      });
    activePlayers
      .filter((player) => player.status === "exiled" && (Number(player.statusDay) || 1) === day)
      .forEach((player) => events.push(`追放: ${player.name}`));
    activePlayers
      .filter((player) => player.status === "attacked" && (Number(player.statusDay) || 1) === day)
      .forEach((player) => events.push(`襲撃: ${player.name}`));
    if (events.length) {
      lines.push(`${day}日目`);
      events.forEach((event) => lines.push(`- ${event}`));
    }
  }
  return lines.length ? lines : ["- 出来事なし"];
}

function formatImpressionForExport(player) {
  const impression = getPlayerImpression(player);
  const reasons = formatImpressionReasons(player.impressionReasons);
  return reasons ? `${impression.label}: ${reasons}` : impression.label;
}

function formatRoleGuessForExport(player) {
  const display = getRoleGuessDisplay(player);
  const candidates = player.roleGuessCandidates.filter((value) => value !== "unknown").map((value) => ROLE_GUESS_LABELS[value]);
  return candidates.length ? `${display.label}（候補: ${candidates.join("、")}）` : display.label;
}

function formatImpressionReasons(reasons = []) {
  return reasons.map((reason) => reason.label).join("、");
}

function getHistoryActivePlayers(history) {
  return getHistoryTournamentPlayers(history).filter((player) => player.participating !== false);
}

function getHistoryTournamentPlayers(history) {
  return history.players.filter((player) => player.tournamentIds.includes(history.selectedTournamentId));
}

function getSelectedHistory() {
  return state.gameHistories.find((history) => history.id === selectedHistoryId);
}

function isGameInProgress() {
  return state.gameStatus === "in_progress";
}

function isGameFinished() {
  return state.gameStatus === "finished";
}

function isGameLocked() {
  return isGameInProgress() || isGameFinished();
}

function renderAndStore() {
  render();
  store();
}

function store({ markDirty = true } = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const signature = getSyncPayloadSignature();
  if (markDirty && !applyingCloudState && signature !== syncMeta.lastPayloadSignature) {
    syncMeta.localUpdatedAt = new Date().toISOString();
    syncMeta.dirty = true;
    syncMeta.lastPayloadSignature = signature;
    saveSyncMeta();
    scheduleAutoSync();
  } else if (!syncMeta.lastPayloadSignature) {
    syncMeta.lastPayloadSignature = signature;
    saveSyncMeta();
  }
}

function restore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    applySavedState(JSON.parse(raw));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function applySavedState(saved) {
  state.day = Number.isFinite(Number(saved.day)) ? Math.max(1, Number(saved.day)) : 1;
  state.eventName = normalizeEventName(saved.eventName);
  state.eventDate = normalizeDateValue(saved.eventDate);
  state.gameNumber = normalizeGameNumber(saved.gameNumber);
  state.activeView = normalizeActiveView(saved.activeView);
  state.rosterFilter = normalizeRosterFilter(saved.rosterFilter);
  state.tournaments = Array.isArray(saved.tournaments) ? saved.tournaments.map(normalizeTournament).filter(Boolean) : [];
  state.selectedTournamentId = String(saved.selectedTournamentId || "");
  state.wolfCount = normalizeWolfCount(saved.wolfCount);
  state.players = Array.isArray(saved.players) ? saved.players.map(normalizePlayer) : [];
  state.results = Array.isArray(saved.results) ? saved.results.map(normalizeResult).filter(Boolean) : [];
  state.customImpressionReasons = Array.isArray(saved.customImpressionReasons)
    ? saved.customImpressionReasons.map(normalizeImpressionReason).filter((reason) => reason?.custom)
    : [];
  state.gameStatus = ["in_progress", "finished"].includes(saved.gameStatus) ? saved.gameStatus : "preparing";
  state.startedAt = state.gameStatus !== "preparing" ? String(saved.startedAt || "") : "";
  state.gameHistories = Array.isArray(saved.gameHistories) ? saved.gameHistories.map(normalizeGameHistory).filter(Boolean) : [];
  migrateLegacyRoster(saved.eventName);
  backfillStatusDays();
}

function getSyncPayload() {
  const payload = structuredClone(state);
  delete payload.activeView;
  delete payload.rosterFilter;
  return payload;
}

function getSyncPayloadSignature() {
  return JSON.stringify(getSyncPayload());
}

function restoreSyncMeta() {
  try {
    const saved = JSON.parse(localStorage.getItem(SYNC_META_KEY) || "{}");
    return {
      localUpdatedAt: String(saved.localUpdatedAt || ""),
      lastSyncedAt: String(saved.lastSyncedAt || ""),
      lastCloudUpdatedAt: String(saved.lastCloudUpdatedAt || ""),
      lastPayloadSignature: String(saved.lastPayloadSignature || ""),
      dirty: saved.dirty === true,
      status: "local",
      error: "",
    };
  } catch {
    return {
      localUpdatedAt: "",
      lastSyncedAt: "",
      lastCloudUpdatedAt: "",
      lastPayloadSignature: "",
      dirty: false,
      status: "local",
      error: "",
    };
  }
}

function saveSyncMeta() {
  localStorage.setItem(
    SYNC_META_KEY,
    JSON.stringify({
      localUpdatedAt: syncMeta.localUpdatedAt,
      lastSyncedAt: syncMeta.lastSyncedAt,
      lastCloudUpdatedAt: syncMeta.lastCloudUpdatedAt,
      lastPayloadSignature: syncMeta.lastPayloadSignature,
      dirty: syncMeta.dirty,
    }),
  );
}

function getOrCreateDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

function scheduleAutoSync() {
  cancelScheduledSync();
  if (!syncUser || !navigator.onLine || document.visibilityState !== "visible") return;
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    synchronizeNow();
  }, SYNC_DELAY_MS);
}

function cancelScheduledSync() {
  window.clearTimeout(syncTimer);
  syncTimer = null;
}

async function initializeSync() {
  const config = window.SYNC_CONFIG || {};
  if (!window.supabase?.createClient || !config.supabaseUrl || !config.supabaseAnonKey) {
    syncMeta.status = "unconfigured";
    renderSyncStatus();
    return;
  }
  supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      els.passwordUpdateForm.hidden = false;
      state.activeView = "sync";
      render();
    }
    const nextUser = session?.user || null;
    if (nextUser?.id !== syncUser?.id) {
      syncUser = nextUser;
      if (syncUser) {
        synchronizeNow({ initial: true });
      } else {
        cancelScheduledSync();
      }
      renderSyncStatus();
    }
  });
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setSyncError(error.message);
    return;
  }
  syncUser = data.session?.user || null;
  if (syncUser) {
    await synchronizeNow({ initial: true });
  }
  renderSyncStatus();
}

async function handleLogin(event) {
  event.preventDefault();
  if (!ensureSyncConfigured()) return;
  setSyncBusy("ログイン中");
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: els.loginEmailInput.value.trim(),
    password: els.loginPasswordInput.value,
  });
  if (error) return setSyncError(toJapaneseAuthError(error.message));
  els.loginForm.reset();
  toast("ログインしました");
}

async function handleSignup(event) {
  event.preventDefault();
  if (!ensureSyncConfigured()) return;
  setSyncBusy("登録中");
  const { error } = await supabaseClient.auth.signUp({
    email: els.signupEmailInput.value.trim(),
    password: els.signupPasswordInput.value,
    options: { emailRedirectTo: getAuthRedirectUrl() },
  });
  if (error) return setSyncError(toJapaneseAuthError(error.message));
  els.signupForm.reset();
  syncMeta.status = "local";
  renderSyncStatus();
  toast("確認メールを送信しました");
}

async function handlePasswordReset(event) {
  event.preventDefault();
  if (!ensureSyncConfigured()) return;
  setSyncBusy("送信中");
  const { error } = await supabaseClient.auth.resetPasswordForEmail(els.resetEmailInput.value.trim(), {
    redirectTo: getAuthRedirectUrl(),
  });
  if (error) return setSyncError(toJapaneseAuthError(error.message));
  els.passwordResetForm.reset();
  syncMeta.status = "local";
  renderSyncStatus();
  toast("再設定メールを送信しました");
}

async function handlePasswordUpdate(event) {
  event.preventDefault();
  if (!ensureSyncConfigured()) return;
  setSyncBusy("更新中");
  const { error } = await supabaseClient.auth.updateUser({ password: els.newPasswordInput.value });
  if (error) return setSyncError(toJapaneseAuthError(error.message));
  els.passwordUpdateForm.reset();
  els.passwordUpdateForm.hidden = true;
  syncMeta.status = "synced";
  renderSyncStatus();
  toast("パスワードを更新しました");
}

async function logoutAndClearLocalData() {
  if (!syncUser || !confirm("ログアウトして、この端末内の名簿・盤面・履歴を削除しますか？")) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) return setSyncError(error.message);
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SYNC_META_KEY);
  resetStateToDefaults();
  syncMeta = restoreSyncMeta();
  hadLocalDataAtStartup = false;
  pendingCloudRecord = null;
  selectedHistoryId = "";
  ensureMatchDefaults();
  state.activeView = "sync";
  render();
  toast("ログアウトし、端末内データを削除しました");
}

function resetStateToDefaults() {
  Object.assign(state, {
    day: 1,
    eventName: "",
    eventDate: "",
    gameNumber: 1,
    activeView: "participants",
    rosterFilter: "tournament",
    tournaments: [],
    selectedTournamentId: "",
    wolfCount: 2,
    players: [],
    results: [],
    gameStatus: "preparing",
    startedAt: "",
    gameHistories: [],
    customImpressionReasons: [],
  });
}

function ensureSyncConfigured() {
  if (supabaseClient) return true;
  toast("Supabaseの接続設定が必要です");
  return false;
}

function getAuthRedirectUrl() {
  return `${location.origin}${location.pathname}`;
}

async function synchronizeNow({ initial = false, manual = false } = {}) {
  cancelScheduledSync();
  if (!supabaseClient || !syncUser) return;
  if (!navigator.onLine) {
    syncMeta.status = "offline";
    renderSyncStatus();
    return;
  }
  if (pendingCloudRecord && !manual) return;
  setSyncBusy("同期中");
  const cloudRecord = await fetchCloudRecord();
  if (cloudRecord === undefined) return;
  if (!cloudRecord) {
    await uploadLocalState();
    return;
  }
  const cloudIsNew = isAfter(cloudRecord.updated_at, syncMeta.lastCloudUpdatedAt);
  if (initial && !syncMeta.lastCloudUpdatedAt) {
    if (hadLocalDataAtStartup) {
      showCloudConflict(cloudRecord, "initial");
    } else {
      await applyCloudRecord(cloudRecord);
    }
    return;
  }
  if (cloudIsNew && cloudRecord.updated_by_device !== deviceId) {
    showCloudConflict(cloudRecord, syncMeta.dirty ? "conflict" : "remote");
    return;
  }
  if (syncMeta.dirty) {
    await uploadLocalState();
    return;
  }
  syncMeta.status = "synced";
  syncMeta.lastCloudUpdatedAt = cloudRecord.updated_at || syncMeta.lastCloudUpdatedAt;
  syncMeta.lastSyncedAt = new Date().toISOString();
  saveSyncMeta();
  renderSyncStatus();
}

async function fetchCloudRecord() {
  const { data, error } = await supabaseClient
    .from("user_states")
    .select("payload, updated_at, updated_by_device")
    .eq("user_id", syncUser.id)
    .maybeSingle();
  if (error) {
    setSyncError(error.message);
    return undefined;
  }
  return data || null;
}

async function uploadLocalState() {
  if (!supabaseClient || !syncUser || !navigator.onLine) return;
  setSyncBusy("アップロード中");
  const updatedAt = new Date().toISOString();
  const { data, error } = await supabaseClient
    .from("user_states")
    .upsert({
      user_id: syncUser.id,
      payload: getSyncPayload(),
      updated_at: updatedAt,
      updated_by_device: deviceId,
    })
    .select("updated_at, updated_by_device")
    .single();
  if (error) return setSyncError(error.message);
  pendingCloudRecord = null;
  syncMeta.dirty = false;
  syncMeta.status = "synced";
  syncMeta.lastCloudUpdatedAt = data.updated_at || updatedAt;
  syncMeta.lastSyncedAt = new Date().toISOString();
  syncMeta.lastPayloadSignature = getSyncPayloadSignature();
  saveSyncMeta();
  renderSyncStatus();
  toast("クラウドへ同期しました");
}

async function downloadPendingCloudState() {
  if (!pendingCloudRecord) {
    const record = await fetchCloudRecord();
    if (!record) return;
    pendingCloudRecord = record;
  }
  await applyCloudRecord(pendingCloudRecord);
}

async function applyCloudRecord(record) {
  if (!record?.payload) return;
  applyingCloudState = true;
  const activeView = state.activeView;
  const rosterFilter = state.rosterFilter;
  applySavedState(record.payload);
  state.activeView = activeView;
  state.rosterFilter = rosterFilter;
  ensureMatchDefaults();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  applyingCloudState = false;
  pendingCloudRecord = null;
  hadLocalDataAtStartup = true;
  syncMeta.dirty = false;
  syncMeta.status = "synced";
  syncMeta.localUpdatedAt = record.updated_at || new Date().toISOString();
  syncMeta.lastCloudUpdatedAt = record.updated_at || "";
  syncMeta.lastSyncedAt = new Date().toISOString();
  syncMeta.lastPayloadSignature = getSyncPayloadSignature();
  saveSyncMeta();
  render();
  toast("クラウドのデータを取得しました");
}

function showCloudConflict(record, type) {
  pendingCloudRecord = record;
  syncMeta.status = type === "remote" ? "remote" : "conflict";
  state.activeView = type === "initial" ? "sync" : state.activeView;
  render();
}

function isAfter(value, baseline) {
  if (!value) return false;
  if (!baseline) return true;
  return new Date(value).getTime() > new Date(baseline).getTime();
}

function setSyncBusy(label) {
  syncMeta.status = "syncing";
  syncMeta.error = label;
  renderSyncStatus();
}

function setSyncError(message) {
  syncMeta.status = "error";
  syncMeta.error = message;
  renderSyncStatus();
  toast("同期できませんでした");
}

function toJapaneseAuthError(message) {
  if (/invalid login credentials/i.test(message)) return "メールアドレスまたはパスワードが違います";
  if (/email not confirmed/i.test(message)) return "確認メール内のリンクを開いてください";
  if (/user already registered/i.test(message)) return "このメールアドレスは登録済みです";
  return message;
}

function ensureMatchDefaults() {
  if (!state.tournaments.length) {
    const tournament = { id: crypto.randomUUID(), name: state.eventName || "既存名簿" };
    state.tournaments = [tournament];
    state.selectedTournamentId = tournament.id;
  }
  if (!state.tournaments.some((tournament) => tournament.id === state.selectedTournamentId)) {
    state.selectedTournamentId = state.tournaments[0].id;
  }
  state.eventName = getSelectedTournament()?.name || "";
  state.gameNumber = normalizeGameNumber(state.gameNumber);
  state.activeView = normalizeActiveView(state.activeView);
  state.rosterFilter = normalizeRosterFilter(state.rosterFilter);
  applySelectedTournamentParticipation();
  backfillRoleClaimOrders(state.players);
}

function migrateLegacyRoster(savedEventName = "") {
  if (state.tournaments.length) return;
  const tournament = { id: crypto.randomUUID(), name: normalizeEventName(savedEventName) || "既存名簿" };
  state.tournaments = [tournament];
  state.selectedTournamentId = tournament.id;
  state.players.forEach((player) => {
    player.tournamentIds = [tournament.id];
    player.participationByTournament = { [tournament.id]: player.participating !== false };
  });
}

function backfillStatusDays() {
  ["exiled", "attacked"].forEach((status) => {
    getActivePlayers()
      .filter((player) => player.status === status)
      .slice()
      .reverse()
      .forEach((player, index) => {
        player.statusDay = index + 1;
      });
    });
}

function backfillRoleClaimOrders(players) {
  let nextOrder =
    players
      .map(getRoleClaimOrder)
      .filter((order) => Number.isFinite(order) && order < Number.MAX_SAFE_INTEGER)
      .reduce((max, order) => Math.max(max, order), 0) + 1;
  players.forEach((player) => {
    if (player.role && getRoleClaimOrder(player) === Number.MAX_SAFE_INTEGER) {
      player.roleClaimOrder = nextOrder;
      nextOrder += 1;
    }
    if (!player.role) player.roleClaimOrder = null;
  });
}

function normalizeWolfCount(value) {
  const count = Number(value);
  return Number.isFinite(count) ? Math.min(4, Math.max(1, Math.trunc(count))) : 2;
}

function normalizeEventName(value) {
  return String(value || "").trim();
}

function normalizeDateValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : "";
}

function normalizeGameNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.trunc(number)) : 1;
}

function normalizeActiveView(value) {
  return ["participants", "reasoning", "export", "sync"].includes(value) ? value : "participants";
}

function normalizeRosterFilter(value) {
  return ["tournament", "all", "unassigned"].includes(value) ? value : "tournament";
}

function normalizeTournament(tournament) {
  if (!tournament?.id || !String(tournament.name || "").trim()) return null;
  return { id: String(tournament.id), name: String(tournament.name).trim() };
}

function getTodayDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMatchSummary() {
  const eventName = getSelectedTournament()?.name || state.eventName || "未設定";
  return `${eventName} / ${state.eventDate || "日付未選択"} / 第${state.gameNumber}試合`;
}

function normalizePlayer(player) {
  const status = player.status === "dead" ? "attacked" : player.status;
  return {
    id: player.id || crypto.randomUUID(),
    name: String(player.name || "名無し"),
    role: Object.hasOwn(ROLE_LABELS, player.role) ? player.role : "",
    participating: player.participating !== false,
    tournamentIds: Array.isArray(player.tournamentIds) ? [...new Set(player.tournamentIds.map(String))] : [],
    participationByTournament:
      player.participationByTournament && typeof player.participationByTournament === "object"
        ? Object.fromEntries(Object.entries(player.participationByTournament).map(([id, value]) => [String(id), value !== false]))
        : {},
    status: Object.hasOwn(STATUS_LABELS, status) ? status : "alive",
    statusDay: Number.isFinite(Number(player.statusDay)) ? Math.max(1, Number(player.statusDay)) : null,
    memo: String(player.memo || ""),
    impressionReasons: Array.isArray(player.impressionReasons)
      ? player.impressionReasons.map(normalizeImpressionReason).filter(Boolean)
      : [],
    roleGuessCandidates: normalizeRoleGuessCandidates(player.roleGuessCandidates),
    primaryRoleGuess: normalizePrimaryRoleGuess(
      player.primaryRoleGuess,
      normalizeRoleGuessCandidates(player.roleGuessCandidates),
    ),
    trueRole: Object.hasOwn(ROLE_GUESS_LABELS, player.trueRole) && player.trueRole !== "unknown" ? player.trueRole : "",
    roleClaimOrder:
      getRoleClaimOrder(player) < Number.MAX_SAFE_INTEGER ? Math.max(1, getRoleClaimOrder(player)) : null,
  };
}

function normalizeResult(result) {
  if (!result || !result.seerId || !result.targetId || !Object.hasOwn(RESULT_LABELS, result.value)) return null;
  return {
    id: result.id || crypto.randomUUID(),
    order: Number.isFinite(Number(result.order ?? result.day)) ? Math.max(1, Number(result.order ?? result.day)) : 1,
    seerId: result.seerId,
    targetId: result.targetId,
    value: result.value,
  };
}

function normalizeGameHistory(history) {
  if (!history?.id || !Array.isArray(history.players) || !Array.isArray(history.results)) return null;
  const normalized = {
    id: String(history.id),
    eventName: normalizeEventName(history.eventName) || "未設定",
    eventDate: normalizeDateValue(history.eventDate),
    gameNumber: normalizeGameNumber(history.gameNumber),
    wolfCount: normalizeWolfCount(history.wolfCount),
    winner: String(history.winner || "勝利陣営未設定"),
    startedAt: String(history.startedAt || ""),
    finishedAt: String(history.finishedAt || ""),
    selectedTournamentId: String(history.selectedTournamentId || ""),
    players: history.players.map(normalizePlayer),
    results: history.results.map(normalizeResult).filter(Boolean),
  };
  backfillRoleClaimOrders(normalized.players);
  return normalized;
}

function findPlayer(id) {
  return state.players.find((player) => player.id === id);
}

function toast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 1800);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}
