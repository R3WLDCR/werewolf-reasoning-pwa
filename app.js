const STORAGE_KEY = "werewolf-reasoning-note-v1";
const SYNC_META_KEY = "werewolf-reasoning-sync-meta-v1";
const DEVICE_ID_KEY = "werewolf-reasoning-device-id";
const ACTIVE_BOARD_KEY = "werewolf-reasoning-active-board-v1";
const APP_VERSION = "1.162";
const SYNC_DELAY_MS = 10000;
const ROLE_LABELS = {
  seer: "預言者",
  medium: "霊媒師",
  guard: "ボディガード",
  villager: "市民",
  confirmedWhite: "確定白",
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
const PRIORITY_PLAYER_NAME = "羊飼いK";
const LEGACY_SELF_SYNCED_CLAIM_ROLES = new Set(["seer", "medium", "guard", "hunter"]);
const RIVAL_DISPLAY_ROLES = new Set(["medium", "guard", "hunter"]);
const RIVAL_PERSPECTIVE_ROLES = new Set(["seer", "medium", "guard", "hunter"]);
const RIVAL_PERSPECTIVE_VALUES = new Set(["wolfSide", "werewolf", "madman"]);
const SELF_RIVAL_GUESS_ROLES = new Set(["seer", "medium", "guard", "hunter"]);
const VILLAGER_SIDE_ROLES = new Set(["seer", "medium", "guard", "villager", "hunter"]);
const STATUS_LABELS = {
  alive: "生存",
  exiled: "追放",
  attacked: "襲撃",
};
const RESULT_LABELS = {
  human: "市民",
  werewolf: "人狼",
};
const SEER_COLUMN_OVERRIDE_LABELS = {
  ...RESULT_LABELS,
  ...ROLE_LABELS,
};
const ROLE_ACTION_ROLES = new Set(["medium", "guard", "hunter"]);
const VOTE_TYPES = new Set(["normal", "runoff"]);
const VOTE_TYPE_LABELS = {
  normal: "通常投票",
  runoff: "決選投票",
};
const ROLE_ACTION_RESULT_LABELS = {
  medium: {
    unknown: "不明",
    human: "市民",
    werewolf: "人狼",
  },
  guard: {
    unknown: "不明",
    success: "成功",
    fail: "失敗",
  },
  hunter: {
    unknown: "不明",
    activated: "発動",
    notActivated: "未発動",
  },
};
const CIRCLED_NUMBERS = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
const STANDARD_IMPRESSION_REASONS = [
  { id: "standard-villager-light", label: "動きが軽い", side: "villager", custom: false },
  { id: "standard-villager-natural-talk", label: "発言が自然", side: "villager", custom: false },
  { id: "standard-villager-honest-reaction", label: "反応が素直", side: "villager", custom: false },
  { id: "standard-villager-natural-vote", label: "投票が自然", side: "villager", custom: false },
  { id: "standard-villager-natural-view", label: "視点が自然", side: "villager", custom: false },
  { id: "standard-villager-growing-reasoning", label: "推理が伸びる", side: "villager", custom: false },
  { id: "standard-villager-independent-line", label: "独自路線", side: "villager", custom: false },
  { id: "standard-villager-same-thinking", label: "思考が同じ", side: "villager", custom: false },
  { id: "standard-werewolf-stiff", label: "動きが固い", side: "werewolf", custom: false },
  { id: "standard-werewolf-expression", label: "表情", side: "werewolf", custom: false },
  { id: "standard-werewolf-heavy-talk", label: "発言が重い", side: "werewolf", custom: false },
  { id: "standard-werewolf-defensive", label: "反応が防御的", side: "werewolf", custom: false },
  { id: "standard-werewolf-unnatural-vote", label: "投票が黒い", side: "werewolf", custom: false },
  { id: "standard-werewolf-unnatural-view", label: "不自然", side: "werewolf", custom: false },
  { id: "standard-werewolf-following", label: "便乗が多い", side: "werewolf", custom: false },
];
const ROLE_GUESS_LABELS = {
  unknown: "不明",
  seer: "預言者",
  medium: "霊媒師",
  guard: "ボディガード",
  villager: "市民",
  confirmedWhite: "確定白",
  madman: "裏切り者",
  wolfSide: "狼狂",
  werewolf: "人狼",
  other: "その他",
  hunter: "ハンター",
  fox: "妖狐",
  teruteru: "てるてる",
};
const WOLF_MODE_COVER_ROLES = new Set(["unknown", "villager", "seer", "medium", "guard", "hunter"]);

function normalizeCitizenText(value) {
  return String(value || "").replaceAll("村人", "市民");
}
const BOARD_STATE_FIELDS = [
  "day",
  "eventName",
  "eventDate",
  "seasonNumber",
  "editionNumber",
  "gameNumber",
  "selectedTournamentId",
  "wolfCount",
  "wolfModeActive",
  "wolfModeCoverRole",
  "reasoningPerspective",
  "players",
  "results",
  "seerColumnOverrides",
  "seerMediumLinks",
  "rivalPerspectiveOverrides",
  "rivalPerspectiveVersion",
  "roleActions",
  "claimEvents",
  "voteHistories",
  "gameStatus",
  "startedAt",
  "pendingExileContinuationPlayerId",
];

const state = {
  day: 1,
  eventName: "",
  eventDate: "",
  seasonNumber: null,
  editionNumber: null,
  gameNumber: 1,
  activeView: "participants",
  rosterFilter: "tournament",
  tournaments: [],
  selectedTournamentId: "",
  wolfCount: 2,
  wolfModeActive: false,
  wolfModeCoverRole: "",
  reasoningPerspective: "seer",
  players: [],
  results: [],
  seerColumnOverrides: [],
  seerMediumLinks: [],
  rivalPerspectiveOverrides: [],
  rivalPerspectiveVersion: 2,
  roleActions: [],
  claimEvents: [],
  voteHistories: [],
  gameStatus: "preparing",
  startedAt: "",
  pendingExileContinuationPlayerId: "",
  gameHistories: [],
  customImpressionReasons: [],
  boards: [],
};

const els = {};
let editingPlayerId = "";
let editingSeerId = "";
let editingRoleTouched = false;
let membershipPlayerId = "";
let statusPlayerId = "";
let draggedPlayerId = "";
let selectedHistoryId = "";
let selectedHistoryIds = new Set();
let editingHistoryId = "";
let bulkDeleteHistoryScope = "";
let impressionPlayerId = "";
let impressionDraftReasons = [];
let roleGuessPlayerId = "";
let rivalPerspectiveRole = "";
let rivalPerspectiveViewerId = "";
let rivalPerspectiveTargetId = "";
let voteHistoryEditVisible = false;
let selectedRunoffTargetId = "";
let selectedRunoffVoterIds = new Set();
let toastTimer = null;
let syncTimer = null;
let supabaseClient = null;
let syncUser = null;
let pendingCloudRecord = null;
let applyingCloudState = false;
let activeBoardId = localStorage.getItem(ACTIVE_BOARD_KEY) || "";
let switchingBoard = false;
let hadLocalDataAtStartup = Boolean(localStorage.getItem(STORAGE_KEY));
let syncMeta = restoreSyncMeta();
const deviceId = getOrCreateDeviceId();

document.addEventListener("DOMContentLoaded", () => {
  [
    "gameStatusBadge",
    "startGameBtn",
    "boardActionsBtn",
    "boardActionsDialog",
    "closeBoardActionsBtn",
    "changeSettingsBtn",
    "initializeBoardBtn",
    "finishGameBtn",
    "nextGameBtn",
    "participantsView",
    "reasoningView",
    "exportView",
    "syncView",
    "remoteUpdateBanner",
    "boardSwitcherBtn",
    "activeBoardName",
    "boardManagerDialog",
    "closeBoardManagerBtn",
    "boardList",
    "newBoardNameInput",
    "newBoardTournamentSelect",
    "createBoardBtn",
    "tournamentSelect",
    "addTournamentBtn",
    "renameTournamentBtn",
    "eventDateInput",
    "dateInputWrap",
    "openDatePickerBtn",
    "eventDateText",
    "dateActionText",
    "clearDateBtn",
    "seasonNumberInput",
    "editionNumberInput",
    "gameNumberInput",
    "matchSummary",
    "wolfCountSelect",
    "wolfCountBadge",
    "addPlayerForm",
    "playerNameInput",
    "playerCountBadge",
    "participantRows",
    "participantEmptyState",
    "ropeCountBadge",
    "openVoteDialogBtn",
    "seerPerspectiveBtn",
    "mediumPerspectiveBtn",
    "playerRows",
    "emptyState",
    "exportSummary",
    "copyExportBtn",
    "historyCountBadge",
    "historyList",
    "historyEmptyState",
    "selectAllHistoriesBtn",
    "clearHistorySelectionBtn",
    "deleteSelectedHistoriesBtn",
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
    "adoptedMediumSection",
    "adoptedMediumSelect",
    "mediumResultSection",
    "mediumResultHint",
    "mediumResultSelect",
    "mediumPerspectiveResultSection",
    "mediumPerspectiveResultList",
    "roleActionSection",
    "roleActionTitle",
    "roleActionList",
    "addRoleActionBtn",
    "memoInput",
    "statusDialog",
    "statusPlayerName",
    "closeStatusBtn",
    "markExiledBtn",
    "markAttackedBtn",
    "markAliveBtn",
    "voteDialog",
    "closeVoteBtn",
    "voteDayInput",
    "voteVoterSelect",
    "voteTargetSelect",
    "addVoteBtn",
    "voteModeNotice",
    "runoffQuickPanel",
    "voteSummaryPanel",
    "toggleVoteHistoryEditBtn",
    "voteHistoryList",
    "membershipDialog",
    "membershipForm",
    "membershipPlayerName",
    "membershipNameInput",
    "membershipOptions",
    "closeMembershipBtn",
    "finishGameDialog",
    "finishGameForm",
    "closeFinishGameBtn",
    "winnerSelect",
    "otherWinnerField",
    "otherWinnerInput",
    "fillRemainingVillagersBtn",
    "finishTrueRoleFields",
    "finishGameError",
    "historyEditDialog",
    "historyEditForm",
    "historyEditTitle",
    "closeHistoryEditBtn",
    "historyEventNameInput",
    "historySeasonNumberInput",
    "historyEditionNumberInput",
    "historyEventDateInput",
    "historyGameNumberInput",
    "historyWinnerInput",
    "historyPlayerEditor",
    "historyResultEditor",
    "addHistoryResultBtn",
    "historySeerColumnOverrideEditor",
    "addHistorySeerColumnOverrideBtn",
    "historyRivalPerspectiveOverrideEditor",
    "addHistoryRivalPerspectiveOverrideBtn",
    "historyRoleActionEditor",
    "addHistoryRoleActionBtn",
    "historyClaimEventEditor",
    "addHistoryClaimEventBtn",
    "historyVoteEditor",
    "addHistoryVoteBtn",
    "bulkDeleteHistoryDialog",
    "bulkDeleteHistoryForm",
    "bulkDeleteHistoryTitle",
    "bulkDeleteHistoryMessage",
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
    "wolfModeEntryHint",
    "roleGuessCandidateOptions",
    "openMediumResultFromGuessBtn",
    "blackTargetField",
    "blackTargetSelect",
    "primaryRoleGuessSelect",
    "saveRoleGuessBtn",
    "exitWolfModeBtn",
    "closeRoleGuessBtn",
    "rivalPerspectiveDialog",
    "rivalPerspectiveForm",
    "rivalPerspectiveTitle",
    "rivalPerspectiveHint",
    "rivalPerspectiveValueSelect",
    "closeRivalPerspectiveBtn",
    "syncStatusText",
    "syncStatusBadge",
    "syncConfigNotice",
    "syncSignedOutPanel",
    "syncSignedInPanel",
    "syncAccountEmail",
    "lastSyncText",
    "appVersionText",
    "wolfModeBadge",
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
  els.appVersionText.textContent = `v${APP_VERSION}`;
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
  els.clearDateBtn.addEventListener("click", () => {
    if (isGameLocked()) return toast("進行中・終了済みは開催日を変更できません");
    state.eventDate = "";
    renderAndStore();
  });
  els.seasonNumberInput.addEventListener("change", () => saveOptionalSequenceInput(els.seasonNumberInput, "seasonNumber", "シーズン"));
  els.editionNumberInput.addEventListener("change", () => saveOptionalSequenceInput(els.editionNumberInput, "editionNumber", "開催回"));
  els.gameNumberInput.addEventListener("change", () => {
    if (isGameLocked()) return render();
    state.gameNumber = normalizeGameNumber(els.gameNumberInput.value);
    renderAndStore();
  });
  els.boardSwitcherBtn.addEventListener("click", openBoardManager);
  els.closeBoardManagerBtn.addEventListener("click", closeBoardManager);
  els.createBoardBtn.addEventListener("click", createBoardFromDialog);
  els.boardManagerDialog.addEventListener("click", (event) => {
    if (event.target === els.boardManagerDialog) closeBoardManager();
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
  els.boardActionsBtn.addEventListener("click", openBoardActionsDialog);
  els.closeBoardActionsBtn.addEventListener("click", closeBoardActionsDialog);
  els.changeSettingsBtn.addEventListener("click", returnToSetup);
  els.initializeBoardBtn.addEventListener("click", resetBoardForTesting);
  els.boardActionsDialog.addEventListener("click", (event) => {
    if (event.target === els.boardActionsDialog) closeBoardActionsDialog();
  });
  els.finishGameBtn.addEventListener("click", openFinishGameDialog);
  els.nextGameBtn.addEventListener("click", prepareNextGame);
  els.copyExportBtn.addEventListener("click", copyExport);
  els.closeHistoryDetailBtn.addEventListener("click", closeHistoryDetail);
  els.editHistoryBtn.addEventListener("click", openHistoryEditDialog);
  els.copyHistoryBtn.addEventListener("click", copySelectedHistory);
  els.deleteHistoryBtn.addEventListener("click", deleteSelectedHistory);
  els.selectAllHistoriesBtn.addEventListener("click", selectAllHistories);
  els.clearHistorySelectionBtn.addEventListener("click", clearHistorySelection);
  els.deleteSelectedHistoriesBtn.addEventListener("click", () => openBulkDeleteHistoryDialog("selected"));
  els.deleteTournamentHistoriesBtn.addEventListener("click", () => openBulkDeleteHistoryDialog("tournament"));
  els.deleteAllHistoriesBtn.addEventListener("click", () => openBulkDeleteHistoryDialog("all"));
  els.closeEditBtn.addEventListener("click", closeEditDialog);
  els.roleSelect.addEventListener("change", () => {
    editingRoleTouched = true;
    const player = findPlayer(editingPlayerId);
    if (player) renderRoleActionControls(player, els.roleSelect.value);
  });
  els.addRoleActionBtn.addEventListener("click", addRoleActionEditorRow);
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
  els.openVoteDialogBtn.addEventListener("click", openVoteDialog);
  els.seerPerspectiveBtn.addEventListener("click", () => setReasoningPerspective("seer"));
  els.mediumPerspectiveBtn.addEventListener("click", () => setReasoningPerspective("medium"));
  els.closeVoteBtn.addEventListener("click", closeVoteDialog);
  els.addVoteBtn.addEventListener("click", addVoteFromDialog);
  els.voteDayInput.addEventListener("input", updateVoteVoterOptions);
  els.voteVoterSelect.addEventListener("change", updateVoteTargetOptionsForSelectedVoter);
  els.voteTargetSelect.addEventListener("change", () => {
    selectedRunoffTargetId = els.voteTargetSelect.value;
    updateVoteVoterOptions();
  });
  els.toggleVoteHistoryEditBtn.addEventListener("click", () => {
    voteHistoryEditVisible = !voteHistoryEditVisible;
    updateVoteHistoryEditVisibility();
  });
  els.voteDialog.addEventListener("click", (event) => {
    if (event.target === els.voteDialog) closeVoteDialog();
  });
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
    updateFinishGameValidation();
  });
  els.otherWinnerInput.addEventListener("input", updateFinishGameValidation);
  els.fillRemainingVillagersBtn.addEventListener("click", fillRemainingTrueRolesAsVillager);
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
  els.addHistorySeerColumnOverrideBtn.addEventListener("click", addHistorySeerColumnOverrideEditorRow);
  els.addHistoryRivalPerspectiveOverrideBtn.addEventListener("click", addHistoryRivalPerspectiveOverrideEditorRow);
  els.addHistoryRoleActionBtn.addEventListener("click", addHistoryRoleActionEditorRow);
  els.addHistoryClaimEventBtn.addEventListener("click", addHistoryClaimEventEditorRow);
  els.addHistoryVoteBtn.addEventListener("click", addHistoryVoteEditorRow);
  els.historyEditDialog.addEventListener("click", (event) => {
    if (event.target === els.historyEditDialog) closeHistoryEditDialog();
  });
  els.closeBulkDeleteHistoryBtn.addEventListener("click", closeBulkDeleteHistoryDialog);
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
  els.openMediumResultFromGuessBtn.addEventListener("click", openMediumResultFromRoleGuess);
  els.exitWolfModeBtn.addEventListener("click", exitWolfMode);
  els.roleGuessDialog.addEventListener("click", (event) => {
    if (event.target === els.roleGuessDialog) closeRoleGuessDialog();
  });
  els.closeRivalPerspectiveBtn.addEventListener("click", closeRivalPerspectiveDialog);
  els.rivalPerspectiveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveRivalPerspectiveOverride();
  });
  els.rivalPerspectiveDialog.addEventListener("click", (event) => {
    if (event.target === els.rivalPerspectiveDialog) closeRivalPerspectiveDialog();
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

function openBoardManager() {
  renderBoardManager();
  els.boardManagerDialog.showModal();
}

function closeBoardManager() {
  els.boardManagerDialog.close();
}

function createBoardFromDialog() {
  const tournamentId = els.newBoardTournamentSelect.value || state.selectedTournamentId;
  const tournamentName = state.tournaments.find((tournament) => tournament.id === tournamentId)?.name || "新しい盤面";
  createBoard(els.newBoardNameInput.value.trim() || `${tournamentName} 第1試合`, tournamentId);
  els.newBoardNameInput.value = "";
  toast("新しい盤面を作成しました");
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
  state.seasonNumber = null;
  state.editionNumber = null;
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
    manualRoleOverride: false,
    participating: tournamentIds.length > 0,
    tournamentIds,
    participationByTournament,
    status: "alive",
    statusDay: null,
    memo: "",
    impressionReasons: [],
    roleGuessCandidates: [],
    primaryRoleGuess: "",
    manualRoleGuess: false,
    wolfModeCoverRole: "",
    wolfTeammate: false,
    wolfTeammatePreviousGuess: null,
    blackTargetPreference: "auto",
    blackTargetFixedRank: 0,
    blackTargetRank: 0,
    autoSelfRivalWolfSide: false,
    autoFullOutsiderVillager: false,
    autoSingleClaimRoleGuess: null,
    autoConfirmedWhite: false,
    autoConfirmedWhitePreviousGuess: null,
    mediumConfirmedRoleGuess: "",
    confirmedRoleEvidence: [],
    confirmedRolePreviousGuess: null,
    mediumHumanConversion: null,
    mediumHumanBrokenPrevious: null,
    mediumConflictBroken: false,
    confirmedResultConflictBroken: false,
    selfPerspectiveResultConflictBroken: false,
    attackConflictBroken: false,
    attackedWolfSideConfirmedMadman: false,
    attackedAutoVillager: false,
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
  if (isWolfMode()) return false;
  const activeCount = getActivePlayers().length;
  if (!activeCount || !state.wolfCount || state.wolfCount >= activeCount) return false;
  state.gameStatus = "in_progress";
  state.startedAt = new Date().toISOString();
  return true;
}

function hasBoardProgress() {
  if (state.results.length) return true;
  if (state.seerColumnOverrides.length) return true;
  if (state.seerMediumLinks.length) return true;
  if (state.rivalPerspectiveOverrides.length) return true;
  if (state.roleActions.length) return true;
  if (state.claimEvents.length) return true;
  if (state.voteHistories.length) return true;
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
  closeBoardActionsDialog();
  if (!confirm("盤面を残したまま準備中へ戻りますか？")) return;
  state.gameStatus = "preparing";
  state.startedAt = "";
  state.activeView = "participants";
  renderAndStore();
  toast("準備中へ戻りました");
}

function resetBoardForTesting() {
  if (isGameFinished()) return toast("終了済み盤面は次試合へ進んでからリセットしてください");
  closeBoardActionsDialog();
  if (!confirm("CO・推理・結果・生死・メモ・人狼モードを消去し、盤面を初期化しますか？\n\n大会、開催日、試合番号、参加・休憩状態、人狼数は残ります。")) return;
  state.gameStatus = "preparing";
  state.startedAt = "";
  resetBoardState();
  state.activeView = "participants";
  renderAndStore();
  toast("盤面を初日に戻しました");
}

function openBoardActionsDialog() {
  if (isGameFinished() || state.activeView !== "reasoning") return;
  els.changeSettingsBtn.hidden = !isGameInProgress();
  els.boardActionsDialog.showModal();
}

function closeBoardActionsDialog() {
  if (els.boardActionsDialog.open) els.boardActionsDialog.close();
}

function openFinishGameDialog() {
  if (!isGameInProgress()) return;
  els.winnerSelect.value = "";
  els.otherWinnerInput.value = "";
  els.otherWinnerField.hidden = true;
  renderFinishTrueRoleFields();
  updateFinishGameValidation();
  els.finishGameDialog.showModal();
}

function closeFinishGameDialog() {
  els.finishGameDialog.close();
}

function finishGame() {
  if (!isGameInProgress()) return;
  const validation = updateFinishGameValidation({ focusFirstInvalid: true });
  if (!validation.valid) return;
  const selectedWinner = els.winnerSelect.value;
  const winner = normalizeCitizenText(selectedWinner === "その他" ? els.otherWinnerInput.value.trim() : selectedWinner);
  const trueRoles = getFinishTrueRoles();
  const stateBeforeFinish = structuredClone(state);
  const selectedHistoryIdBeforeFinish = selectedHistoryId;
  try {
    removeInvalidCurrentMediumResults();
    applyConfirmedWhiteUpdates();
    const history = createGameHistory(winner, trueRoles);
    state.gameHistories.unshift(history);
    state.players.forEach((player) => {
      player.trueRole = trueRoles.get(player.id) || "";
    });
    state.gameStatus = "finished";
    state.pendingExileContinuationPlayerId = "";
    state.activeView = "reasoning";
    selectedHistoryId = state.gameHistories[0].id;
    if (!store()) throw new Error("Local state could not be saved");
  } catch (error) {
    console.error("Failed to finish game", error);
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, stateBeforeFinish);
    selectedHistoryId = selectedHistoryIdBeforeFinish;
    showFinishGameError(["端末への保存に失敗しました。空き容量を確認して、もう一度お試しください。"]);
    return;
  }
  closeFinishGameDialog();
  render();
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
          <select data-true-role-player-id="${escapeHtml(player.id)}">
            <option value="">役職を選択</option>
            ${getTrueRoleOptionsHtml(player.primaryRoleGuess)}
          </select>
        </label>
      `,
    )
    .join("");
  els.finishTrueRoleFields.querySelectorAll("[data-true-role-player-id]").forEach((select) => {
    select.addEventListener("change", updateFinishGameValidation);
  });
}

function getTrueRoleOptionsHtml(selectedRole = "") {
  return Object.entries(ROLE_GUESS_LABELS)
    .filter(([role]) => role !== "unknown" && role !== "wolfSide" && role !== "confirmedWhite")
    .map(([role, label]) => `<option value="${role}" ${role === selectedRole ? "selected" : ""}>${label}</option>`)
    .join("");
}

function getFinishTrueRoles() {
  const entries = Array.from(els.finishTrueRoleFields.querySelectorAll("[data-true-role-player-id]")).map((select) => [
    select.dataset.trueRolePlayerId,
    select.value,
  ]);
  return new Map(entries);
}

function fillRemainingTrueRolesAsVillager() {
  const selects = Array.from(els.finishTrueRoleFields.querySelectorAll("[data-true-role-player-id]"));
  selects.filter((select) => !select.value).forEach((select) => {
    select.value = "villager";
  });
  updateFinishGameValidation();
}

function countSelectedTrueRoles(selects = []) {
  return selects.reduce((counts, select) => {
    if (select.value) counts[select.value] = (counts[select.value] || 0) + 1;
    return counts;
  }, {});
}

function getFinishGameValidation() {
  const messages = [];
  const invalidElements = [];
  const selectedWinner = els.winnerSelect.value;
  if (!selectedWinner) {
    messages.push("勝利陣営を選んでください。");
    invalidElements.push(els.winnerSelect);
  } else if (selectedWinner === "その他" && !els.otherWinnerInput.value.trim()) {
    messages.push("「その他」の勝利陣営名を入力してください。");
    invalidElements.push(els.otherWinnerInput);
  }

  const selects = Array.from(els.finishTrueRoleFields.querySelectorAll("[data-true-role-player-id]"));
  const unselected = selects.filter((select) => !select.value);
  if (unselected.length) {
    const names = unselected
      .map((select) => findPlayer(select.dataset.trueRolePlayerId)?.name)
      .filter(Boolean);
    messages.push(`真の役職が未選択です（${names.join("、")}）。`);
    invalidElements.push(...unselected);
  }

  const counts = countSelectedTrueRoles(selects);
  [
    ["人狼", "werewolf", state.wolfCount],
    ["裏切り者", "madman", 1],
    ["ボディガード", "guard", 1],
    ["預言者", "seer", 1],
    ["霊媒師", "medium", 1],
  ].forEach(([label, role, expected]) => {
    const actual = counts[role] || 0;
    if (actual !== expected) {
      messages.push(`${label}は${expected}人必要です（現在${actual}人）。`);
      if (actual > expected) invalidElements.push(...selects.filter((select) => select.value === role));
    }
  });

  return { valid: messages.length === 0, messages, invalidElements };
}

function updateFinishGameValidation({ focusFirstInvalid = false } = {}) {
  const validation = getFinishGameValidation();
  const invalidElements = new Set(validation.invalidElements);
  els.finishTrueRoleFields.querySelectorAll(".finish-true-role-field").forEach((field) => {
    const select = field.querySelector("[data-true-role-player-id]");
    field.classList.toggle("invalid", invalidElements.has(select));
  });
  els.winnerSelect.classList.toggle("invalid", invalidElements.has(els.winnerSelect));
  els.otherWinnerInput.classList.toggle("invalid", invalidElements.has(els.otherWinnerInput));
  els.fillRemainingVillagersBtn.disabled = !Array.from(
    els.finishTrueRoleFields.querySelectorAll("[data-true-role-player-id]"),
  ).some((select) => !select.value);
  if (validation.valid) {
    els.finishGameError.hidden = true;
    els.finishGameError.innerHTML = "";
  } else {
    showFinishGameError(validation.messages);
  }
  if (focusFirstInvalid && !validation.valid) {
    const target = validation.invalidElements[0] || els.finishGameError;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => target.focus({ preventScroll: true }), 250);
  }
  return validation;
}

function showFinishGameError(messages) {
  els.finishGameError.innerHTML = `<strong>保存する前に確認してください</strong><ul>${messages
    .map((message) => `<li>${escapeHtml(message)}</li>`)
    .join("")}</ul>`;
  els.finishGameError.hidden = false;
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
    seasonNumber: state.seasonNumber,
    editionNumber: state.editionNumber,
    gameNumber: state.gameNumber,
    wolfCount: state.wolfCount,
    wolfModeActive: state.wolfModeActive,
    wolfModeCoverRole: players.find(isPriorityPlayer)?.wolfModeCoverRole || state.wolfModeCoverRole,
    winner: normalizeCitizenText(winner),
    startedAt: state.startedAt,
    finishedAt: new Date().toISOString(),
    players,
    results: structuredClone(state.results),
    seerColumnOverrides: structuredClone(state.seerColumnOverrides),
    seerMediumLinks: structuredClone(state.seerMediumLinks),
    rivalPerspectiveOverrides: structuredClone(state.rivalPerspectiveOverrides),
    rivalPerspectiveVersion: 2,
    roleActions: structuredClone(state.roleActions),
    claimEvents: structuredClone(state.claimEvents),
    voteHistories: structuredClone(state.voteHistories),
    selectedTournamentId: state.selectedTournamentId,
    boardId: activeBoardId,
  };
}

function getBoardPayload() {
  return Object.fromEntries(BOARD_STATE_FIELDS.map((field) => [field, structuredClone(state[field])]));
}

function getActiveBoard() {
  return state.boards.find((board) => board.id === activeBoardId);
}

function getDefaultBoardName() {
  const tournamentName = getSelectedTournament()?.name || state.eventName || "新しい盤面";
  return `${tournamentName} 第${state.gameNumber}試合`;
}

function saveCurrentBoardSnapshot() {
  if (switchingBoard) return;
  if (!activeBoardId) activeBoardId = crypto.randomUUID();
  synchronizeSharedRosterAcrossBoards();
  const payload = getBoardPayload();
  const existing = getActiveBoard();
  if (!existing) {
    state.boards.push({
      id: activeBoardId,
      name: getDefaultBoardName(),
      updatedAt: new Date().toISOString(),
      payload,
    });
  } else if (JSON.stringify(existing.payload) !== JSON.stringify(payload)) {
    existing.payload = payload;
    existing.updatedAt = new Date().toISOString();
  }
  localStorage.setItem(ACTIVE_BOARD_KEY, activeBoardId);
}

function synchronizeSharedRosterAcrossBoards() {
  const sharedPlayers = new Map(
    state.players.map((player) => [
      player.id,
      {
        id: player.id,
        name: player.name,
        tournamentIds: structuredClone(player.tournamentIds),
        participationByTournament: structuredClone(player.participationByTournament),
      },
    ]),
  );
  state.boards.forEach((board) => {
    if (!Array.isArray(board.payload?.players)) return;
    const boardPlayers = new Map(board.payload.players.map((player) => [player.id, player]));
    sharedPlayers.forEach((shared, id) => {
      const player = boardPlayers.get(id);
      if (player) {
        Object.assign(player, structuredClone(shared));
      } else {
        const added = normalizePlayer(shared);
        added.participating =
          shared.tournamentIds.includes(board.payload.selectedTournamentId) &&
          shared.participationByTournament[board.payload.selectedTournamentId] !== false;
        board.payload.players.push(added);
      }
    });
  });
}

function loadBoard(boardId, { storeAfter = true } = {}) {
  const board = state.boards.find((item) => item.id === boardId);
  if (!board?.payload) return false;
  switchingBoard = true;
  closeAllDialogs();
  BOARD_STATE_FIELDS.forEach((field) => {
    state[field] = structuredClone(board.payload[field]);
  });
  activeBoardId = board.id;
  localStorage.setItem(ACTIVE_BOARD_KEY, activeBoardId);
  switchingBoard = false;
  ensureMatchDefaults();
  backfillStatusDays();
  removeInvalidCurrentMediumResults();
  applyConfirmedWhiteUpdates();
  if (storeAfter) renderAndStore();
  return true;
}

function closeAllDialogs() {
  document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
  editingPlayerId = "";
  editingSeerId = "";
  membershipPlayerId = "";
  statusPlayerId = "";
  impressionPlayerId = "";
  roleGuessPlayerId = "";
  rivalPerspectiveRole = "";
  rivalPerspectiveViewerId = "";
  rivalPerspectiveTargetId = "";
}

function createBoard(name, tournamentId) {
  saveCurrentBoardSnapshot();
  const selectedTournamentId = state.tournaments.some((tournament) => tournament.id === tournamentId)
    ? tournamentId
    : state.selectedTournamentId;
  const players = state.players.map((player) => {
    const fresh = normalizePlayer({
      id: player.id,
      name: player.name,
      tournamentIds: player.tournamentIds,
      participationByTournament: player.participationByTournament,
    });
    fresh.participating =
      fresh.tournamentIds.includes(selectedTournamentId) &&
      fresh.participationByTournament[selectedTournamentId] !== false;
    return fresh;
  });
  const id = crypto.randomUUID();
  const tournamentName = state.tournaments.find((tournament) => tournament.id === selectedTournamentId)?.name || "新しい盤面";
  const payload = {
    ...getBoardPayload(),
    day: 1,
    eventName: tournamentName,
    eventDate: "",
    seasonNumber: null,
    editionNumber: null,
    gameNumber: 1,
    selectedTournamentId,
    wolfCount: 2,
    wolfModeActive: false,
    wolfModeCoverRole: "",
    reasoningPerspective: "seer",
    players,
    results: [],
    seerColumnOverrides: [],
    seerMediumLinks: [],
    rivalPerspectiveOverrides: [],
    rivalPerspectiveVersion: 2,
    roleActions: [],
    claimEvents: [],
    voteHistories: [],
    gameStatus: "preparing",
    startedAt: "",
    pendingExileContinuationPlayerId: "",
  };
  state.boards.push({ id, name: name.trim() || `${tournamentName} 第1試合`, updatedAt: new Date().toISOString(), payload });
  loadBoard(id);
}

function renameBoard(boardId) {
  const board = state.boards.find((item) => item.id === boardId);
  if (!board) return;
  const name = prompt("盤面名を変更", board.name);
  if (!name?.trim()) return;
  board.name = name.trim();
  board.updatedAt = new Date().toISOString();
  renderAndStore();
  if (els.boardManagerDialog.open) renderBoardManager();
}

function deleteBoard(boardId) {
  if (state.boards.length <= 1) return toast("最後の盤面は削除できません");
  const board = state.boards.find((item) => item.id === boardId);
  if (!board || !confirm(`「${board.name}」を削除しますか？終了済み履歴と共通名簿は残ります。`)) return;
  state.boards = state.boards.filter((item) => item.id !== boardId);
  if (boardId === activeBoardId) {
    const next = [...state.boards].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
    loadBoard(next.id, { storeAfter: false });
  }
  renderAndStore();
  if (els.boardManagerDialog.open) renderBoardManager();
  toast("盤面を削除しました");
}

function resetBoardState() {
  state.day = 1;
  state.pendingExileContinuationPlayerId = "";
  state.wolfModeActive = false;
  state.wolfModeCoverRole = "";
  state.reasoningPerspective = "seer";
  state.players = state.players.map((player) => ({
    ...player,
    role: "",
    manualRoleOverride: false,
    status: "alive",
    statusDay: null,
    memo: "",
    impressionReasons: [],
    roleGuessCandidates: [],
    primaryRoleGuess: "",
    manualRoleGuess: false,
    wolfModeCoverRole: "",
    wolfTeammate: false,
    wolfTeammatePreviousGuess: null,
    blackTargetPreference: "auto",
    blackTargetFixedRank: 0,
    blackTargetRank: 0,
    autoSelfRivalWolfSide: false,
    autoFullOutsiderVillager: false,
    autoSingleClaimRoleGuess: null,
    autoConfirmedWhite: false,
    autoConfirmedWhitePreviousGuess: null,
    mediumConfirmedRoleGuess: "",
    confirmedRoleEvidence: [],
    confirmedRolePreviousGuess: null,
    mediumHumanConversion: null,
    mediumHumanBrokenPrevious: null,
    mediumConflictBroken: false,
    confirmedResultConflictBroken: false,
    selfPerspectiveResultConflictBroken: false,
    attackConflictBroken: false,
    attackedWolfSideConfirmedMadman: false,
    attackedAutoVillager: false,
    trueRole: "",
    roleClaimOrder: null,
  }));
  state.results = [];
  state.seerColumnOverrides = [];
  state.seerMediumLinks = [];
  state.rivalPerspectiveOverrides = [];
  state.roleActions = [];
  state.claimEvents = [];
  state.voteHistories = [];
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
  els.membershipNameInput.value = player.name;
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
  const name = els.membershipNameInput.value.trim();
  if (!name) return toast("名前を入力してください");
  const duplicate = state.players.find(
    (candidate) => candidate.id !== player.id && candidate.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  if (duplicate) return toast("同じ名前の参加者がすでにいます");
  player.name = name;
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
  els.impressionSummary.textContent = `${impression.label} / 市${impression.villagerCount}・狼${impression.werewolfCount}`;
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
  if (player.autoConfirmedWhite && !isWolfMode() && !canOverrideAutoConfirmedWhite(player)) {
    return toast("確定白成立中は役職推理を変更できません");
  }
  roleGuessPlayerId = playerId;
  els.roleGuessPlayerName.textContent = player.name;
  renderRoleGuessDialog(player);
  els.roleGuessDialog.showModal();
}

function closeRoleGuessDialog() {
  roleGuessPlayerId = "";
  els.roleGuessDialog.close();
}

function openRivalPerspectiveDialog(role, viewerId, targetId) {
  if (isGameFinished()) return toast("終了済み盤面は編集できません");
  const viewer = findPlayer(viewerId);
  const target = findPlayer(targetId);
  if (!RIVAL_PERSPECTIVE_ROLES.has(role) || !viewer || !target || viewer.id === target.id) return;
  rivalPerspectiveRole = role;
  rivalPerspectiveViewerId = viewerId;
  rivalPerspectiveTargetId = targetId;
  els.rivalPerspectiveTitle.textContent = `${ROLE_LABELS[role]}の対抗視点`;
  els.rivalPerspectiveHint.textContent = `${viewer.name}視点の${target.name}`;
  const confirmedMadman = isRivalPerspectiveTargetConfirmedMadman(target);
  els.rivalPerspectiveValueSelect.value = getRivalPerspectiveOverride(role, viewerId, targetId)?.value || "";
  els.rivalPerspectiveValueSelect.disabled = confirmedMadman;
  if (confirmedMadman) {
    els.rivalPerspectiveValueSelect.value = "madman";
    els.rivalPerspectiveHint.textContent += "（襲撃により裏切り者で確定）";
  }
  els.rivalPerspectiveDialog.showModal();
}

function closeRivalPerspectiveDialog() {
  rivalPerspectiveRole = "";
  rivalPerspectiveViewerId = "";
  rivalPerspectiveTargetId = "";
  els.rivalPerspectiveDialog.close();
}

function saveRivalPerspectiveOverride() {
  const target = findPlayer(rivalPerspectiveTargetId);
  if (!target) return closeRivalPerspectiveDialog();
  if (isRivalPerspectiveTargetConfirmedMadman(target)) {
    closeRivalPerspectiveDialog();
    return toast("襲撃された対象は裏切り者で確定です");
  }
  const key = getRivalPerspectiveOverrideKey(rivalPerspectiveRole, rivalPerspectiveViewerId, rivalPerspectiveTargetId);
  state.rivalPerspectiveOverrides = state.rivalPerspectiveOverrides.filter(
    (override) => getRivalPerspectiveOverrideKey(override.role, override.viewerId, override.targetId) !== key,
  );
  const value = els.rivalPerspectiveValueSelect.value;
  if (RIVAL_PERSPECTIVE_VALUES.has(value)) {
    state.rivalPerspectiveOverrides.push({
      role: rivalPerspectiveRole,
      viewerId: rivalPerspectiveViewerId,
      targetId: rivalPerspectiveTargetId,
      value,
    });
  }
  autoStartGameFromBoardInput();
  closeRivalPerspectiveDialog();
  renderAndStore();
  toast(value ? "対抗視点欄を保存しました" : "対抗視点欄を自動表示へ戻しました");
}

function renderRoleGuessDialog(player) {
  const editingWolfModeMember = isWolfMode() && isWolfModeMember(player);
  const selectedValue = editingWolfModeMember ? getWolfModeCoverRole(player) : getRoleGuessDisplay(player).value;
  renderWolfModeEntryHint(player);
  renderMediumResultShortcut(player);
  renderBlackTargetOptions(player);
  const options = editingWolfModeMember
    ? Object.entries(ROLE_GUESS_LABELS).filter(([value]) => WOLF_MODE_COVER_ROLES.has(value))
    : Object.entries(ROLE_GUESS_LABELS);
  els.roleGuessCandidateOptions.innerHTML = options
    .map(
      ([value, label]) => `
        <label class="role-guess-option ${getRoleGuessClass(value)}">
          <input type="radio" name="roleGuessCandidate" value="${value}" ${selectedValue === value ? "checked" : ""} />
          <span>${label}</span>
        </label>
      `,
    )
    .join("");
  els.roleGuessCandidateOptions.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", handleRoleGuessCandidateChange);
  });
  renderPrimaryRoleGuessOptions(selectedValue === "unknown" ? "" : selectedValue);
  els.exitWolfModeBtn.hidden = !(isWolfMode() && isPriorityPlayer(player));
}

function renderMediumResultShortcut(player) {
  const mediumCount = getRoleClaimants("medium").length;
  const canInput = !isGameFinished() && player.status === "exiled" && mediumCount > 0;
  els.openMediumResultFromGuessBtn.hidden = !canInput;
  els.openMediumResultFromGuessBtn.textContent =
    mediumCount === 1 ? "霊媒結果を入力" : `${mediumCount}人の霊媒結果を入力`;
}

function openMediumResultFromRoleGuess() {
  const playerId = roleGuessPlayerId;
  if (!playerId) return;
  closeRoleGuessDialog();
  openEditDialog(playerId);
}

function renderBlackTargetOptions(player) {
  const canEdit = isBlackTargetSelectionReady() && !isPriorityPlayer(player) && !player.wolfTeammate;
  els.blackTargetField.hidden = !canEdit;
  if (!canEdit) {
    els.blackTargetSelect.innerHTML = "";
    return;
  }
  const selected =
    player.blackTargetPreference === "exclude"
      ? "exclude"
      : player.blackTargetPreference === "fixed" && player.blackTargetFixedRank
        ? `fixed-${player.blackTargetFixedRank}`
        : "auto";
  els.blackTargetSelect.innerHTML = [
    ["auto", "自動"],
    ["exclude", "対象外"],
    ...Array.from({ length: state.wolfCount }, (_, index) => [`fixed-${index + 1}`, `黒塗り${getCircledNumber(index + 1)}`]),
  ]
    .map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`)
    .join("");
}

function handleRoleGuessCandidateChange(event) {
  const input = event.currentTarget;
  renderPrimaryRoleGuessOptions(els.primaryRoleGuessSelect.value);
  if (input.value !== "unknown") els.primaryRoleGuessSelect.value = input.value;
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
  return Array.from(els.roleGuessCandidateOptions.querySelectorAll('input[type="radio"]:checked')).map(
    (input) => input.value,
  );
}

function saveRoleGuess() {
  const player = findPlayer(roleGuessPlayerId);
  if (!player) return;
  if (player.attackedWolfSideConfirmedMadman) {
    setConfirmedMadman(player);
    closeRoleGuessDialog();
    renderAndStore();
    return toast("襲撃された狼狂は裏切り者で確定です");
  }
  const selectedCandidates = normalizeRoleGuessCandidates(getSelectedRoleGuessCandidates());
  const selectedPrimary =
    normalizePrimaryRoleGuess(els.primaryRoleGuessSelect.value, selectedCandidates) ||
    selectedCandidates.find((value) => value !== "unknown") ||
    "";
  const selectedWerewolfForSelf = isPriorityPlayer(player) && selectedCandidates.includes("werewolf");
  if (isWolfMode() && isWolfModeMember(player)) {
    player.wolfModeCoverRole = WOLF_MODE_COVER_ROLES.has(selectedPrimary) ? selectedPrimary : "unknown";
    closeRoleGuessDialog();
    renderAndStore();
    return toast("表向き役職を保存しました");
  }
  const wasWolfMode = isWolfMode();
  if (selectedWerewolfForSelf && !wasWolfMode && player.participating === false) {
    return toast("参加中にすると人狼モードを開始できます");
  }
  const entersWolfMode = selectedWerewolfForSelf && !wasWolfMode;
  const teammateLimit = Math.max(0, state.wolfCount - 1);
  const shouldRegisterWolfTeammate =
    isWolfMode() &&
    !isPriorityPlayer(player) &&
    selectedPrimary === "werewolf" &&
    getWolfTeammates().length < teammateLimit;
  if (entersWolfMode) {
    state.wolfModeActive = true;
    state.wolfModeCoverRole = "";
    player.wolfModeCoverRole = "unknown";
    clearWolfModeSetupClaim(player);
  }
  if (shouldRegisterWolfTeammate) {
    player.wolfTeammatePreviousGuess = getRoleGuessSnapshot(player);
    if (state.gameStatus === "preparing") clearWolfModeSetupClaim(player);
    player.wolfTeammate = true;
    player.wolfModeCoverRole = "unknown";
  } else {
    player.roleGuessCandidates = selectedCandidates;
    player.primaryRoleGuess = selectedPrimary;
    player.manualRoleGuess = true;
    player.autoSelfRivalWolfSide = false;
    player.autoFullOutsiderVillager = false;
  }
  saveBlackTargetPreference(player);
  reconcileWolfTeammates();
  reconcileBlackTargets();
  autoStartGameFromBoardInput();
  closeRoleGuessDialog();
  renderAndStore();
  toast(
    shouldRegisterWolfTeammate && getWolfTeammates().length >= teammateLimit
      ? "仲間の人狼を選択しました"
      : shouldRegisterWolfTeammate
        ? `仲間の人狼を選択しました（残り${teammateLimit - getWolfTeammates().length}人）`
        : "役職推理を保存しました",
  );
}

function renderWolfModeEntryHint(player) {
  const show = isPriorityPlayer(player);
  els.wolfModeEntryHint.hidden = !show;
  if (!show) {
    els.wolfModeEntryHint.textContent = "";
    els.wolfModeEntryHint.className = "wolf-mode-entry-hint";
    return;
  }
  const inactive = player.participating === false;
  els.wolfModeEntryHint.className = `wolf-mode-entry-hint ${isWolfMode() ? "active" : inactive ? "disabled" : ""}`;
  els.wolfModeEntryHint.textContent = isWolfMode()
    ? "人狼モード中"
    : inactive
      ? "参加中にすると人狼モードを開始できます"
      : "人狼を選ぶと人狼モードを開始します";
}

function exitWolfMode() {
  if (!isWolfMode() || !confirm("人狼モードを終了し、仲間・黒塗り情報を解除しますか？")) return;
  const selfPlayer = getSelfPerspectivePlayer();
  state.wolfModeActive = false;
  state.wolfModeCoverRole = "";
  state.players.forEach((player) => {
    if (player.wolfTeammate) restoreWolfTeammatePreviousGuess(player);
    player.wolfModeCoverRole = "";
    clearBlackTargetState(player);
  });
  if (selfPlayer) {
    selfPlayer.roleGuessCandidates = ["unknown"];
    selfPlayer.primaryRoleGuess = "";
    selfPlayer.manualRoleGuess = false;
    selfPlayer.autoSelfRivalWolfSide = false;
  }
  closeRoleGuessDialog();
  renderAndStore();
  toast("人狼モードを終了しました");
}

function saveBlackTargetPreference(player) {
  if (els.blackTargetField.hidden || player.wolfTeammate || isPriorityPlayer(player)) return;
  const value = els.blackTargetSelect.value;
  if (value === "exclude") {
    player.blackTargetPreference = "exclude";
    player.blackTargetFixedRank = 0;
    return;
  }
  if (value.startsWith("fixed-")) {
    const rank = Math.max(1, Math.min(state.wolfCount, Number(value.slice(6)) || 1));
    state.players.forEach((candidate) => {
      if (candidate.id !== player.id && candidate.blackTargetPreference === "fixed" && candidate.blackTargetFixedRank === rank) {
        candidate.blackTargetPreference = "auto";
        candidate.blackTargetFixedRank = 0;
      }
    });
    player.blackTargetPreference = "fixed";
    player.blackTargetFixedRank = rank;
    return;
  }
  player.blackTargetPreference = "auto";
  player.blackTargetFixedRank = 0;
}

function getLivingSingleMedium() {
  const claimants = getRoleClaimants("medium");
  return claimants.length === 1 && claimants[0].status === "alive" ? claimants[0] : null;
}

function getRoleGuessDisplay(player) {
  const primary = normalizePrimaryRoleGuess(player.primaryRoleGuess, player.roleGuessCandidates);
  return {
    value: primary || "unknown",
    label: primary ? ROLE_GUESS_LABELS[primary] : ROLE_GUESS_LABELS.unknown,
  };
}

function getDisplayedRoleGuess(player) {
  if (isWolfMode() && isWolfModeMember(player)) {
    const value = getWolfModeCoverRole(player);
    return { value, label: ROLE_GUESS_LABELS[value] };
  }
  if (player.autoConfirmedWhite && !(player.manualRoleGuess && canOverrideAutoConfirmedWhite(player))) {
    return { value: "confirmedWhite", label: ROLE_GUESS_LABELS.confirmedWhite };
  }
  if (player.manualRoleGuess) return getRoleGuessDisplay(player);
  if (isSelfPerspectiveExposedHuman(player)) {
    return { value: "resultVillager", label: "結果市民" };
  }
  return getRoleGuessDisplay(player);
}

function getWolfModeCoverRole(player) {
  return WOLF_MODE_COVER_ROLES.has(player?.wolfModeCoverRole) ? player.wolfModeCoverRole : "unknown";
}

function isWolfModeMember(player) {
  return Boolean(player && (isPriorityPlayer(player) || player.wolfTeammate));
}

function getRoleGuessSnapshot(player) {
  return {
    roleGuessCandidates: [...player.roleGuessCandidates],
    primaryRoleGuess: player.primaryRoleGuess,
    manualRoleGuess: player.manualRoleGuess,
  };
}

function getWolfTeammates() {
  return state.players.filter((player) => player.wolfTeammate);
}

function clearWolfModeSetupClaim(player) {
  if (!player?.role) return false;
  const previousRole = player.role;
  invalidateInferenceForRoleChange(player, previousRole, "");
  player.role = "";
  player.manualRoleOverride = false;
  player.roleClaimOrder = null;
  player.attackedAutoVillager = false;
  reorderPlayersForBoard();
  return true;
}

function restoreWolfTeammatePreviousGuess(player) {
  const previous = player.wolfTeammatePreviousGuess;
  if (previous) {
    player.roleGuessCandidates = normalizeRoleGuessCandidates(previous.roleGuessCandidates, previous.primaryRoleGuess);
    player.primaryRoleGuess = normalizePrimaryRoleGuess(previous.primaryRoleGuess, player.roleGuessCandidates);
    player.manualRoleGuess = previous.manualRoleGuess === true;
  } else {
    player.roleGuessCandidates = ["unknown"];
    player.primaryRoleGuess = "";
    player.manualRoleGuess = false;
  }
  player.wolfTeammate = false;
  player.wolfTeammatePreviousGuess = null;
  player.wolfModeCoverRole = "";
}

function reconcileWolfTeammates() {
  state.players.forEach((player) => {
    if (!player.wolfTeammate) return;
    if (!isWolfMode() || isPriorityPlayer(player)) {
      restoreWolfTeammatePreviousGuess(player);
      return;
    }
  });
}

function isBlackTargetSelectionReady() {
  return isWolfMode() && getWolfTeammates().length >= Math.max(0, state.wolfCount - 1);
}

function reconcileBlackTargets() {
  if (!isBlackTargetSelectionReady()) {
    state.players.forEach(clearBlackTargetState);
    return;
  }
  const candidates = getBlackTargetCandidates();
  const candidateIds = new Set(candidates.map((player) => player.id));
  state.players.forEach((player) => {
    player.blackTargetRank = 0;
    if (player.blackTargetPreference === "fixed" && !candidateIds.has(player.id)) {
      player.blackTargetPreference = "auto";
      player.blackTargetFixedRank = 0;
    }
  });
  const usedRanks = new Set();
  candidates
    .filter((player) => player.blackTargetPreference === "fixed" && player.blackTargetFixedRank <= state.wolfCount)
    .sort((a, b) => a.blackTargetFixedRank - b.blackTargetFixedRank)
    .forEach((player) => {
      if (usedRanks.has(player.blackTargetFixedRank)) {
        player.blackTargetPreference = "auto";
        player.blackTargetFixedRank = 0;
        return;
      }
      player.blackTargetRank = player.blackTargetFixedRank;
      usedRanks.add(player.blackTargetRank);
    });
  const openRanks = Array.from({ length: state.wolfCount }, (_, index) => index + 1).filter((rank) => !usedRanks.has(rank));
  candidates
    .filter((player) => player.blackTargetPreference === "auto" && !player.blackTargetRank)
    .sort((a, b) => getBlackTargetScore(b) - getBlackTargetScore(a) || state.players.indexOf(a) - state.players.indexOf(b))
    .slice(0, openRanks.length)
    .forEach((player, index) => {
      player.blackTargetRank = openRanks[index];
    });
}

function clearBlackTargetState(player) {
  player.blackTargetPreference = "auto";
  player.blackTargetFixedRank = 0;
  player.blackTargetRank = 0;
}

function getBlackTargetCandidates() {
  return getActivePlayers().filter(
    (player) => {
      const roleGuess = getRoleGuessDisplay(player).value;
      return (
        !isPriorityPlayer(player) &&
        !player.wolfTeammate &&
        player.status !== "attacked" &&
        player.blackTargetPreference !== "exclude" &&
        roleGuess !== "madman" &&
        !(player.status === "exiled" && (VILLAGER_SIDE_ROLES.has(roleGuess) || roleGuess === "confirmedWhite")) &&
        !isConfirmedCitizenForBlackTarget(player)
      );
    },
  );
}

function isConfirmedCitizenForBlackTarget(player) {
  if (player.autoConfirmedWhite || player.role === "confirmedWhite") return true;
  if (player.mediumConfirmedRoleGuess === "villager") return true;
  return player.confirmedRoleEvidence?.some((evidence) => evidence.value === "villager") || false;
}

function getBlackTargetScore(player) {
  let score = player.status === "exiled" ? 100 : 0;
  const impression = getPlayerImpression(player).value;
  if (impression === "werewolf") score += 40;
  if (impression === "villager") score -= 30;
  const guess = getRoleGuessDisplay(player).value;
  if (guess === "werewolf") score += 35;
  if (guess === "wolfSide") score += 25;
  if (!player.role) score += 15;
  if (VILLAGER_SIDE_ROLES.has(player.role) || player.role === "confirmedWhite") score -= 20;
  score -= state.results.filter((result) => result.targetId === player.id && result.value === "human").length * 15;
  return score;
}

function isSelfPerspectiveExposedHuman(player) {
  const selfSeer = getSeers().find(isPriorityPlayer);
  return Boolean(selfSeer && getExposedHumanClaimForSeer(player, selfSeer));
}

function getRoleGuessClass(value) {
  if (value === "blackTarget") return "role-werewolf";
  if (value === "werewolf") return "role-werewolf";
  if (value === "resultVillager") return "role-villager";
  if (value === "unknown") return "role-unknown";
  return Object.hasOwn(ROLE_LABELS, value) ? `role-${value}` : "role-unknown";
}

function isAutoConfirmedWhiteCandidate(player, seers = getCurrentSeerClaimants()) {
  return shouldBecomeConfirmedWhite(player, seers);
}

function getPreferredConfirmedEvidenceValue(player) {
  const evidence = player.confirmedRoleEvidence || [];
  return (
    evidence.find((entry) => entry.role === "medium")?.value ||
    evidence.find((entry) => entry.role === "claim")?.value ||
    evidence[0]?.value ||
    ""
  );
}

function normalizeRoleGuessCandidates(values, preferredValue = "") {
  const candidates = [...new Set(Array.isArray(values) ? values.filter((value) => Object.hasOwn(ROLE_GUESS_LABELS, value)) : [])];
  if (!candidates.length || candidates.includes("unknown")) return ["unknown"];
  return [candidates.includes(preferredValue) ? preferredValue : candidates[0]];
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
  editingRoleTouched = false;
  els.editPlayerName.textContent = player.name;
  els.roleSelect.value = player.role || "";
  els.memoInput.value = player.memo || "";
  renderResultControls(player);
  renderMediumResultControl(player);
  renderMediumPerspectiveResultControl(player);
  renderRoleActionControls(player);
  els.editDialog.showModal();
}

function closeEditDialog() {
  editingPlayerId = "";
  editingSeerId = "";
  editingRoleTouched = false;
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

function openVoteDialog() {
  if (isGameFinished()) return toast("終了済み盤面は編集できません");
  const players = getActivePlayers();
  if (!players.length) return toast("参加者がいません");
  voteHistoryEditVisible = false;
  selectedRunoffTargetId = "";
  selectedRunoffVoterIds = new Set();
  els.voteDayInput.value = getDefaultVoteDialogDay();
  els.voteTargetSelect.innerHTML = getVoteTargetOptionsHtml(players);
  renderVoteHistoryList();
  updateVoteVoterOptions();
  els.voteDialog.showModal();
}

function closeVoteDialog() {
  persistVoteDialogChanges();
  els.voteDialog.close();
}

function addVoteFromDialog() {
  state.voteHistories = readVoteRows(els.voteHistoryList);
  const day = Number(els.voteDayInput.value) || 1;
  const context = getVoteInputContext(day, state.voteHistories);
  const vote = normalizeVoteHistory({
    id: crypto.randomUUID(),
    day,
    order: getNextVoteOrder(day, state.voteHistories),
    type: context.type,
    runoffRound: context.runoffRound,
    voterId: els.voteVoterSelect.value,
    targetId: els.voteTargetSelect.value,
    note: "",
  });
  if (!vote) return toast("投票者と投票先を選んでください");
  if (vote.voterId === vote.targetId) return toast("自分には投票できません");
  state.voteHistories.push(vote);
  const addedMirrorVotes = addRunoffMirrorVotes(vote, context, state.voteHistories);
  const autoExileMessage = applyAutoExileFromCompletedVotes(day, state.voteHistories);
  const nextDay = getNextVoteInputDay(day, state.voteHistories);
  els.voteDayInput.value = nextDay;
  renderAndStore();
  renderVoteHistoryList();
  updateVoteVoterOptions();
  updateVoteSummaryPanel();
  if (addedMirrorVotes) toast("残り票を反対側へ自動入力しました");
  if (autoExileMessage) toast(autoExileMessage);
}

function addRunoffMirrorVotes(vote, context, votes) {
  if (context.type !== "runoff" || context.targetPlayers.length !== 2) return 0;
  const otherTarget = context.targetPlayers.find((player) => player.id !== vote.targetId);
  if (!otherTarget) return 0;
  const remainingVoters = context.voterPlayers.filter((player) => player.id !== vote.voterId);
  remainingVoters.forEach((voter) => {
    votes.push(
      normalizeVoteHistory({
        id: crypto.randomUUID(),
        day: vote.day,
        order: getNextVoteOrder(vote.day, votes),
        type: "runoff",
        runoffRound: vote.runoffRound,
        voterId: voter.id,
        targetId: otherTarget.id,
        note: "",
      }),
    );
  });
  return remainingVoters.length;
}

function persistVoteDialogChanges() {
  state.voteHistories = readVoteRows(els.voteHistoryList);
  renderAndStore();
  updateVoteSummaryPanel();
}

function readVoteRows(root) {
  return Array.from(root.querySelectorAll("[data-vote-id]"))
    .map((row) =>
      normalizeVoteHistory({
        id: row.dataset.voteId.startsWith("new-") ? crypto.randomUUID() : row.dataset.voteId,
        day: row.querySelector('[data-field="day"]').value,
        order: row.querySelector('[data-field="order"]').value,
        type: row.querySelector('[data-field="type"]')?.value || "normal",
        runoffRound: row.querySelector('[data-field="runoffRound"]')?.value || 0,
        voterId: row.querySelector('[data-field="voterId"]').value,
        targetId: row.querySelector('[data-field="targetId"]').value,
        note: "",
      }),
    )
    .filter(Boolean);
}

function renderVoteHistoryList() {
  const players = getActivePlayers();
  const sortedVotes = sortVotesForEditDisplay(state.voteHistories);
  els.voteHistoryList.innerHTML = sortedVotes.length
    ? sortedVotes.map((vote) => getVoteEditorRowHtml(vote, players)).join("")
    : '<div class="empty-inline">投票履歴なし</div>';
  bindVoteEditorEvents(els.voteHistoryList);
  updateVoteHistoryEditVisibility();
  updateVoteSummaryPanel();
}

function sortVotesForEditDisplay(votes) {
  return votes
    .slice()
    .sort(
      (a, b) =>
        (Number(b.day) || 1) - (Number(a.day) || 1) ||
        getVoteEditTypePriority(b) - getVoteEditTypePriority(a) ||
        normalizeRunoffRound(b.runoffRound) - normalizeRunoffRound(a.runoffRound) ||
        getVoteOrder(b) - getVoteOrder(a),
    );
}

function getVoteEditTypePriority(vote) {
  return normalizeVoteType(vote.type) === "runoff" ? 1 : 0;
}

function sortResultsForEditDisplay(results) {
  return results
    .slice()
    .sort(
      (a, b) =>
        getDivinationOrder(b) - getDivinationOrder(a) ||
        String(b.id || "").localeCompare(String(a.id || "")),
    );
}

function sortClaimEventsForEditDisplay(events) {
  return events
    .slice()
    .sort(
      (a, b) =>
        (Number(b.day) || 1) - (Number(a.day) || 1) ||
        String(b.createdAt || "").localeCompare(String(a.createdAt || "")) ||
        String(b.id || "").localeCompare(String(a.id || "")),
    );
}

function sortRoleActionsForEditDisplay(actions) {
  return actions
    .slice()
    .sort(
      (a, b) =>
        (Number(b.day) || 1) - (Number(a.day) || 1) ||
        String(a.role || "").localeCompare(String(b.role || "")) ||
        String(a.actorId || "").localeCompare(String(b.actorId || "")) ||
        String(a.targetId || "").localeCompare(String(b.targetId || "")),
    );
}

function updateVoteHistoryEditVisibility() {
  if (!els.voteHistoryList || !els.toggleVoteHistoryEditBtn) return;
  els.voteHistoryList.hidden = !voteHistoryEditVisible;
  els.toggleVoteHistoryEditBtn.textContent = voteHistoryEditVisible ? "履歴編集を隠す" : "履歴編集を表示";
}

function updateVoteVoterOptions() {
  const currentVotes = readVoteRows(els.voteHistoryList);
  const players = getActivePlayers();
  const day = Number(els.voteDayInput.value) || 1;
  const previousValue = els.voteVoterSelect.value;
  const previousTargetValue = els.voteTargetSelect.value;
  const context = getVoteInputContext(day, currentVotes);
  const availablePlayers = context.voterPlayers;
  const availableTargets = context.targetPlayers;
  if (context.type === "runoff") {
    const fallbackTarget = availableTargets.find((player) => player.id === selectedRunoffTargetId)?.id
      || availableTargets.find((player) => player.id === previousTargetValue)?.id
      || availableTargets[0]?.id
      || "";
    if (selectedRunoffTargetId !== fallbackTarget) {
      selectedRunoffTargetId = fallbackTarget;
      selectedRunoffVoterIds = new Set();
    }
  } else {
    selectedRunoffTargetId = "";
    selectedRunoffVoterIds = new Set();
  }
  els.voteVoterSelect.innerHTML = getVotePlayerOptionsHtml(availablePlayers);
  els.voteTargetSelect.innerHTML = getVoteTargetOptionsHtml(
    getVoteTargetsForVoter(availableTargets, previousValue),
    previousTargetValue,
    context.type !== "runoff",
  );
  if (selectedRunoffTargetId) {
    els.voteTargetSelect.value = selectedRunoffTargetId;
  }
  if (availablePlayers.some((player) => player.id === previousValue)) {
    els.voteVoterSelect.value = previousValue;
  }
  updateVoteTargetOptionsForSelectedVoter();
  els.addVoteBtn.disabled = availablePlayers.length === 0;
  updateVoteModeNotice(context);
  renderRunoffQuickPanel(context);
  updateVoteSummaryPanel();
}

function updateVoteTargetOptionsForSelectedVoter() {
  const currentVotes = readVoteRows(els.voteHistoryList);
  const players = getActivePlayers();
  const day = Number(els.voteDayInput.value) || 1;
  const context = getVoteInputContext(day, currentVotes);
  const previousTargetValue = els.voteTargetSelect.value;
  const targets = getVoteTargetsForVoter(context.targetPlayers, els.voteVoterSelect.value);
  els.voteTargetSelect.innerHTML = getVoteTargetOptionsHtml(targets, previousTargetValue, context.type !== "runoff");
  if (context.type === "runoff" && selectedRunoffTargetId && targets.some((player) => player.id === selectedRunoffTargetId)) {
    els.voteTargetSelect.value = selectedRunoffTargetId;
  }
}

function getVoteTargetsForVoter(players, voterId) {
  return players.filter((player) => player.id !== voterId);
}

function updateVoteModeNotice(context) {
  if (!els.voteModeNotice) return;
  if (context.type === "runoff") {
    const names = context.targetPlayers.map((player) => player.name).join(" / ");
    const helper = context.targetPlayers.length === 2 ? "片方の投票者を選んで決定すると、残りは反対側へ入ります。" : `投票先は ${names || "候補なし"} のみです。`;
    els.voteModeNotice.hidden = false;
    els.voteModeNotice.className = "vote-mode-notice runoff";
    els.voteModeNotice.innerHTML = `<strong>決選投票</strong><span>${escapeHtml(helper)}</span>`;
    return;
  }
  els.voteModeNotice.hidden = false;
  els.voteModeNotice.className = "vote-mode-notice";
  els.voteModeNotice.innerHTML = "<strong>通常投票</strong><span>全員の投票が終わると最多票を判定します。</span>";
}

function renderRunoffQuickPanel(context) {
  if (!els.runoffQuickPanel) return;
  if (context.type !== "runoff") {
    els.runoffQuickPanel.hidden = true;
    els.runoffQuickPanel.innerHTML = "";
    selectedRunoffVoterIds = new Set();
    return;
  }
  const availableVoterIds = new Set(context.voterPlayers.map((player) => player.id));
  selectedRunoffVoterIds = new Set([...selectedRunoffVoterIds].filter((id) => availableVoterIds.has(id)));
  const targetButtons = context.targetPlayers
    .map(
      (player) => `
        <button class="runoff-target-button ${player.id === selectedRunoffTargetId ? "is-selected" : ""}" type="button" data-runoff-target="${escapeHtml(player.id)}">
          ${escapeHtml(player.name)}
        </button>
      `,
    )
    .join("");
  const voterButtons = context.voterPlayers.length
    ? context.voterPlayers
        .map(
          (player) => `
            <button class="runoff-voter-button ${selectedRunoffVoterIds.has(player.id) ? "is-selected" : ""}" type="button" data-runoff-voter="${escapeHtml(player.id)}" ${selectedRunoffTargetId ? "" : "disabled"}>
              ${selectedRunoffVoterIds.has(player.id) ? "✓ " : ""}
              ${escapeHtml(player.name)}
            </button>
          `,
        )
        .join("")
    : '<span class="vote-summary-empty">投票者なし</span>';
  const otherTarget = context.targetPlayers.length === 2
    ? context.targetPlayers.find((player) => player.id !== selectedRunoffTargetId)
    : null;
  const helperText = selectedRunoffTargetId && otherTarget
    ? `未選択の投票者は ${otherTarget.name} へ入ります。`
    : "";
  const canConfirm = selectedRunoffTargetId && context.voterPlayers.length && (context.targetPlayers.length === 2 || selectedRunoffVoterIds.size);
  els.runoffQuickPanel.hidden = false;
  els.runoffQuickPanel.innerHTML = `
    <div class="runoff-quick-section">
      <strong>投票先を固定</strong>
      <div class="runoff-target-list">${targetButtons || '<span class="vote-summary-empty">候補なし</span>'}</div>
    </div>
    <div class="runoff-quick-section">
      <strong>${selectedRunoffTargetId ? "投票者を選択" : "投票先を選んでください"}</strong>
      ${helperText ? `<span class="runoff-helper">${escapeHtml(helperText)}</span>` : ""}
      <div class="runoff-voter-list">${voterButtons}</div>
      <button class="primary-button runoff-confirm-button" type="button" data-runoff-confirm ${canConfirm ? "" : "disabled"}>
        決定
      </button>
    </div>
  `;
  els.runoffQuickPanel.querySelectorAll("[data-runoff-target]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRunoffTargetId = button.dataset.runoffTarget || "";
      selectedRunoffVoterIds = new Set();
      els.voteTargetSelect.value = selectedRunoffTargetId;
      renderRunoffQuickPanel(getVoteInputContext(Number(els.voteDayInput.value) || 1, readVoteRows(els.voteHistoryList)));
    });
  });
  els.runoffQuickPanel.querySelectorAll("[data-runoff-voter]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!selectedRunoffTargetId) return toast("投票先を選んでください");
      const voterId = button.dataset.runoffVoter || "";
      if (selectedRunoffVoterIds.has(voterId)) {
        selectedRunoffVoterIds.delete(voterId);
      } else {
        selectedRunoffVoterIds.add(voterId);
      }
      renderRunoffQuickPanel(context);
    });
  });
  els.runoffQuickPanel.querySelector("[data-runoff-confirm]")?.addEventListener("click", () => addSelectedRunoffVotes(context));
}

function addSelectedRunoffVotes(context) {
  if (context.type !== "runoff" || !selectedRunoffTargetId) {
    return toast("投票先を選んでください");
  }
  state.voteHistories = readVoteRows(els.voteHistoryList);
  const day = Number(els.voteDayInput.value) || 1;
  const voteContext = getVoteInputContext(day, state.voteHistories);
  const targetIds = new Set(voteContext.targetPlayers.map((player) => player.id));
  if (voteContext.type !== "runoff" || !targetIds.has(selectedRunoffTargetId)) {
    selectedRunoffVoterIds = new Set();
    updateVoteVoterOptions();
    return toast("決選投票の状態が変わりました");
  }
  const selectedIds = new Set([...selectedRunoffVoterIds].filter((id) => voteContext.voterPlayers.some((player) => player.id === id)));
  const otherTarget = voteContext.targetPlayers.length === 2
    ? voteContext.targetPlayers.find((player) => player.id !== selectedRunoffTargetId)
    : null;
  if (!otherTarget && !selectedIds.size) return toast("投票者を選んでください");
  voteContext.voterPlayers.forEach((voter) => {
    const targetId = selectedIds.has(voter.id) ? selectedRunoffTargetId : otherTarget?.id;
    if (!targetId) return;
    state.voteHistories.push(
      normalizeVoteHistory({
        id: crypto.randomUUID(),
        day,
        order: getNextVoteOrder(day, state.voteHistories),
        type: "runoff",
        runoffRound: voteContext.runoffRound,
        voterId: voter.id,
        targetId,
        note: "",
      }),
    );
  });
  selectedRunoffVoterIds = new Set();
  const autoExileMessage = applyAutoExileFromCompletedVotes(day, state.voteHistories);
  els.voteDayInput.value = day;
  renderAndStore();
  renderVoteHistoryList();
  updateVoteVoterOptions();
  updateVoteSummaryPanel();
  toast(autoExileMessage || "決選投票を保存しました");
}

function updateVoteSummaryPanel() {
  if (!els.voteSummaryPanel) return;
  const selectedDay = Number(els.voteDayInput.value) || 1;
  const votes = readVoteRows(els.voteHistoryList);
  const players = getActivePlayers();
  const days = getVoteSummaryDays(votes, selectedDay);
  els.voteSummaryPanel.innerHTML = days
    .map((day) => getVoteDaySummaryHtml(votes, players, day, day === selectedDay))
    .join("");
}

function getVoteSummaryDays(votes, selectedDay) {
  const days = new Set([Number(selectedDay) || 1]);
  votes.forEach((vote) => days.add(Number(vote.day) || 1));
  return [...days].sort((a, b) => b - a);
}

function getVoteDaySummaryHtml(votes, players, day, isSelected) {
  const phaseKeys = getVoteSummaryPhaseKeys(votes, day);
  const currentContext = isSelected ? getVoteInputContext(day, votes, players) : null;
  if (currentContext && !phaseKeys.some((phase) => phase.type === currentContext.type && phase.runoffRound === currentContext.runoffRound)) {
    phaseKeys.push({ type: currentContext.type, runoffRound: currentContext.runoffRound });
  }
  const phaseHtml = sortVotePhaseKeysForSummary(phaseKeys)
    .map((phase) => {
      const summary = formatVoteSummaryForDay(votes, players, day, phase.type, phase.runoffRound);
      const voteOrder = getVoteOrderEntriesForDay(votes, players, day, phase.type, phase.runoffRound);
      const decisiveVoteId = getDecisiveVoteIdForPhase(votes, day, phase.type, phase.runoffRound);
      const voteOrderHtml = voteOrder.length
        ? voteOrder
            .map(
              (entry) => `
                <div class="vote-order-item ${phase.type === "runoff" ? "no-order" : ""} ${entry.id === decisiveVoteId ? "is-decisive" : ""}">
                  ${phase.type === "runoff" ? "" : `<span class="vote-order-number">${escapeHtml(formatVoteOrderMarker(entry.order))}</span>`}
                  <span class="vote-order-text">${escapeHtml(entry.voterName)} → ${escapeHtml(entry.targetName)}${entry.id === decisiveVoteId ? '<span class="vote-decisive-badge">決定票</span>' : ""}</span>
                </div>
              `,
            )
            .join("")
        : '<span class="vote-summary-empty">投票順なし</span>';
      return `
        <div class="vote-phase-summary">
          <div class="vote-phase-title">${escapeHtml(getVotePhaseLabel(phase.type, phase.runoffRound))}</div>
          <div class="vote-summary-section">
            <strong>得票</strong>
            <span>${summary ? escapeHtml(summary.replace(/^得票: /, "")) : "投票なし"}</span>
          </div>
          <div class="vote-summary-section">
            <strong>${phase.type === "runoff" ? "投票結果" : "投票順"}</strong>
            <div class="vote-order-list">${voteOrderHtml}</div>
          </div>
        </div>
      `;
    })
    .join("");
  return `
    <section class="vote-day-summary ${isSelected ? "is-current" : ""}">
      <div class="vote-day-summary-title">
        <strong>${day}日目</strong>
        ${isSelected ? '<span>入力中</span>' : ""}
      </div>
      ${phaseHtml || '<span class="vote-summary-empty">投票なし</span>'}
    </section>
  `;
}

function getVoteAvailableVoters(players, day, votes) {
  return getVoteInputContext(day, votes, players).voterPlayers;
}

function getBaseVoteEligiblePlayers(players, day) {
  return players.filter((player) => canPlayerVoteOnDay(player, day));
}

function getVoteAvailableVotersForPhase(players, day, votes, type, runoffRound, excludedVoterIds = new Set()) {
  const votedIds = new Set(
    votes
      .filter((vote) => {
        if (Number(vote.day) !== Number(day)) return false;
        if (normalizeVoteType(vote.type) !== type) return false;
        return type !== "runoff" || normalizeRunoffRound(vote.runoffRound) === runoffRound;
      })
      .map((vote) => vote.voterId),
  );
  return getBaseVoteEligiblePlayers(players, day).filter((player) => !votedIds.has(player.id) && !excludedVoterIds.has(player.id));
}

function hasRemainingVotersForDay(day, votes = state.voteHistories) {
  return getVoteInputContext(day, votes).voterPlayers.length > 0;
}

function canPlayerVoteOnDay(player, day) {
  if (!isInactiveStatus(player.status)) return true;
  const statusDay = Number(player.statusDay) || 1;
  return statusDay > (Number(day) || 1);
}

function getVoteAvailableTargets(players, day, votes = state.voteHistories) {
  return getVoteInputContext(day, votes, players).targetPlayers;
}

function getVoteInputContext(day, votes = state.voteHistories, players = getActivePlayers()) {
  const normalizedDay = Number(day) || 1;
  const normalVotes = getVotesForPhase(votes, normalizedDay, "normal", 0);
  const normalVoters = getVoteAvailableVotersForPhase(players, normalizedDay, votes, "normal", 0);
  const baseTargets = getBaseVoteEligiblePlayers(players, normalizedDay);
  if (normalVoters.length) {
    return {
      type: "normal",
      runoffRound: 0,
      voterPlayers: normalVoters,
      targetPlayers: baseTargets,
      tiedTargetIds: [],
    };
  }
  let tiedTargetIds = getTopVoteTargetIds(normalVotes);
  if (tiedTargetIds.length < 2) {
    return {
      type: "normal",
      runoffRound: 0,
      voterPlayers: [],
      targetPlayers: baseTargets,
      tiedTargetIds: [],
    };
  }
  let runoffRound = 1;
  while (true) {
    const excludedVoters = new Set(tiedTargetIds);
    const runoffVoters = getVoteAvailableVotersForPhase(players, normalizedDay, votes, "runoff", runoffRound, excludedVoters);
    const runoffTargets = players.filter((player) => tiedTargetIds.includes(player.id) && canPlayerVoteOnDay(player, normalizedDay));
    if (runoffVoters.length) {
      return {
        type: "runoff",
        runoffRound,
        voterPlayers: runoffVoters,
        targetPlayers: runoffTargets,
        tiedTargetIds,
      };
    }
    const runoffVotes = getVotesForPhase(votes, normalizedDay, "runoff", runoffRound);
    const nextTiedTargetIds = getTopVoteTargetIds(runoffVotes);
    if (nextTiedTargetIds.length < 2) {
      return {
        type: "runoff",
        runoffRound,
        voterPlayers: [],
        targetPlayers: runoffTargets,
        tiedTargetIds,
      };
    }
    tiedTargetIds = nextTiedTargetIds;
    runoffRound += 1;
  }
}

function getVoteEditorRowHtml(vote, players) {
  const isRunoff = normalizeVoteType(vote.type) === "runoff";
  return `
    <div class="vote-edit-row ${isRunoff ? "is-runoff" : ""}" data-vote-id="${escapeHtml(vote.id)}">
      <input data-field="day" type="number" min="1" value="${Number(vote.day) || 1}" aria-label="日付" />
      <input data-field="order" type="${isRunoff ? "hidden" : "number"}" min="1" value="${getVoteOrder(vote)}" aria-label="投票順" />
      <select data-field="type" aria-label="投票区分">${getVoteTypeOptionsHtml(vote.type)}</select>
      <input data-field="runoffRound" type="hidden" value="${normalizeRunoffRound(vote.runoffRound)}" />
      <select data-field="voterId" aria-label="投票者">${getVotePlayerOptionsHtml(players, vote.voterId)}</select>
      <select data-field="targetId" aria-label="投票先">${getVoteTargetOptionsHtml(players, vote.targetId)}</select>
      <button class="danger-button" type="button" data-delete-vote>削除</button>
    </div>
  `;
}

function bindVoteEditorEvents(root) {
  root.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("change", () => {
      persistVoteDialogChanges();
      const autoExileMessage = applyAutoExileFromCompletedVotes(Number(input.closest("[data-vote-id]")?.querySelector('[data-field="day"]')?.value) || 1);
      if (autoExileMessage) {
        renderAndStore();
        toast(autoExileMessage);
      }
      renderVoteHistoryList();
      updateVoteVoterOptions();
    });
  });
  root.querySelectorAll("[data-delete-vote]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("[data-vote-id]");
      const voteId = row.dataset.voteId;
      state.voteHistories = readVoteRows(root).filter((vote) => vote.id !== voteId);
      renderAndStore();
      renderVoteHistoryList();
      updateVoteVoterOptions();
    });
  });
}

function getVotePlayerOptionsHtml(players, selectedId = "") {
  return players
    .map((player) => `<option value="${escapeHtml(player.id)}" ${player.id === selectedId ? "selected" : ""}>${escapeHtml(player.name)}</option>`)
    .join("");
}

function getVoteTargetOptionsHtml(players, selectedId = "", allowAbstain = true) {
  return [
    ...(allowAbstain ? [["abstain", "棄権"]] : []),
    ...players.map((player) => [player.id, player.name]),
  ]
    .map(([value, label]) => `<option value="${escapeHtml(value)}" ${value === selectedId ? "selected" : ""}>${escapeHtml(label)}</option>`)
    .join("");
}

function getVoteTypeOptionsHtml(selectedType = "normal") {
  const type = normalizeVoteType(selectedType);
  return Object.entries(VOTE_TYPE_LABELS)
    .map(([value, label]) => `<option value="${value}" ${value === type ? "selected" : ""}>${label}</option>`)
    .join("");
}

function getVoteOrder(vote) {
  return Number.isFinite(Number(vote.order)) ? Math.max(1, Number(vote.order)) : Math.max(1, Number(vote.round) || 1);
}

function getNextVoteOrder(day, votes = state.voteHistories) {
  const orders = votes
    .filter((vote) => Number(vote.day) === Number(day))
    .map(getVoteOrder);
  return orders.length ? Math.max(...orders) + 1 : 1;
}

function getDefaultVoteDialogDay() {
  const exiledMax = getMaxStatusDay("exiled");
  if (exiledMax > 0) {
    for (let day = 1; day <= exiledMax; day += 1) {
      if (hasRemainingVotersForDay(day)) return day;
    }
    return exiledMax + 1;
  }
  const currentDay = Math.max(1, getCurrentLogDay());
  return hasRemainingVotersForDay(currentDay) ? currentDay : 1;
}

function getNextVoteInputDay(currentDay, votes = state.voteHistories) {
  const day = Number(currentDay) || 1;
  const hasExileForDay = getActivePlayers().some(
    (player) => player.status === "exiled" && (Number(player.statusDay) || 1) === day,
  );
  return hasExileForDay && !hasRemainingVotersForDay(day, votes) ? day + 1 : day;
}

function applyAutoExileFromCompletedVotes(day, votes = state.voteHistories) {
  const normalizedDay = Number(day) || 1;
  if (hasRemainingVotersForDay(normalizedDay, votes)) return "";
  const targetId = getCompletedVoteExileTargetId(normalizedDay, votes);
  if (!targetId) return "";
  const target = findPlayer(targetId);
  if (!target || isInactiveStatus(target.status)) return "";
  invalidateInferenceForStatusChange(target);
  target.status = "exiled";
  target.statusDay = normalizedDay;
  removeInvalidCurrentMediumResults();
  movePlayerToInactiveTop(target.id);
  state.pendingExileContinuationPlayerId = target.id;
  autoStartGameFromBoardInput();
  return `${target.name}を${normalizedDay}日目追放にしました`;
}

function getCompletedVoteExileTargetId(day, votes = state.voteHistories) {
  const normalVotes = getVotesForPhase(votes, day, "normal", 0);
  const normalTop = getTopVoteTargetIds(normalVotes);
  if (normalTop.length === 1) return normalTop[0];
  if (normalTop.length < 2) return "";
  let tiedTargetIds = normalTop;
  let runoffRound = 1;
  while (true) {
    const excludedVoters = new Set(tiedTargetIds);
    const remainingVoters = getVoteAvailableVotersForPhase(
      getActivePlayers(),
      day,
      votes,
      "runoff",
      runoffRound,
      excludedVoters,
    );
    if (remainingVoters.length) return "";
    const runoffVotes = getVotesForPhase(votes, day, "runoff", runoffRound);
    const runoffTop = getTopVoteTargetIds(runoffVotes);
    if (runoffTop.length === 1) return runoffTop[0];
    if (runoffTop.length < 2) return "";
    tiedTargetIds = runoffTop;
    runoffRound += 1;
  }
}

function getVotesForPhase(votes, day, type, runoffRound = 0) {
  return votes.filter((vote) => {
    if ((Number(vote.day) || 1) !== day) return false;
    if (normalizeVoteType(vote.type) !== type) return false;
    return type !== "runoff" || normalizeRunoffRound(vote.runoffRound) === runoffRound;
  });
}

function getTopVoteTargetIds(votes) {
  const groups = new Map();
  votes
    .filter((vote) => vote.targetId && vote.targetId !== "abstain")
    .forEach((vote) => {
      groups.set(vote.targetId, (groups.get(vote.targetId) || 0) + 1);
    });
  if (!groups.size) return [];
  const sorted = [...groups.entries()].sort((a, b) => b[1] - a[1]);
  const topCount = sorted[0][1];
  return sorted.filter(([, count]) => count === topCount).map(([targetId]) => targetId);
}

function normalizeVoteType(type) {
  return VOTE_TYPES.has(type) ? type : "normal";
}

function normalizeRunoffRound(round) {
  return Number.isFinite(Number(round)) ? Math.max(1, Number(round)) : 1;
}
function setPlayerStatus(status) {
  const player = findPlayer(statusPlayerId);
  if (!player) return;
  const statusChanged = player.status !== status;
  let continuationNotice = "";
  if (statusChanged) {
    if (state.pendingExileContinuationPlayerId === player.id && status === "alive") {
      state.pendingExileContinuationPlayerId = "";
    } else {
      continuationNotice = confirmPendingExileContinuation();
    }
    invalidateInferenceForStatusChange(player);
  }
  const wasInactive = isInactiveStatus(player.status);
  const isBecomingInactive = isInactiveStatus(status);
  const nextStatusDay = isBecomingInactive && !wasInactive ? getNextStatusDayForStatus(status) : player.statusDay;
  player.status = status;
  player.statusDay = isBecomingInactive ? nextStatusDay || getNextStatusDayForStatus(status) : null;
  removeInvalidCurrentMediumResults();
  if (status === "attacked") {
    applyAttackRoleUpdates(player);
  }
  if (isBecomingInactive && !wasInactive) {
    movePlayerToInactiveTop(player.id);
  } else {
    reorderPlayersForBoard();
  }
  if (statusChanged && status === "exiled") {
    state.pendingExileContinuationPlayerId = player.id;
  }
  autoStartGameFromBoardInput();
  closeStatusDialog();
  renderAndStore();
  toast(continuationNotice || (status === "alive" ? "生存に戻しました" : `${STATUS_LABELS[status]}にしました`));
}

function saveEditingPlayer() {
  const player = findPlayer(editingPlayerId);
  if (!player) return;
  const progressSignatureBefore = getMeaningfulProgressSignature();
  let continuationNotice = "";
  const previousRole = player.role;
  const selectedRole = els.roleSelect.value;
  if (editingRoleTouched && previousRole !== selectedRole) {
    invalidateInferenceForRoleChange(player, previousRole, selectedRole);
  }
  player.role = player.attackedWolfSideConfirmedMadman ? "madman" : selectedRole;
  player.memo = els.memoInput.value.trim();
  if (editingRoleTouched) player.manualRoleOverride = true;
  if (previousRole !== player.role) {
    player.attackedAutoVillager = false;
    player.roleClaimOrder = player.role ? getNextRoleClaimOrder() : null;
    reorderPlayersForBoard();
  }
  saveRoleActionResults(player);
  saveIndependentMediumResult(player);
  saveMediumPerspectiveResults(player);
  saveDivinationResult({ silent: true });
  saveAdoptedMediumSelection();
  if (previousRole !== player.role) addClaimEvent(player.id, previousRole, player.role);
  if (progressSignatureBefore !== getMeaningfulProgressSignature()) continuationNotice = confirmPendingExileContinuation();
  autoStartGameFromBoardInput();
  closeEditDialog();
  renderAndStore();
  toast(continuationNotice || "保存しました");
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
  const previousValue = getSeerColumnOverride(seer.id, target.id)?.value || existing?.value || "";
  if (previousValue !== value) invalidateInferenceForResultChange(target, seer);
  state.seerColumnOverrides = state.seerColumnOverrides.filter(
    (override) => override.seerId !== seer.id || override.targetId !== target.id,
  );
  if (!value) {
    if (existing) state.results = state.results.filter((result) => result.id !== existing.id);
    if (!silent) renderAndStore();
    return true;
  }
  state.seerColumnOverrides.push({ seerId: seer.id, targetId: target.id, value });
  if (!Object.hasOwn(RESULT_LABELS, value)) {
    if (existing) state.results = state.results.filter((result) => result.id !== existing.id);
    autoStartGameFromBoardInput();
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
  if (isPriorityPlayer(seer)) applyConfirmedSeerResultRoleGuess(target, seer, value);
  autoStartGameFromBoardInput();
  if (!silent) renderAndStore();
  return true;
}

function saveAdoptedMediumSelection() {
  const seer = findPlayer(editingSeerId);
  if (!seer) return false;
  if (els.adoptedMediumSection.hidden) return false;
  const mediumId = els.adoptedMediumSelect.value;
  const previousValue = getAdoptedMediumId(seer.id);
  if (previousValue === mediumId) return false;
  setAdoptedMediumForSeer(seer.id, mediumId);
  return true;
}

function applyAttackRoleUpdates(attackedPlayer) {
  if (attackedPlayer.role === "wolfSide") setConfirmedMadman(attackedPlayer);
  applyAttackedRoleGuess(attackedPlayer);
  const hadRole = Boolean(attackedPlayer.role);
  if (!attackedPlayer.manualRoleOverride && !hadRole && !hasVisibleDivinationResultForTarget(attackedPlayer.id)) {
    attackedPlayer.role = "villager";
    attackedPlayer.attackedAutoVillager = true;
  }

  state.results
    .filter((result) => result.targetId === attackedPlayer.id && result.value === "werewolf")
    .forEach((result) => {
      const seer = findPlayer(result.seerId);
      if (seer) markSeerBroken(seer, "attack");
    });
}

function applyAttackedRoleGuess(player) {
  if (player.attackedWolfSideConfirmedMadman) return;
  const currentGuess = normalizePrimaryRoleGuess(player.primaryRoleGuess, player.roleGuessCandidates) || "unknown";
  if (VILLAGER_SIDE_ROLES.has(currentGuess) || ["confirmedWhite", "madman"].includes(currentGuess)) return;
  const nextGuess = ["werewolf", "wolfSide"].includes(currentGuess)
    ? "madman"
    : currentGuess === "unknown"
      ? "villager"
      : "";
  if (!nextGuess) return;
  player.roleGuessCandidates = [nextGuess];
  player.primaryRoleGuess = nextGuess;
  player.manualRoleGuess = true;
}

function setConfirmedMadman(player) {
  player.attackedWolfSideConfirmedMadman = true;
  player.role = "madman";
  player.manualRoleOverride = false;
  player.roleGuessCandidates = ["madman"];
  player.primaryRoleGuess = "madman";
  player.manualRoleGuess = false;
  player.autoSelfRivalWolfSide = false;
  player.attackedAutoVillager = false;
  player.roleClaimOrder = getNextRoleClaimOrder();
}

function releaseManualInference(player, { role = true, guess = true } = {}) {
  if (!player || player.attackedWolfSideConfirmedMadman) return;
  if (role) player.manualRoleOverride = false;
  if (guess) player.manualRoleGuess = false;
}

function invalidateInferenceForResultChange(target, actor) {
  releaseManualInference(target);
  releaseManualInference(actor);
}

function invalidateInferenceForStatusChange(player) {
  releaseManualInference(player);
  state.results
    .filter((result) => result.targetId === player.id)
    .forEach((result) => releaseManualInference(findPlayer(result.seerId)));
  state.rivalPerspectiveOverrides = state.rivalPerspectiveOverrides.filter(
    (override) => override.viewerId !== player.id && override.targetId !== player.id,
  );
}

function invalidateInferenceForRoleChange(player, previousRole, nextRole) {
  const affectedRoles = new Set([previousRole, nextRole].filter((role) => RIVAL_PERSPECTIVE_ROLES.has(role)));
  getActivePlayers().forEach((candidate) => {
    if (
      candidate.id === player.id ||
      affectedRoles.has(candidate.role) ||
      (affectedRoles.has("seer") && state.results.some((result) => result.targetId === candidate.id)) ||
      (affectedRoles.has("medium") &&
        state.roleActions.some((action) => action.role === "medium" && action.targetId === candidate.id))
    ) {
      releaseManualInference(candidate);
    }
  });
  state.rivalPerspectiveOverrides = state.rivalPerspectiveOverrides.filter(
    (override) => !affectedRoles.has(override.role),
  );
}

function render() {
  renderActiveView();
  renderPerspectiveMode();
  renderReasoningPerspectiveToggle();
  renderMatchMeta();
  renderGameLifecycle();
  renderSyncStatus();
  renderBoardSwitcher();
  els.wolfCountSelect.value = String(state.wolfCount);
  els.playerCountBadge.textContent = `参加${getActivePlayers().length}/${getSelectedTournamentPlayers().length}人`;
  if (state.activeView === "participants") renderParticipantRows();
  if (state.activeView === "reasoning") {
    renderRopeCount();
    renderRows();
  }
  if (state.activeView === "export") renderHistories();
}

function setReasoningPerspective(perspective) {
  const next = normalizeReasoningPerspective(perspective);
  if (state.reasoningPerspective === next) return;
  state.reasoningPerspective = next;
  renderAndStore();
}

function renderReasoningPerspectiveToggle() {
  const perspective = normalizeReasoningPerspective(state.reasoningPerspective);
  state.reasoningPerspective = perspective;
  els.seerPerspectiveBtn.classList.toggle("active", perspective === "seer");
  els.mediumPerspectiveBtn.classList.toggle("active", perspective === "medium");
}

function renderPerspectiveMode() {
  const wolfMode = isWolfMode();
  document.body.dataset.perspectiveMode = wolfMode ? "werewolf" : "normal";
  els.wolfModeBadge.hidden = !wolfMode;
  if (wolfMode) {
    const selectedCount = state.players.filter((player) => player.blackTargetRank).length;
    els.wolfModeBadge.textContent = isBlackTargetSelectionReady()
      ? `人狼モード・黒塗り ${selectedCount}/${state.wolfCount}`
      : `人狼モード・仲間 ${getWolfTeammates().length}/${Math.max(0, state.wolfCount - 1)}`;
  }
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
  els.eventDateText.textContent = state.eventDate || "日付未選択";
  els.dateActionText.textContent = state.eventDate ? "変更" : "選択";
  els.clearDateBtn.hidden = !state.eventDate;
  els.dateInputWrap.classList.toggle("has-date", Boolean(state.eventDate));
  els.seasonNumberInput.value = state.seasonNumber || "";
  els.editionNumberInput.value = state.editionNumber || "";
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
  const participantView = state.activeView === "participants";
  const reasoningView = state.activeView === "reasoning";
  els.gameStatusBadge.textContent = finished ? "終了済み" : inProgress ? "進行中" : "準備中";
  els.gameStatusBadge.classList.toggle("in-progress", inProgress);
  els.gameStatusBadge.classList.toggle("finished", finished);
  els.startGameBtn.hidden = !participantView || inProgress || finished;
  els.boardActionsBtn.hidden = !reasoningView || finished;
  els.finishGameBtn.hidden = !reasoningView || !inProgress;
  els.nextGameBtn.hidden = !reasoningView || !finished;
  els.openVoteDialogBtn.hidden = !reasoningView || finished;
  els.dateInputWrap.classList.toggle("locked", inProgress || finished);
  [
    els.tournamentSelect,
    els.addTournamentBtn,
    els.renameTournamentBtn,
    els.eventDateInput,
    els.openDatePickerBtn,
    els.clearDateBtn,
    els.seasonNumberInput,
    els.editionNumberInput,
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
  const existingHistoryIds = new Set(state.gameHistories.map((history) => history.id));
  selectedHistoryIds = new Set([...selectedHistoryIds].filter((id) => existingHistoryIds.has(id)));
  state.gameHistories.forEach((history) => {
    const row = document.createElement("div");
    row.className = "history-item-row";
    const checkbox = document.createElement("input");
    checkbox.className = "history-select-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = selectedHistoryIds.has(history.id);
    checkbox.setAttribute("aria-label", `${getHistoryDisplayName(history)} 第${normalizeGameNumber(history.gameNumber)}試合を選択`);
    checkbox.addEventListener("change", () => toggleHistorySelection(history.id, checkbox.checked));
    const button = document.createElement("button");
    button.className = `history-item ${history.id === selectedHistoryId ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="history-item-main">
        <strong>${escapeHtml(getHistoryDisplayName(history))}</strong>
        <span>${escapeHtml(history.eventDate || "日付未選択")} / 第${normalizeGameNumber(history.gameNumber)}試合</span>
      </span>
      <span class="winner-label">${escapeHtml(normalizeCitizenText(history.winner) || "勝利陣営未設定")}</span>
    `;
    button.addEventListener("click", () => openHistoryDetail(history.id));
    row.append(checkbox, button);
    els.historyList.appendChild(row);
  });
  const selected = getSelectedHistory();
  els.historyDetailPanel.hidden = !selected;
  if (selected) els.historyDetailPreview.textContent = buildHistoryText(selected);
  renderHistorySelectionControls();
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
  els.wolfCountBadge.textContent = `人狼 ${state.wolfCount}人`;
  els.ropeCountBadge.textContent = `生存${aliveCount} / 残り${getRemainingRopeCount()}縄`;
}

function renderRows() {
  els.playerRows.innerHTML = "";
  const players = getReasoningDisplayPlayers();
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
    const perspectiveGrid = getPerspectiveGridHtml(player);
    const impression = getPlayerImpression(player);
    const roleGuess = getDisplayedRoleGuess(player);
    row.innerHTML = `
      <button class="sticky-player-name" type="button" ${isGameFinished() ? "disabled" : ""} aria-label="${escapeHtml(player.name)}を編集">${escapeHtml(player.name)}</button>
      <button class="player-info" type="button" ${isGameFinished() ? "disabled" : ""}>
        <span class="player-main">
          <span class="player-name-row">
            <span class="player-name">${escapeHtml(player.name)}</span>
            ${isGameFinished() && player.trueRole ? `<span class="true-role-label ${getRoleGuessClass(player.trueRole)}">${escapeHtml(ROLE_GUESS_LABELS[player.trueRole] || player.trueRole)}</span>` : ""}
            <span class="role-guess-label ${getRoleGuessClass(roleGuess.value)} ${player.wolfTeammate || (isWolfMode() && isPriorityPlayer(player)) ? "wolf-teammate" : ""} ${player.blackTargetRank ? "black-target" : ""}">
              ${escapeHtml(roleGuess.label)}
              ${player.blackTargetRank ? `<span class="black-target-rank" aria-label="黒塗り順位 ${player.blackTargetRank}">${escapeHtml(getCircledNumber(player.blackTargetRank))}</span>` : ""}
            </span>
          </span>
        </span>
        ${perspectiveGrid}
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
      const rivalCell = event.target.closest("[data-rival-role]");
      if (rivalCell) {
        event.stopPropagation();
        if (rivalCell.dataset.rivalRole === "seer") {
          openEditDialog(rivalCell.dataset.rivalTargetId, rivalCell.dataset.rivalViewerId);
          return;
        }
        openRivalPerspectiveDialog(
          rivalCell.dataset.rivalRole,
          rivalCell.dataset.rivalViewerId,
          rivalCell.dataset.rivalTargetId,
        );
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

function getReasoningDisplayPlayers() {
  const players = getActivePlayers();
  if (state.reasoningPerspective !== "medium") return players;
  return players
    .map((player, index) => ({ player, index }))
    .sort((a, b) => {
      const roleDiff = (b.player.role === "medium") - (a.player.role === "medium");
      return roleDiff || a.index - b.index;
    })
    .map(({ player }) => player);
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
      if (isRivalPerspectiveTargetConfirmedMadman(player)) {
        return getRivalPerspectiveCellHtml(player.role, claimant, player, "madman");
      }
      const override = getRivalPerspectiveOverride(player.role, claimant.id, player.id);
      return getRivalPerspectiveCellHtml(
        player.role,
        claimant,
        player,
        override?.value || getAutomaticRivalPerspectiveValue(claimant, player, claimants),
      );
    })
    .join("");
}

function getRivalPerspectiveCellHtml(role, viewer, target, value) {
  const className = value === "werewolf" ? "role-werewolf" : value === "madman" ? "role-madman" : "role-wolfSide";
  return `<span class="seer-result-label ${className}" data-rival-role="${escapeHtml(role)}" data-rival-viewer-id="${escapeHtml(viewer.id)}" data-rival-target-id="${escapeHtml(target.id)}">${escapeHtml(ROLE_LABELS[value])}</span>`;
}

function getRivalPerspectiveOverride(role, viewerId, targetId, overrides = state.rivalPerspectiveOverrides) {
  return overrides.find(
    (override) => override.role === role && override.viewerId === viewerId && override.targetId === targetId,
  );
}

function getRivalPerspectiveOverrideKey(role, viewerId, targetId) {
  return `${role}:${viewerId}:${targetId}`;
}

function isRivalPerspectiveTargetConfirmedMadman(target) {
  return target.status === "attacked" || target.attackedWolfSideConfirmedMadman;
}

function getAutomaticRivalPerspectiveValue(viewer, target, claimants) {
  if (isRivalPerspectiveTargetConfirmedMadman(target)) return "madman";
  const threeSeerValue = getThreeSeerMediumHumanRivalValue(viewer, target, claimants);
  if (threeSeerValue) return threeSeerValue;
  if (shouldTreatWolfSideAsMadmanForSeer(viewer, target)) return "madman";
  return "wolfSide";
}

function getThreeSeerMediumHumanRivalValue(viewer, target, claimants) {
  const currentSeerClaimants = claimants.filter((claimant) => claimant.role === "seer");
  if (viewer?.role !== "seer" || target?.role !== "seer" || currentSeerClaimants.length !== 3) return "";
  const mediumHumanRival = currentSeerClaimants.find(
    (claimant) => claimant.id !== viewer.id && isMediumConfirmedHuman(claimant),
  );
  if (!mediumHumanRival) return "";
  return target.id === mediumHumanRival.id ? "madman" : "werewolf";
}

function isMediumConfirmedHuman(player) {
  return Boolean(
    player?.mediumConfirmedRoleGuess === "villager" &&
      player.confirmedRoleEvidence?.some((evidence) => evidence.role === "medium" && evidence.value === "villager"),
  );
}

function shouldTreatWolfSideAsMadmanForSeer(seer, target) {
  if (!seer || seer.role !== "seer" || !target || target.id === seer.id) return false;
  const knownWerewolfIds = getKnownWerewolfIdsForSeer(seer);
  if (knownWerewolfIds.has(target.id)) return false;
  return knownWerewolfIds.size >= (Number(state.wolfCount) || 0);
}

function getKnownWerewolfIdsForSeer(seer) {
  const ids = new Set();
  if (!seer) return ids;
  state.results
    .filter((result) => result.seerId === seer.id && result.value === "werewolf")
    .forEach((result) => ids.add(result.targetId));
  state.seerColumnOverrides
    .filter((override) => override.seerId === seer.id && override.value === "werewolf")
    .forEach((override) => ids.add(override.targetId));
  getActivePlayers().forEach((player) => {
    const mediumConfirmedWerewolf =
      player.mediumConfirmedRoleGuess === "werewolf" &&
      player.confirmedRoleEvidence?.some((evidence) => evidence.role === "medium" && evidence.value === "werewolf");
    if (mediumConfirmedWerewolf || player.role === "werewolf") ids.add(player.id);
  });
  return ids;
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
  if (villagerCount > werewolfCount) return { value: "villager", label: "市民", villagerCount, werewolfCount };
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
    .sort(
      (a, b) =>
        getBoardOrder(a.player) - getBoardOrder(b.player) ||
        getBoardTieOrder(a.player) - getBoardTieOrder(b.player) ||
        a.index - b.index,
    )
    .map(({ player }) => player);
  const inactive = indexed.filter(({ player }) => isInactiveStatus(player.status)).map(({ player }) => player);
  state.players = [...active, ...inactive];
}

function getBoardOrder(player) {
  if (isPriorityPlayer(player) && player.role && !isSelfPerspectiveSeer()) return -1;
  if (Object.hasOwn(ROLE_ORDER, player.role)) return ROLE_ORDER[player.role];
  if (isPriorityPlayer(player)) return 4;
  return 99;
}

function getBoardTieOrder(player) {
  return Object.hasOwn(ROLE_ORDER, player.role) ? getRoleClaimOrder(player) : Number.MAX_SAFE_INTEGER;
}

function getRoleOrder(player) {
  return Object.hasOwn(ROLE_ORDER, player.role) ? ROLE_ORDER[player.role] : 99;
}

function isPriorityPlayer(player) {
  return (player.name || "").trim() === PRIORITY_PLAYER_NAME;
}

function getStatusDisplay(player) {
  const label = STATUS_LABELS[player.status] || "生存";
  if (!isInactiveStatus(player.status)) return label;
  return player.statusDay ? `${player.statusDay}日目 ${label}` : label;
}

function getNextStatusDayForStatus(status) {
  backfillStatusDays();
  const exiledMax = getMaxStatusDay("exiled");
  const attackedMax = getMaxStatusDay("attacked");
  if (status === "exiled") return exiledMax + 1;
  if (status === "attacked") return Math.max(1, exiledMax + 1, attackedMax + 1);
  return 1;
}

function getMaxStatusDay(status) {
  return getActivePlayers()
    .filter((player) => player.status === status)
    .map((player) => Number(player.statusDay))
    .filter((day) => Number.isFinite(day) && day > 0)
    .reduce((max, day) => Math.max(max, day), 0);
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
  els.resultSeerHint.textContent = `${seer ? seer.name : "預言者"}視点の手入力`;
  const override = getSeerColumnOverride(editingSeerId, target.id);
  const existing = state.results.find((result) => result.seerId === editingSeerId && result.targetId === target.id);
  ensureLegacySeerResultOption(override?.value);
  els.resultValueSelect.value = override?.value || existing?.value || "";
  renderAdoptedMediumControl();
}

function ensureLegacySeerResultOption(value) {
  els.resultValueSelect.querySelector("[data-legacy-result]")?.remove();
  if (!value || Object.hasOwn(RESULT_LABELS, value)) return;
  const option = document.createElement("option");
  option.value = value;
  option.dataset.legacyResult = "true";
  option.textContent = `${SEER_COLUMN_OVERRIDE_LABELS[value] || value}（保存済み）`;
  els.resultValueSelect.appendChild(option);
}

function renderMediumResultControl(target) {
  els.mediumResultSection.hidden = true;
  els.mediumResultSelect.value = "";
}

function getMediumResultActions(actorId, targetId) {
  return state.roleActions
    .filter((action) => action.actorId === actorId && action.role === "medium" && action.targetId === targetId)
    .sort((a, b) => Number(a.day) - Number(b.day));
}

function renderMediumPerspectiveResultControl(target) {
  const mediumClaimants = getRoleClaimants("medium");
  const canShow = mediumClaimants.length > 0;
  els.mediumPerspectiveResultSection.hidden = !canShow;
  if (!canShow) {
    els.mediumPerspectiveResultList.innerHTML = "";
    return;
  }
  if (target.status !== "exiled") {
    els.mediumPerspectiveResultList.innerHTML = `<div class="empty-inline">追放された参加者だけ霊媒結果を入力できます</div>`;
    return;
  }
  els.mediumPerspectiveResultList.innerHTML = mediumClaimants
    .map((medium) => {
      const existing = getMediumResultActions(medium.id, target.id)[0];
      const value = ["human", "werewolf"].includes(existing?.result) ? existing.result : "";
      return `
        <label class="medium-perspective-result-row">
          <span>${escapeHtml(medium.name)}</span>
          <select data-medium-result-actor-id="${escapeHtml(medium.id)}" aria-label="${escapeHtml(medium.name)}の霊媒結果">
            <option value="" ${value === "" ? "selected" : ""}>未記録</option>
            <option value="human" ${value === "human" ? "selected" : ""}>市民</option>
            <option value="werewolf" ${value === "werewolf" ? "selected" : ""}>人狼</option>
          </select>
        </label>
      `;
    })
    .join("");
}

function renderAdoptedMediumControl() {
  const seer = findPlayer(editingSeerId);
  const mediumClaimants = getRoleClaimants("medium");
  const canAdopt = Boolean(seer && seer.role === "seer" && hasMultiSeerMediumPerspective());
  els.adoptedMediumSection.hidden = !canAdopt;
  if (!canAdopt) {
    els.adoptedMediumSelect.innerHTML = "";
    return;
  }
  const currentValue = getAdoptedMediumId(seer.id);
  els.adoptedMediumSelect.innerHTML = [
    `<option value="">採用霊媒なし</option>`,
    ...mediumClaimants.map((medium) => `<option value="${escapeHtml(medium.id)}">${escapeHtml(medium.name)}</option>`),
  ].join("");
  els.adoptedMediumSelect.value = mediumClaimants.some((medium) => medium.id === currentValue) ? currentValue : "";
}

function getAdoptedMediumId(seerId, links = state.seerMediumLinks) {
  return links.find((link) => link.seerId === seerId)?.mediumId || "";
}

function setAdoptedMediumForSeer(seerId, mediumId) {
  state.seerMediumLinks = state.seerMediumLinks.filter((link) => link.seerId !== seerId);
  if (mediumId) state.seerMediumLinks.push({ seerId, mediumId });
}

function hasMultiSeerMediumPerspective() {
  return getRoleClaimants("seer").length >= 2 && getRoleClaimants("medium").length >= 2;
}

function reconcileSeerMediumLinks() {
  const seerIds = new Set(getRoleClaimants("seer").map((seer) => seer.id));
  const mediumIds = new Set(getRoleClaimants("medium").map((medium) => medium.id));
  if (seerIds.size < 2 || mediumIds.size < 2) {
    state.seerMediumLinks = [];
    return;
  }
  state.seerMediumLinks = dedupeSeerMediumLinks(
    state.seerMediumLinks.filter((link) => seerIds.has(link.seerId) && mediumIds.has(link.mediumId)),
  );
}

function getAdoptedMediumResultForSeerTarget(seerId, targetId) {
  if (!hasMultiSeerMediumPerspective()) return null;
  const mediumId = getAdoptedMediumId(seerId);
  if (!mediumId) return null;
  return getMediumResultActions(mediumId, targetId).find((action) => ["human", "werewolf"].includes(action.result)) || null;
}

function getAdoptedMediumResultLabel(action) {
  if (!action || !Object.hasOwn(RESULT_LABELS, action.result)) return "";
  return `霊媒 ${RESULT_LABELS[action.result]}`;
}

function isAdoptedMediumResultContradictingSeer(seerId, targetId, seerValue) {
  if (!Object.hasOwn(RESULT_LABELS, seerValue)) return false;
  const action = getAdoptedMediumResultForSeerTarget(seerId, targetId);
  if (!action) return false;
  return action.result !== seerValue;
}

function getMediumPerspectiveForSeer(player, seer) {
  if (!player || player.role !== "medium" || !seer || !hasMultiSeerMediumPerspective()) return null;
  const adoptedMediumId = getAdoptedMediumId(seer.id);
  if (!adoptedMediumId) {
    if (player.status === "attacked") {
      return { label: `${ROLE_LABELS.medium}/${ROLE_LABELS.madman}`, className: "role-medium-madman" };
    }
    return { label: "霊媒師/狼狂", className: "role-medium-wolfSide" };
  }
  if (adoptedMediumId === player.id) {
    return { label: ROLE_LABELS.medium, className: "role-medium" };
  }
  if (player.status === "attacked") {
    return { label: ROLE_LABELS.madman, className: "role-madman" };
  }
  return { label: ROLE_LABELS.wolfSide, className: "judgement-rival" };
}

function saveIndependentMediumResult(target) {
  const medium = getLivingSingleMedium();
  if (!medium || target.status !== "exiled" || els.mediumResultSection.hidden) return;
  const existing = getMediumResultActions(medium.id, target.id);
  const value = els.mediumResultSelect.value;
  const previousValue = ["human", "werewolf"].includes(existing[0]?.result) ? existing[0].result : "";
  if (previousValue !== value) invalidateInferenceForResultChange(target, medium);
  state.roleActions = state.roleActions.filter(
    (action) => action.actorId !== medium.id || action.role !== "medium" || action.targetId !== target.id,
  );
  if (!["human", "werewolf"].includes(value)) return;
  state.roleActions.push({
    id: existing[0]?.id || crypto.randomUUID(),
    actorId: medium.id,
    role: "medium",
    day: target.status === "exiled" ? Math.max(1, Number(target.statusDay) || 1) : getCurrentLogDay(),
    targetId: target.id,
    result: value,
    note: existing[0]?.note || "",
  });
}

function saveMediumPerspectiveResults(target) {
  if (els.mediumPerspectiveResultSection.hidden || target.status !== "exiled") return;
  const selects = Array.from(els.mediumPerspectiveResultList.querySelectorAll("[data-medium-result-actor-id]"));
  selects.forEach((select) => {
    const medium = findPlayer(select.dataset.mediumResultActorId);
    if (!medium || medium.role !== "medium") return;
    const existing = getMediumResultActions(medium.id, target.id);
    const value = select.value;
    const previousValue = ["human", "werewolf"].includes(existing[0]?.result) ? existing[0].result : "";
    if (previousValue !== value) invalidateInferenceForResultChange(target, medium);
    state.roleActions = state.roleActions.filter(
      (action) => action.actorId !== medium.id || action.role !== "medium" || action.targetId !== target.id,
    );
    if (!["human", "werewolf"].includes(value)) return;
    state.roleActions.push({
      id: existing[0]?.id || crypto.randomUUID(),
      actorId: medium.id,
      role: "medium",
      day: Math.max(1, Number(target.statusDay) || 1),
      targetId: target.id,
      result: value,
      note: existing[0]?.note || "",
    });
  });
}

function renderRoleActionControls(player, roleOverride = els.roleSelect.value) {
  const role = roleOverride || "";
  const enabled = ROLE_ACTION_ROLES.has(role);
  els.roleActionSection.hidden = !enabled;
  if (!enabled) {
    els.roleActionList.innerHTML = "";
    return;
  }
  els.roleActionTitle.textContent = `${ROLE_LABELS[role]}の行動結果`;
  const targetPlayers = getRoleActionTargetPlayers(role);
  els.addRoleActionBtn.disabled = !targetPlayers.length;
  const actions = state.roleActions
    .filter((action) => action.actorId === player.id && action.role === role)
    .sort((a, b) => a.day - b.day);
  els.roleActionList.innerHTML = actions.length
    ? actions.map((action) => getRoleActionEditorRowHtml(action, targetPlayers, role)).join("")
    : `<div class="empty-inline">${role === "medium" && !targetPlayers.length ? "追放者なし" : "行動結果なし"}</div>`;
  bindRoleActionDeleteButtons(els.roleActionList);
}

function addRoleActionEditorRow() {
  const player = findPlayer(editingPlayerId);
  const role = els.roleSelect.value;
  const players = getRoleActionTargetPlayers(role);
  if (!player || !ROLE_ACTION_ROLES.has(role) || !players.length) return;
  els.roleActionList.querySelector(".empty-inline")?.remove();
  const action = {
    id: `new-${crypto.randomUUID()}`,
    actorId: player.id,
    role,
    day: getNextRoleActionDay(player.id, role),
    targetId: players[0].id,
    result: "unknown",
    note: "",
  };
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getRoleActionEditorRowHtml(action, players, role);
  els.roleActionList.appendChild(wrapper.firstElementChild);
  bindRoleActionDeleteButtons(els.roleActionList);
}

function getRoleActionEditorRowHtml(action, players, role = action.role) {
  return `
    <div class="role-action-edit" data-role-action-id="${escapeHtml(action.id)}">
      <input data-field="day" type="number" min="1" value="${Number(action.day) || 1}" aria-label="日付" />
      <select data-field="targetId" aria-label="対象">${getHistoryPlayerOptionsHtml(players, action.targetId)}</select>
      <select data-field="result" aria-label="結果">${getRoleActionResultOptionsHtml(role, action.result)}</select>
      <input data-field="note" type="text" maxlength="60" value="${escapeHtml(action.note || "")}" placeholder="メモ" aria-label="メモ" />
      <button class="danger-button" type="button" data-delete-role-action>削除</button>
    </div>
  `;
}

function bindRoleActionDeleteButtons(root) {
  root.querySelectorAll("[data-delete-role-action]").forEach((button) => {
    button.addEventListener("click", () => button.closest("[data-role-action-id]").remove());
  });
}

function saveRoleActionResults(player) {
  const previousActions = state.roleActions.filter((action) => action.actorId === player.id && action.role === player.role);
  state.roleActions = state.roleActions.filter((action) => action.actorId !== player.id || action.role !== player.role);
  if (!ROLE_ACTION_ROLES.has(player.role)) return;
  const actions = Array.from(els.roleActionList.querySelectorAll("[data-role-action-id]"))
    .map((row) =>
      normalizeRoleAction({
        id: row.dataset.roleActionId.startsWith("new-") ? crypto.randomUUID() : row.dataset.roleActionId,
        actorId: player.id,
        role: player.role,
        day: row.querySelector('[data-field="day"]').value,
        targetId: row.querySelector('[data-field="targetId"]').value,
        result: row.querySelector('[data-field="result"]').value,
        note: row.querySelector('[data-field="note"]').value,
      }),
    )
    .filter(Boolean)
    .filter((action) => action.role !== "medium" || findPlayer(action.targetId)?.status === "exiled");
  state.roleActions.push(...actions);
  if (player.role === "medium") {
    const previousByTarget = new Map(previousActions.map((action) => [action.targetId, action.result]));
    const nextByTarget = new Map(actions.map((action) => [action.targetId, action.result]));
    new Set([...previousByTarget.keys(), ...nextByTarget.keys()]).forEach((targetId) => {
      if (previousByTarget.get(targetId) !== nextByTarget.get(targetId)) {
        invalidateInferenceForResultChange(findPlayer(targetId), player);
      }
    });
  }
}

function getRoleActionTargetPlayers(role) {
  const players = getActivePlayers();
  return role === "medium" ? players.filter((player) => player.status === "exiled") : players;
}

function removeInvalidCurrentMediumResults() {
  state.roleActions = state.roleActions.filter(
    (action) => action.role !== "medium" || findPlayer(action.targetId)?.status === "exiled",
  );
}

function addClaimEvent(playerId, previousRole, role) {
  const type = !previousRole ? "claim" : !role ? "withdraw" : "change";
  state.claimEvents.push({
    id: crypto.randomUUID(),
    playerId,
    day: getCurrentLogDay(),
    previousRole,
    role,
    type,
    createdAt: new Date().toISOString(),
  });
}

function getCurrentLogDay() {
  const resultDay = state.results.map(getDivinationOrder).reduce((max, day) => Math.max(max, day), 0);
  const actionDay = state.roleActions.map((action) => Number(action.day) || 1).reduce((max, day) => Math.max(max, day), 0);
  const claimDay = state.claimEvents.map((event) => Number(event.day) || 1).reduce((max, day) => Math.max(max, day), 0);
  const voteDay = state.voteHistories.map((vote) => Number(vote.day) || 1).reduce((max, day) => Math.max(max, day), 0);
  const exiledDay = getMaxStatusDay("exiled");
  const attackedDay = getMaxStatusDay("attacked");
  const guardDay = state.roleActions
    .filter((action) => action.role === "guard")
    .map((action) => Number(action.day) || 1)
    .reduce((max, day) => Math.max(max, day), 0);
  const completedStatusDay =
    exiledDay > 0 && Math.max(attackedDay, guardDay) >= exiledDay
      ? exiledDay + 1
      : Math.max(exiledDay, attackedDay);
  return Math.max(1, resultDay, actionDay, claimDay, voteDay, completedStatusDay);
}

function getNextRoleActionDay(actorId, role) {
  const days = state.roleActions
    .filter((action) => action.actorId === actorId && action.role === role)
    .map((action) => Number(action.day) || 1);
  return days.length ? Math.max(...days) + 1 : 1;
}

function getRoleActionResultOptionsHtml(role, selectedResult = "unknown") {
  const labels = ROLE_ACTION_RESULT_LABELS[role] || ROLE_ACTION_RESULT_LABELS.medium;
  return Object.entries(labels)
    .map(([value, label]) => `<option value="${value}" ${value === selectedResult ? "selected" : ""}>${label}</option>`)
    .join("");
}

function getPerspectiveGridHtml(player) {
  return getSeerGridHtml(player);
}

function getSeerGridHtml(player) {
  const useSeerColumnsForMediumLines = player.role === "medium" && hasMultiSeerMediumPerspective();
  const rivalRoleCells = useSeerColumnsForMediumLines ? "" : getRivalRoleCellsHtml(player);
  if (rivalRoleCells) {
    const columnCount = getRoleClaimants(player.role).length;
    return `
      <span class="seer-grid" style="--seer-columns: ${columnCount}">
        ${rivalRoleCells}
      </span>
    `;
  }
  return getSeerOnlyGridHtml(player);
}

function getSeerOnlyGridHtml(player) {
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
  if (player.attackedWolfSideConfirmedMadman) {
    const columnCount = Math.max(1, seers.length);
    return Array.from({ length: columnCount }, (_, index) =>
      `<span class="seer-result-label role-madman"${seers[index] ? ` data-seer-id="${escapeHtml(seers[index].id)}"` : ""}>${ROLE_LABELS.madman}</span>`,
    ).join("");
  }
  if (!seers.length) {
    const mediumConfirmedDisplay = getMediumConfirmedDisplay(player);
    if (mediumConfirmedDisplay) {
      return `<span class="seer-result-label ${mediumConfirmedDisplay.className}">${escapeHtml(mediumConfirmedDisplay.label)}</span>`;
    }
    const roleClaim = getSeerGridRoleLabel(player);
    return roleClaim ? `<span class="seer-result-label ${getWolfSideAwareRoleClass(player)}">${escapeHtml(roleClaim)}</span>` : "";
  }
  return seers
    .map((seer) => {
      const isRivalSeer = player.id !== seer.id && seers.some((candidate) => candidate.id === player.id);
      if (isRivalSeer && isRivalPerspectiveTargetConfirmedMadman(player)) {
        return getRivalPerspectiveCellHtml("seer", seer, player, "madman");
      }
      const rivalOverride = isRivalSeer ? getRivalPerspectiveOverride("seer", seer.id, player.id) : null;
      if (rivalOverride) return getRivalPerspectiveCellHtml("seer", seer, player, rivalOverride.value);
      const override = getSeerColumnOverride(seer.id, player.id);
      if (override) return getSeerColumnOverrideHtml(override, seer, player);
      const result = state.results.find((item) => item.seerId === seer.id && item.targetId === player.id);
      if (isRivalSeer && !result) {
        return getRivalPerspectiveCellHtml("seer", seer, player, getAutomaticRivalPerspectiveValue(seer, player, seers));
      }
      if (!result && player.id === seer.id) {
        const ownDisplay = getSeerOwnPerspectiveDisplay(player, seer);
        return `<span class="seer-result-label ${ownDisplay.className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(ownDisplay.label)}</span>`;
      }
      const mediumPerspective = getMediumPerspectiveForSeer(player, seer);
      if (!result && mediumPerspective) {
        return `<span class="seer-result-label ${mediumPerspective.className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(mediumPerspective.label)}</span>`;
      }
      const mediumConfirmedDisplay = getMediumConfirmedDisplay(player);
      const guardClaim = getNonWolfGuardClaimForSeer(player, seer, result?.value || "");
      if (!result && guardClaim) {
        return `<span class="seer-result-label role-guard" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(guardClaim)}</span>`;
      }
      const adoptedMediumResult = getAdoptedMediumResultForSeerTarget(seer.id, player.id);
      if (!result && adoptedMediumResult) {
        const className = adoptedMediumResult.result === "werewolf" ? "judgement-werewolf" : "judgement-human";
        return `<span class="seer-result-label ${className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(getAdoptedMediumResultLabel(adoptedMediumResult))}</span>`;
      }
      if (!result && mediumConfirmedDisplay) {
        return `<span class="seer-result-label ${mediumConfirmedDisplay.className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(mediumConfirmedDisplay.label)}</span>`;
      }
      if (isWolfSideDisplayTarget(player)) {
        const value = getAutomaticRivalPerspectiveValue(seer, player, seers);
        const className = value === "madman" ? "role-madman" : "judgement-rival";
        const label = ROLE_LABELS[value];
        return `<span class="seer-result-label ${className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(label)}</span>`;
      }
      if (shouldDisplayMediumConfirmedWerewolf(player)) {
        return `<span class="seer-result-label judgement-werewolf" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(RESULT_LABELS.werewolf)}</span>`;
      }
      const roleClaim = player.autoConfirmedWhite ? "" : getSeerGridRoleLabel(player);
      const manualMediumGuess = getManualUnclaimedMediumGuess(player);
      const exposedHumanClaim = getExposedHumanClaimForSeer(player, seer);
      const autoVillagerClaim = guardClaim || exposedHumanClaim || roleClaim || manualMediumGuess || getAutoVillagerClaimForSeer(player, seer.id);
      if (!result) {
        const displayLabel =
          exposedHumanClaim && player.autoConfirmedWhite
            ? `${exposedHumanClaim} / ${ROLE_LABELS.confirmedWhite}`
            : autoVillagerClaim;
        return autoVillagerClaim
          ? `<span class="seer-result-label ${guardClaim ? "role-guard" : exposedHumanClaim ? "judgement-human" : manualMediumGuess ? "role-medium" : getAutoVillagerClass(player)}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(displayLabel)}</span>`
          : `<span class="seer-result-label empty" data-seer-id="${escapeHtml(seer.id)}" aria-hidden="true"></span>`;
      }
      const className = manualMediumGuess
        ? "role-medium"
        : result.value === "werewolf"
          ? "judgement-werewolf"
          : "judgement-human";
      const resultLabel = getDivinationResultDisplayLabel(result, player);
      const rivalSeerLabel = getHumanJudgedRivalSeerLabel(player, seer, result.value, resultLabel);
      const displayedRole = player.autoConfirmedWhite && result.value === "human" ? "" : roleClaim || manualMediumGuess;
      const baseLabel = rivalSeerLabel || (guardClaim ? `${guardClaim} / ${resultLabel}` : displayedRole ? `${displayedRole} / ${resultLabel}` : resultLabel);
      const label = isAdoptedMediumResultContradictingSeer(seer.id, player.id, result.value) ? `${baseLabel} / 矛盾` : baseLabel;
      return `<span class="seer-result-label ${guardClaim ? "role-guard" : rivalSeerLabel ? "role-madman" : className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(label)}</span>`;
    })
    .filter(Boolean)
    .join("");
}

function getSeerColumnOverride(seerId, targetId, overrides = state.seerColumnOverrides) {
  return overrides.find((override) => override.seerId === seerId && override.targetId === targetId);
}

function getSeerColumnOverrideHtml(override, seer, player = findPlayer(override.targetId)) {
  const result = state.results.find(
    (item) => item.seerId === override.seerId && item.targetId === override.targetId,
  );
  if (Object.hasOwn(RESULT_LABELS, override.value)) {
    const resultLabel = result
      ? getDivinationResultDisplayLabel(result, player, override.value)
      : RESULT_LABELS[override.value];
    const guardClaim = getNonWolfGuardClaimForSeer(player, seer, override.value);
    const rivalSeerLabel = getHumanJudgedRivalSeerLabel(player, seer, override.value, resultLabel);
    const baseLabel = rivalSeerLabel || (guardClaim
      ? `${guardClaim} / ${resultLabel}`
      : !result && shouldDisplayConfirmedWhiteForSeer(player, override.seerId, override.value)
        ? `${resultLabel} / ${ROLE_LABELS.confirmedWhite}`
        : resultLabel);
    const label = isAdoptedMediumResultContradictingSeer(seer.id, player?.id, override.value) ? `${baseLabel} / 矛盾` : baseLabel;
    const className = guardClaim ? "role-guard" : rivalSeerLabel ? "role-madman" : override.value === "werewolf" ? "judgement-werewolf" : "judgement-human";
    return `<span class="seer-result-label ${className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(label)}</span>`;
  }
  const className = override.value === "werewolf" ? "role-werewolf" : `role-${override.value}`;
  return `<span class="seer-result-label ${className}" data-seer-id="${escapeHtml(seer.id)}">${escapeHtml(SEER_COLUMN_OVERRIDE_LABELS[override.value])}</span>`;
}

function getDivinationResultDisplayLabel(result, player, value = result.value) {
  const resultLabel = `占い${getDivinationOrder(result)} ${RESULT_LABELS[value] || "未記録"}`;
  return shouldDisplayConfirmedWhiteForSeer(player, result.seerId, value)
    ? `${resultLabel} / ${ROLE_LABELS.confirmedWhite}`
    : resultLabel;
}

function getHumanJudgedRivalSeerLabel(player, seer, value, resultLabel) {
  if (value !== "human" || !player || !seer || player.id === seer.id) return "";
  if (!getSeers().some((claimant) => claimant.id === player.id)) return "";
  return `${resultLabel} / ${ROLE_LABELS.madman}`;
}

function getNonWolfGuardClaimForSeer(player, seer, value = "") {
  if (player?.role !== "guard" || !seer || player.id === seer.id) return "";
  if (value === "werewolf" || isMediumConfirmedWerewolf(player)) return "";
  return ROLE_LABELS.guard;
}

function isMediumConfirmedWerewolf(player) {
  return Boolean(
    player?.mediumConfirmedRoleGuess === "werewolf" &&
      player.confirmedRoleEvidence?.some((evidence) => evidence.role === "medium" && evidence.value === "werewolf"),
  );
}

function shouldDisplayConfirmedWhiteForSeer(player, seerId, value) {
  return Boolean(
    player?.autoConfirmedWhite &&
      !(player.manualRoleGuess && canOverrideAutoConfirmedWhite(player)) &&
      value === "human" &&
      findPlayer(seerId)?.role === "seer",
  );
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
  if (player.role === "werewolf") return "";
  if (RIVAL_DISPLAY_ROLES.has(player.role) && getRoleClaimants(player.role).length >= 2) return "";
  return getWolfSideAwareRoleLabel(player);
}

function getSeerOwnPerspectiveDisplay(player, seer) {
  if (
    state.reasoningPerspective === "medium" &&
    player?.role === "seer" &&
    player.id === seer?.id &&
    hasMultiSeerMediumPerspective() &&
    !getAdoptedMediumId(seer.id)
  ) {
    return { label: `${ROLE_LABELS.seer}/${ROLE_LABELS.wolfSide}`, className: "role-seer-wolfSide" };
  }
  return { label: getSeerGridRoleLabel(player), className: getWolfSideAwareRoleClass(player) };
}

function getManualUnclaimedMediumGuess(player) {
  if (getRoleClaimants("medium").length) return "";
  if (!player.manualRoleGuess || getRoleGuessDisplay(player).value !== "medium") return "";
  return ROLE_LABELS.medium;
}

function getWolfSideAwareRoleClass(player) {
  return player.role === "wolfSide" && player.status === "attacked" ? "role-madman" : getRoleClass(player);
}

function getWolfSideDisplayLabel(player) {
  return player.status === "attacked" ? ROLE_LABELS.madman : ROLE_LABELS.wolfSide;
}

function shouldDisplayMediumConfirmedWerewolf(player) {
  if (player.role !== "werewolf" || player.status !== "attacked") return false;
  if (player.mediumConfirmedRoleGuess) return false;
  if (hasSelfPerspectiveWerewolfResult(player.id)) return false;
  const mediumClaimants = getRoleClaimants("medium");
  return mediumClaimants.length === 1 && !isInactiveStatus(mediumClaimants[0].status);
}

function hasSelfPerspectiveWerewolfResult(targetId) {
  const selfPlayer = getSelfPerspectivePlayer();
  if (!selfPlayer || getRoleGuessDisplay(selfPlayer).value !== "seer") return false;
  return state.results.some(
    (result) => result.seerId === selfPlayer.id && result.targetId === targetId && result.value === "werewolf",
  );
}

function getMediumConfirmedDisplay(player) {
  const formalMediumEvidence = player.confirmedRoleEvidence?.find((evidence) => evidence.role === "medium");
  const confirmedRole = formalMediumEvidence?.value || player.mediumConfirmedRoleGuess;
  if (confirmedRole === "werewolf") {
    return { label: ROLE_LABELS.werewolf, className: "judgement-werewolf" };
  }
  if (confirmedRole === "villager") {
    return { label: ROLE_LABELS.villager, className: "judgement-human" };
  }
  return null;
}

function getAutoVillagerClaimForSeer(player, seerId) {
  if (player.role || player.status !== "attacked") return "";
  return hasDivinationResultForSeer(player.id, seerId) ? "" : ROLE_LABELS.villager;
}

function getExposedHumanClaimForSeer(player, seer) {
  if (isBrokenSeer(seer)) return "";
  if (!isFullOutsiderExposureForSeer(seer)) return "";
  if (player.id === seer.id) return "";
  if (player.role) return "";
  if (hasDivinationResultForSeer(player.id, seer.id)) return "";
  return "結果市民";
}

function isFullOutsiderExposureForSeer(seer) {
  if (!seer || isBrokenSeer(seer)) return false;
  return getOutsiderExposureIdsForSeer(seer).size >= getTotalOutsiderCount();
}

function getTotalOutsiderCount() {
  return Math.max(0, Number(state.wolfCount) || 0) + 1;
}

function getOutsiderExposureIdsForSeer(seer) {
  const ids = new Set();
  const otherSeerIds = new Set(getSeers().filter((claimant) => claimant.id !== seer.id).map((claimant) => claimant.id));
  getActivePlayers().forEach((player) => {
    const mediumConfirmedWerewolf =
      player.mediumConfirmedRoleGuess === "werewolf" &&
      player.confirmedRoleEvidence?.some((evidence) => evidence.role === "medium" && evidence.value === "werewolf");
    if (mediumConfirmedWerewolf) {
      ids.add(player.id);
      return;
    }
    if (getAdoptedMediumResultForSeerTarget(seer.id, player.id)?.result === "werewolf") {
      ids.add(player.id);
    }
    const override = getSeerColumnOverride(seer.id, player.id);
    if (override && (override.value === "human" || override.value === "confirmedWhite" || VILLAGER_SIDE_ROLES.has(override.value))) {
      return;
    }
    if (
      ["werewolf", "wolfSide", "madman"].includes(override?.value) ||
      otherSeerIds.has(player.id) ||
      ["werewolf", "wolfSide", "madman"].includes(player.role)
    ) {
      ids.add(player.id);
    }
  });
  state.results
    .filter((result) => result.seerId === seer.id && result.value === "werewolf")
    .forEach((result) => ids.add(result.targetId));
  return ids;
}

function applyConfirmedWhiteUpdates() {
  reconcileSeerMediumLinks();
  reconcileWolfTeammates();
  getActivePlayers().filter((player) => player.attackedWolfSideConfirmedMadman).forEach(setConfirmedMadman);
  reconcileStaleNonSelfSingleSeerHumanGuesses();
  reconcileSingleClaimRoleGuesses();
  reconcileConfirmedRoleEvidence();
  reconcileMediumHumanConversions();
  reconcileAttackConfirmedSeerConflicts();
  reconcileConfirmedResultSeerConflicts();
  reconcileSelfPerspectiveSeerResultConflicts();
  const currentSeerClaimants = getCurrentSeerClaimants();
  applyMediumConfirmedRoleGuesses();
  applySelfPerspectiveRivalRoleGuesses();
  reconcileConfirmedWhiteRoleGuessLocks(currentSeerClaimants);
  reconcileFullOutsiderRoleGuessVillagers();
  reconcileBlackTargets();
}

function reconcileFullOutsiderRoleGuessVillagers() {
  const players = getActivePlayers();
  const outsiderRoles = new Set(["werewolf", "wolfSide", "madman"]);
  const requiredOutsiders = (Number(state.wolfCount) || 0) + 1;
  const outsiderCount = players.filter((player) => outsiderRoles.has(getDisplayedRoleGuess(player).value)).length;
  const allOutsidersFilled = requiredOutsiders > 1 && outsiderCount >= requiredOutsiders;

  players.forEach((player) => {
    const savedGuess = getRoleGuessDisplay(player).value;
    if (player.autoFullOutsiderVillager) {
      if (player.manualRoleGuess || savedGuess !== "villager") {
        player.autoFullOutsiderVillager = false;
        return;
      }
      if (!allOutsidersFilled) {
        player.roleGuessCandidates = ["unknown"];
        player.primaryRoleGuess = "";
        player.autoFullOutsiderVillager = false;
      }
      return;
    }
    if (!allOutsidersFilled || player.manualRoleGuess || getDisplayedRoleGuess(player).value !== "unknown") return;
    player.roleGuessCandidates = ["villager"];
    player.primaryRoleGuess = "villager";
    player.manualRoleGuess = false;
    player.autoFullOutsiderVillager = true;
  });
}

function reconcileSingleClaimRoleGuesses() {
  SELF_RIVAL_GUESS_ROLES.forEach((role) => {
    const claimants = getRoleClaimants(role);
    getActivePlayers().forEach((player) => {
      const current = player.autoSingleClaimRoleGuess;
      const shouldApply = claimants.length === 1 && claimants[0].id === player.id && player.role === role;
      if (current?.role === role && !shouldApply) {
        restoreSingleClaimRoleGuess(player);
      }
      if (!shouldApply || player.manualRoleGuess || player.autoSingleClaimRoleGuess) return;
      player.autoSingleClaimRoleGuess = getRoleGuessSnapshot(player);
      player.autoSingleClaimRoleGuess.role = role;
      player.roleGuessCandidates = [role];
      player.primaryRoleGuess = role;
      player.manualRoleGuess = false;
      player.autoSelfRivalWolfSide = false;
    });
  });
}

function restoreSingleClaimRoleGuess(player) {
  const previous = player.autoSingleClaimRoleGuess;
  if (!previous) return;
  if (!player.manualRoleGuess && getRoleGuessDisplay(player).value === previous.role) {
    player.roleGuessCandidates = normalizeRoleGuessCandidates(previous.roleGuessCandidates, previous.primaryRoleGuess);
    player.primaryRoleGuess = normalizePrimaryRoleGuess(previous.primaryRoleGuess, player.roleGuessCandidates);
    player.manualRoleGuess = previous.manualRoleGuess === true;
  }
  player.autoSingleClaimRoleGuess = null;
}

function reconcileStaleNonSelfSingleSeerHumanGuesses() {
  const currentSeers = getCurrentSeerClaimants();
  if (currentSeers.length < 2) return;
  const currentSeerIds = new Set(currentSeers.map((seer) => seer.id));
  getActivePlayers().forEach((player) => {
    if (
      player.status !== "alive" ||
      player.manualRoleGuess ||
      getRoleGuessDisplay(player).value !== "villager" ||
      player.confirmedRoleEvidence?.some((evidence) => evidence.role === "medium")
    ) {
      return;
    }
    const hasNonSelfHumanResult = state.results.some((result) => {
      const seer = findPlayer(result.seerId);
      return (
        result.targetId === player.id &&
        result.value === "human" &&
        currentSeerIds.has(result.seerId) &&
        !isPriorityPlayer(seer) &&
        seer?.trueRole !== "seer"
      );
    });
    if (!hasNonSelfHumanResult || shouldBecomeConfirmedWhite(player, currentSeers)) return;
    player.roleGuessCandidates = ["unknown"];
    player.primaryRoleGuess = "";
    player.confirmedRolePreviousGuess = null;
  });
}

function reconcileConfirmedWhiteRoleGuessLocks(seers) {
  getActivePlayers().forEach((player) => {
    const shouldKeepAttackedConfirmedWhite = player.autoConfirmedWhite && player.status === "attacked";
    const shouldLockConfirmedWhite =
      player.role === "confirmedWhite" || shouldKeepAttackedConfirmedWhite || shouldBecomeConfirmedWhite(player, seers);
    if (shouldLockConfirmedWhite) {
      if (player.manualRoleGuess && canOverrideAutoConfirmedWhite(player)) return;
      setAutoConfirmedWhiteRoleGuess(player);
      player.autoConfirmedWhite = true;
      return;
    }
    if (!player.autoConfirmedWhite && !player.autoConfirmedWhitePreviousGuess) return;
    if (player.autoConfirmedWhite && player.manualRoleGuess) {
      player.autoConfirmedWhite = false;
      player.autoConfirmedWhitePreviousGuess = null;
      return;
    }
    restoreRoleGuessBeforeAutoConfirmedWhite(player);
    player.autoConfirmedWhite = false;
    const selfSeer = getSelfPerspectivePlayer();
    const selfResult = selfSeer
      ? state.results.find((result) => result.seerId === selfSeer.id && result.targetId === player.id && result.value === "human")
      : null;
    if (selfResult) applyConfirmedSeerResultRoleGuess(player, selfSeer, selfResult.value);
  });
}

function setAutoConfirmedWhiteRoleGuess(player) {
  const singleSeerPreviousGuess = getSingleSeerResultPreviousGuess(player);
  if (singleSeerPreviousGuess) {
    player.autoConfirmedWhitePreviousGuess = singleSeerPreviousGuess;
  } else if (!player.autoConfirmedWhitePreviousGuess) {
    player.autoConfirmedWhitePreviousGuess = getRoleGuessBeforeAutoConfirmedWhite(player);
  }
  player.roleGuessCandidates = ["confirmedWhite"];
  player.primaryRoleGuess = "confirmedWhite";
  player.manualRoleGuess = false;
  player.autoSelfRivalWolfSide = false;
}

function getRoleGuessBeforeAutoConfirmedWhite(player) {
  return {
    roleGuessCandidates: [...player.roleGuessCandidates],
    primaryRoleGuess: player.primaryRoleGuess,
    manualRoleGuess: player.manualRoleGuess,
  };
}

function getSingleSeerResultPreviousGuess(player) {
  if (!player.confirmedRoleEvidence?.some((evidence) => evidence.role === "seer")) return null;
  const previous = player.confirmedRolePreviousGuess;
  if (!previous) return null;
  return {
    roleGuessCandidates: [...previous.roleGuessCandidates],
    primaryRoleGuess: previous.primaryRoleGuess,
    manualRoleGuess: previous.manualRoleGuess,
  };
}

function restoreRoleGuessBeforeAutoConfirmedWhite(player) {
  const previous = player.autoConfirmedWhitePreviousGuess;
  if (previous) {
    player.roleGuessCandidates = normalizeRoleGuessCandidates(previous.roleGuessCandidates, previous.primaryRoleGuess);
    player.primaryRoleGuess = normalizePrimaryRoleGuess(previous.primaryRoleGuess, player.roleGuessCandidates);
    player.manualRoleGuess = previous.manualRoleGuess === true;
  } else {
    player.roleGuessCandidates = ["unknown"];
    player.primaryRoleGuess = "";
    player.manualRoleGuess = false;
  }
  player.autoConfirmedWhitePreviousGuess = null;
}

function applyMediumConfirmedRoleGuesses() {
  getActivePlayers().forEach((player) => {
    if (player.mediumConfirmedRoleGuess === "werewolf") setRoleGuess(player, "werewolf", { confirmed: true });
  });
}

function reconcileConfirmedRoleEvidence() {
  const evidenceByTarget = new Map();
  const addEvidence = (targetId, evidence) => {
    const entries = evidenceByTarget.get(targetId) || [];
    entries.push(evidence);
    evidenceByTarget.set(targetId, entries);
  };
  ["seer", "medium", "guard", "hunter"].forEach((role) => {
    const claimants = getRoleClaimants(role);
    if (claimants.length !== 1) return;
    const claimant = claimants[0];
    const sourceId = `claim:${role}:${claimant.id}`;
    const wasEstablished = claimant.confirmedRoleEvidence?.some((evidence) => evidence.sourceId === sourceId);
    if (role !== "medium" || claimant.status === "alive" || wasEstablished) {
      addEvidence(claimant.id, {
        actorId: claimant.id,
        role: "claim",
        sourceId,
        value: role,
        persistedAfterDeath: role !== "medium" || claimant.status !== "alive" || wasEstablished,
      });
    }
  });
  const singleSeer = getRoleClaimants("seer").length === 1 ? getRoleClaimants("seer")[0] : null;
  if (singleSeer && isConfirmedSeerForResults(singleSeer)) {
    state.results
      .filter((result) => result.seerId === singleSeer.id)
      .forEach((result) => addEvidence(result.targetId, {
        actorId: singleSeer.id,
        role: "seer",
        sourceId: result.id,
        value: result.value === "werewolf" ? "werewolf" : "villager",
        persistedAfterDeath: true,
      }));
  }
  const mediumClaimants = getRoleClaimants("medium");
  if (mediumClaimants.length === 1) {
    const medium = mediumClaimants[0];
    state.roleActions
      .filter((action) => action.actorId === medium.id && action.role === "medium" && ["human", "werewolf"].includes(action.result))
      .forEach((action) => {
        const wasEstablished = getActivePlayers().some((player) =>
          player.confirmedRoleEvidence?.some((evidence) => evidence.sourceId === action.id),
        );
        if (medium.status === "alive" || wasEstablished) {
          addEvidence(action.targetId, {
            actorId: medium.id,
            role: "medium",
            sourceId: action.id,
            value: action.result === "werewolf" ? "werewolf" : "villager",
            persistedAfterDeath: medium.status !== "alive" || wasEstablished,
          });
        }
      });
  }
  getActivePlayers().forEach((player) => {
    const entries = evidenceByTarget.get(player.id) || [];
    const preferred =
      entries.find((entry) => entry.role === "medium") ||
      entries.find((entry) => entry.role === "claim") ||
      entries[0];
    const validEntries = preferred ? entries.filter((entry) => entry.value === preferred.value) : [];
    if (!preferred) {
      if (isStaleSingleClaimRolePreviousGuess(player)) {
        player.confirmedRolePreviousGuess = {
          roleGuessCandidates: ["unknown"],
          primaryRoleGuess: "",
          manualRoleGuess: false,
        };
      }
      if (player.confirmedRolePreviousGuess) restoreRoleGuessBeforeConfirmation(player);
      player.confirmedRoleEvidence = [];
      player.mediumConfirmedRoleGuess = "";
      return;
    }
    const usesLimitedMediumHumanConversion = preferred.role === "medium" && preferred.value === "villager";
    if (!player.confirmedRolePreviousGuess && !usesLimitedMediumHumanConversion) {
      player.confirmedRolePreviousGuess = getPreviousGuessBeforeConfirmedEvidence(player, preferred);
    } else if (isLegacySingleSeerPreviousGuess(player, preferred)) {
      player.confirmedRolePreviousGuess = {
        roleGuessCandidates: ["unknown"],
        primaryRoleGuess: "",
        manualRoleGuess: false,
      };
    }
    player.confirmedRoleEvidence = validEntries;
    player.mediumConfirmedRoleGuess = ["villager", "werewolf"].includes(preferred.value) ? preferred.value : "";
    if (preferred.role === "medium" && preferred.value === "werewolf" && !player.manualRoleGuess) {
      player.roleGuessCandidates = [preferred.value];
      player.primaryRoleGuess = preferred.value;
    } else if (!player.manualRoleGuess && preferred.role !== "claim" && !usesLimitedMediumHumanConversion) {
      setRoleGuess(player, preferred.value, { confirmed: true });
    }
  });
}

function isLegacySingleSeerPreviousGuess(player, preferred) {
  const previous = player.confirmedRolePreviousGuess;
  if (!previous || preferred.role !== "seer" || previous.manualRoleGuess) return false;
  return (
    player.status === "alive" &&
    normalizePrimaryRoleGuess(previous.primaryRoleGuess, previous.roleGuessCandidates) === preferred.value
  );
}

function getPreviousGuessBeforeConfirmedEvidence(player, preferred) {
  if (preferred.role === "claim" && player.autoSingleClaimRoleGuess?.role === preferred.value) {
    const previous = player.autoSingleClaimRoleGuess;
    return {
      roleGuessCandidates: [...previous.roleGuessCandidates],
      primaryRoleGuess: previous.primaryRoleGuess,
      manualRoleGuess: previous.manualRoleGuess === true,
    };
  }
  const currentValue = getRoleGuessDisplay(player).value;
  const isLegacySingleSeerAutoGuess =
    preferred.role === "seer" &&
    player.status === "alive" &&
    !player.manualRoleGuess &&
    currentValue === preferred.value;
  if (isLegacySingleSeerAutoGuess) {
    return {
      roleGuessCandidates: ["unknown"],
      primaryRoleGuess: "",
      manualRoleGuess: false,
    };
  }
  return {
    roleGuessCandidates: [...player.roleGuessCandidates],
    primaryRoleGuess: player.primaryRoleGuess,
    manualRoleGuess: player.manualRoleGuess,
  };
}

function isStaleSingleClaimRolePreviousGuess(player) {
  const previous = player.confirmedRolePreviousGuess;
  if (!previous || previous.manualRoleGuess) return false;
  const previousRole = normalizePrimaryRoleGuess(previous.primaryRoleGuess, previous.roleGuessCandidates);
  if (!SELF_RIVAL_GUESS_ROLES.has(previousRole)) return false;
  return player.confirmedRoleEvidence?.some(
    (evidence) =>
      evidence.role === "claim" &&
      evidence.value === previousRole &&
      evidence.sourceId === `claim:${previousRole}:${player.id}`,
  );
}

function restoreRoleGuessBeforeConfirmation(player) {
  const previous = player.confirmedRolePreviousGuess;
  if (!previous) return;
  if (player.mediumHumanConversion?.guess) {
    player.confirmedRolePreviousGuess = null;
    return;
  }
  if (!player.manualRoleGuess) {
    player.roleGuessCandidates = normalizeRoleGuessCandidates(previous.roleGuessCandidates, previous.primaryRoleGuess);
    player.primaryRoleGuess = normalizePrimaryRoleGuess(previous.primaryRoleGuess, player.roleGuessCandidates);
    player.manualRoleGuess = previous.manualRoleGuess === true;
  }
  player.confirmedRolePreviousGuess = null;
}

function reconcileMediumHumanConversions() {
  getActivePlayers().forEach((player) => {
    const hasMediumHuman = player.confirmedRoleEvidence?.some(
      (evidence) => evidence.role === "medium" && evidence.value === "villager",
    );
    const conversion = player.mediumHumanConversion || {};
    if (!hasMediumHuman) {
      restoreMediumHumanConvertedField(player, conversion.role, "role");
      restoreMediumHumanConvertedField(player, conversion.guess, "guess");
      player.mediumHumanConversion = null;
      return;
    }
    const roleConversion = reconcileMediumHumanConvertedField(player, conversion.role, "role");
    const guessConversion = reconcileMediumHumanConvertedField(player, conversion.guess, "guess");
    player.mediumHumanConversion = roleConversion || guessConversion ? { role: roleConversion, guess: guessConversion } : null;
  });
}

function reconcileMediumHumanConvertedField(player, snapshot, field) {
  const current = field === "role" ? player.role : getRoleGuessDisplay(player).value;
  if (snapshot) {
    if (current !== snapshot.appliedValue) return { ...snapshot, manuallyChanged: true };
    return snapshot;
  }
  if (!["werewolf", "wolfSide"].includes(current)) return null;
  const appliedValue = current === "wolfSide" ? "madman" : "villager";
  const next = {
    previousValue: current,
    previousManual: field === "role" ? player.manualRoleOverride : player.manualRoleGuess,
    appliedValue,
    manuallyChanged: false,
  };
  if (field === "role") {
    player.role = appliedValue;
    player.manualRoleOverride = false;
    player.roleClaimOrder = getNextRoleClaimOrder();
  } else {
    player.roleGuessCandidates = [appliedValue];
    player.primaryRoleGuess = appliedValue;
    player.manualRoleGuess = false;
    player.autoSelfRivalWolfSide = false;
  }
  return next;
}

function restoreMediumHumanConvertedField(player, snapshot, field) {
  if (!snapshot || snapshot.manuallyChanged) return;
  const current = field === "role" ? player.role : getRoleGuessDisplay(player).value;
  if (current !== snapshot.appliedValue) return;
  if (field === "role") {
    player.role = snapshot.previousValue || "";
    player.manualRoleOverride = snapshot.previousManual === true;
    player.roleClaimOrder = player.role ? getNextRoleClaimOrder() : null;
  } else {
    player.roleGuessCandidates = snapshot.previousValue && snapshot.previousValue !== "unknown" ? [snapshot.previousValue] : ["unknown"];
    player.primaryRoleGuess = snapshot.previousValue === "unknown" ? "" : snapshot.previousValue || "";
    player.manualRoleGuess = snapshot.previousManual === true;
  }
}

function reconcileConfirmedResultSeerConflicts() {
  const conflictingSeerIds = new Set();
  const mediumHumanConflictingSeerIds = new Set();
  getActivePlayers().forEach((player) => {
    if (!player.mediumConflictBroken) return;
    player.mediumConflictBroken = false;
    player.confirmedResultConflictBroken = true;
  });
  state.results.forEach((result) => {
    const target = findPlayer(result.targetId);
    if (!target?.confirmedRoleEvidence?.length || !target.mediumConfirmedRoleGuess) return;
    const confirmedResult = target.mediumConfirmedRoleGuess === "werewolf" ? "werewolf" : "human";
    const isSourceResult = target.confirmedRoleEvidence.some((evidence) => evidence.sourceId === result.id);
    if (result.value !== confirmedResult && !isSourceResult) {
      conflictingSeerIds.add(result.seerId);
      if (
        result.value === "werewolf" &&
        target.confirmedRoleEvidence.some((evidence) => evidence.role === "medium" && evidence.value === "villager")
      ) {
        mediumHumanConflictingSeerIds.add(result.seerId);
      }
    }
  });
  getActivePlayers().forEach((player) => {
    if (player.mediumHumanBrokenPrevious && !mediumHumanConflictingSeerIds.has(player.id)) {
      restoreMediumHumanBrokenSeer(player);
    }
    if (player.confirmedResultConflictBroken && !conflictingSeerIds.has(player.id)) {
      player.confirmedResultConflictBroken = false;
      restoreBrokenSeerIfResolved(player);
    }
  });
  conflictingSeerIds.forEach((seerId) => {
    const seer = findPlayer(seerId);
    if (!seer || (!seer.confirmedResultConflictBroken && !getSeers().some((item) => item.id === seer.id))) return;
    if (mediumHumanConflictingSeerIds.has(seerId)) {
      forceMediumHumanBrokenSeer(seer);
    } else {
      markSeerBroken(seer, "confirmedResult");
    }
  });
}

function reconcileSelfPerspectiveSeerResultConflicts() {
  const selfSeer = getSelfPerspectivePlayer();
  const conflictingSeerIds = new Set();

  if (isSelfPerspectiveSeer()) {
    const selfResultsByTargetId = new Map(
      state.results
        .filter((result) => result.seerId === selfSeer.id && ["human", "werewolf"].includes(result.value))
        .map((result) => [result.targetId, result.value]),
    );
    state.results.forEach((result) => {
      if (result.seerId === selfSeer.id) return;
      const selfResult = selfResultsByTargetId.get(result.targetId);
      if (selfResult && result.value !== selfResult) conflictingSeerIds.add(result.seerId);
    });
  }

  getActivePlayers().forEach((player) => {
    if (player.selfPerspectiveResultConflictBroken && !conflictingSeerIds.has(player.id)) {
      player.selfPerspectiveResultConflictBroken = false;
      restoreBrokenSeerIfResolved(player);
    }
  });
  conflictingSeerIds.forEach((seerId) => {
    const seer = findPlayer(seerId);
    if (seer) markSeerBroken(seer, "selfResult");
  });
}

function forceMediumHumanBrokenSeer(seer) {
  if (!seer || seer.attackedWolfSideConfirmedMadman) return;
  if (!seer.mediumHumanBrokenPrevious) {
    seer.mediumHumanBrokenPrevious = {
      role: { previousValue: seer.role, previousManual: seer.manualRoleOverride, appliedValue: "wolfSide", manuallyChanged: false },
      guess: {
        previousValue: getRoleGuessDisplay(seer).value,
        previousManual: seer.manualRoleGuess,
        appliedValue: "wolfSide",
        manuallyChanged: false,
      },
    };
  } else {
    if (seer.role !== "wolfSide") seer.mediumHumanBrokenPrevious.role.manuallyChanged = true;
    if (getRoleGuessDisplay(seer).value !== "wolfSide") seer.mediumHumanBrokenPrevious.guess.manuallyChanged = true;
  }
  if (!seer.mediumHumanBrokenPrevious.role.manuallyChanged) {
    seer.role = "wolfSide";
    seer.manualRoleOverride = false;
  }
  if (!seer.mediumHumanBrokenPrevious.guess.manuallyChanged) {
    seer.roleGuessCandidates = ["wolfSide"];
    seer.primaryRoleGuess = "wolfSide";
    seer.manualRoleGuess = false;
    seer.autoSelfRivalWolfSide = false;
  }
  seer.confirmedResultConflictBroken = true;
}

function restoreMediumHumanBrokenSeer(seer) {
  const previous = seer.mediumHumanBrokenPrevious;
  if (!previous) return;
  if (!previous.role.manuallyChanged && seer.role === previous.role.appliedValue) {
    seer.role = previous.role.previousValue || "";
    seer.manualRoleOverride = previous.role.previousManual === true;
  }
  if (!previous.guess.manuallyChanged && getRoleGuessDisplay(seer).value === previous.guess.appliedValue) {
    seer.roleGuessCandidates =
      previous.guess.previousValue && previous.guess.previousValue !== "unknown" ? [previous.guess.previousValue] : ["unknown"];
    seer.primaryRoleGuess = previous.guess.previousValue === "unknown" ? "" : previous.guess.previousValue || "";
    seer.manualRoleGuess = previous.guess.previousManual === true;
  }
  seer.mediumHumanBrokenPrevious = null;
}

function reconcileAttackConfirmedSeerConflicts() {
  const conflictingSeerIds = new Set(
    state.results
      .filter((result) => result.value === "werewolf" && findPlayer(result.targetId)?.status === "attacked")
      .map((result) => result.seerId),
  );
  getActivePlayers().forEach((player) => {
    if (player.attackConflictBroken && !conflictingSeerIds.has(player.id)) {
      player.attackConflictBroken = false;
      restoreBrokenSeerIfResolved(player);
    }
  });
  conflictingSeerIds.forEach((seerId) => {
    const seer = findPlayer(seerId);
    if (!seer || (!seer.attackConflictBroken && !getSeers().some((item) => item.id === seer.id))) return;
    markSeerBroken(seer, "attack");
  });
}

function markSeerBroken(seer, reason) {
  if (!seer) return;
  if (seer.attackedWolfSideConfirmedMadman) return setConfirmedMadman(seer);
  const wasBroken = isBrokenSeer(seer);
  if (!seer.manualRoleOverride) seer.role = "wolfSide";
  if (reason === "medium") seer.mediumConflictBroken = true;
  if (reason === "confirmedResult") seer.confirmedResultConflictBroken = true;
  if (reason === "selfResult") seer.selfPerspectiveResultConflictBroken = true;
  if (reason === "attack") seer.attackConflictBroken = true;
  if (!wasBroken && !seer.manualRoleGuess) setRoleGuess(seer, "wolfSide", { confirmed: true });
}

function restoreBrokenSeerIfResolved(seer) {
  if (!seer || isBrokenSeer(seer)) return;
  if (!seer.manualRoleOverride && seer.role === "wolfSide") seer.role = "seer";
  if (!seer.manualRoleGuess && getRoleGuessDisplay(seer).value === "wolfSide") {
    setRoleGuess(seer, "seer", { confirmed: true });
  }
}

function isBrokenSeer(player) {
  return Boolean(
    player?.mediumConflictBroken ||
      player?.confirmedResultConflictBroken ||
      player?.selfPerspectiveResultConflictBroken ||
      player?.attackConflictBroken,
  );
}

function applySingleClaimRoleGuess(player) {
  if (player.confirmedRoleEvidence?.length) return;
  if (!player.role || !Object.hasOwn(ROLE_GUESS_LABELS, player.role)) return;
  if (getRoleClaimants(player.role).length !== 1) return;
  setRoleGuess(player, player.role);
}

function applySelfClaimRoleGuess() {
  const selfPlayer = getSelfPerspectivePlayer();
  if (!selfPlayer?.role || !Object.hasOwn(ROLE_GUESS_LABELS, selfPlayer.role)) return;
  setRoleGuess(selfPlayer, selfPlayer.role, { confirmed: true });
}

function applyConfirmedRoleResultGuesses() {
  const selfPlayer = getSelfPerspectivePlayer();
  state.results
    .filter((result) => result.seerId !== selfPlayer?.id)
    .forEach((result) => applyConfirmedSeerResultRoleGuess(findPlayer(result.targetId), findPlayer(result.seerId), result.value));
  state.roleActions
    .filter((action) => action.role === "medium" && action.actorId !== selfPlayer?.id)
    .forEach((action) => applyConfirmedMediumResultRoleGuess(findPlayer(action.targetId), findPlayer(action.actorId), action.result));
  state.results
    .filter((result) => result.seerId === selfPlayer?.id)
    .forEach((result) => applyConfirmedSeerResultRoleGuess(findPlayer(result.targetId), selfPlayer, result.value));
  state.roleActions
    .filter((action) => action.role === "medium" && action.actorId === selfPlayer?.id)
    .forEach((action) => applyConfirmedMediumResultRoleGuess(findPlayer(action.targetId), selfPlayer, action.result));
}

function applyConfirmedSeerResultRoleGuess(target, seer, resultValue) {
  if (!target || !isConfirmedRoleActor(seer, "seer")) return;
  applyHumanOrWerewolfRoleGuess(target, resultValue);
}

function applyConfirmedMediumResultRoleGuess(target, medium, resultValue) {
  if (!target || !isConfirmedRoleActor(medium, "medium")) return;
  applyHumanOrWerewolfRoleGuess(target, resultValue);
}

function applyHumanOrWerewolfRoleGuess(target, resultValue) {
  const roleGuess = resultValue === "werewolf" ? "werewolf" : resultValue === "human" ? "villager" : "";
  if (roleGuess) setRoleGuess(target, roleGuess, { confirmed: true });
}

function isConfirmedRoleActor(player, role) {
  if (!player) return false;
  if (role === "seer") return isConfirmedSeerForResults(player);
  if (isPriorityPlayer(player) && (player.role === role || getRoleGuessDisplay(player).value === role)) return true;
  if (player.trueRole === role) return true;
  const claimants = getRoleClaimants(role);
  return claimants.length === 1 && claimants[0].id === player.id;
}

function applySelfPerspectiveRivalRoleGuesses() {
  const selfPlayer = getSelfPerspectivePlayer();
  const selfRole = selfPlayer ? getRoleGuessDisplay(selfPlayer).value : "";
  const roleClaimants = SELF_RIVAL_GUESS_ROLES.has(selfRole) ? getRoleClaimants(selfRole) : [];
  const rivals = roleClaimants.filter((player) => player.id !== selfPlayer?.id);
  const rivalIds = new Set(rivals.map((player) => player.id));
  const mediumHumanRival =
    selfRole === "seer" && roleClaimants.length === 3
      ? rivals.find((player) => isMediumConfirmedHuman(player)) || null
      : null;
  getActivePlayers().forEach((player) => {
    const remainsRival = rivalIds.has(player.id);
    if (player.autoSelfRivalWolfSide && !remainsRival) {
      if (!player.manualRoleGuess && ["wolfSide", "madman", "werewolf"].includes(getRoleGuessDisplay(player).value)) {
        player.roleGuessCandidates = ["unknown"];
        player.primaryRoleGuess = "";
      }
      player.autoSelfRivalWolfSide = false;
      return;
    }
    if (!remainsRival || player.manualRoleGuess || player.attackedWolfSideConfirmedMadman) return;
    const inferredRole = mediumHumanRival
      ? player.id === mediumHumanRival.id
        ? "madman"
        : "werewolf"
      : "wolfSide";
    player.roleGuessCandidates = [inferredRole];
    player.primaryRoleGuess = inferredRole;
    player.autoSelfRivalWolfSide = true;
  });
}

function getSelfPerspectivePlayer() {
  return getActivePlayers().find(isPriorityPlayer) || state.players.find(isPriorityPlayer) || null;
}

function isWolfMode() {
  return Boolean(state.wolfModeActive && getActivePlayers().some(isPriorityPlayer));
}

function isSelfPerspectiveSeer() {
  const selfPlayer = getSelfPerspectivePlayer();
  return Boolean(selfPlayer && getRoleGuessDisplay(selfPlayer).value === "seer");
}

function setRoleGuess(player, role, { confirmed = false } = {}) {
  if (!Object.hasOwn(ROLE_GUESS_LABELS, role)) return false;
  if (player.manualRoleGuess) return false;
  player.roleGuessCandidates = [role];
  player.primaryRoleGuess = role === "unknown" ? "" : role;
  return true;
}

function shouldBecomeConfirmedWhite(player, seers = getCurrentSeerClaimants()) {
  const effectiveSeers = getConfirmedWhiteSeers(seers);
  if (player.status !== "alive") return false;
  if (effectiveSeers.some((seer) => seer.id === player.id)) return false;
  if (hasSelfPerspectiveWerewolfResult(player.id)) return false;
  return (
    canSeersEstablishConfirmedWhite(effectiveSeers) &&
    effectiveSeers.every((seer) => isHumanViewForConfirmedWhite(player, seer))
  );
}

function getConfirmedWhiteSeers(seers = getCurrentSeerClaimants()) {
  const effectiveSeers = [...seers];
  const selfSeer = getSelfPerspectivePlayer();
  if (isSelfPerspectiveSeer() && selfSeer && !effectiveSeers.some((seer) => seer.id === selfSeer.id)) {
    effectiveSeers.push(selfSeer);
  }
  return effectiveSeers;
}

function canOverrideAutoConfirmedWhite(player) {
  const selfSeer = getSelfPerspectivePlayer();
  if (!player?.autoConfirmedWhite || !selfSeer || !isSelfPerspectiveSeer()) return false;
  if (isHumanViewForConfirmedWhite(player, selfSeer)) return false;
  return state.results.some((result) => {
    const seer = findPlayer(result.seerId);
    return (
      result.targetId === player.id &&
      result.seerId !== selfSeer.id &&
      result.value === "human" &&
      seer?.role === "seer"
    );
  });
}

function canSeersEstablishConfirmedWhite(seers = getCurrentSeerClaimants()) {
  return seers.length > 0 && !(seers.length === 1 && isPriorityPlayer(seers[0]));
}

function getCurrentSeerClaimants() {
  return getRoleClaimants("seer");
}

function hasRecordedHumanResultForSeer(playerId, seerId) {
  const override = getSeerColumnOverride(seerId, playerId);
  if (override) return override.value === "human";
  return state.results.some((result) => result.seerId === seerId && result.targetId === playerId && result.value === "human");
}

function isHumanViewForConfirmedWhite(player, seer) {
  return hasRecordedHumanResultForSeer(player.id, seer.id) || Boolean(getExposedHumanClaimForSeer(player, seer));
}

function isConfirmedSeerForResults(player) {
  if (!player) return false;
  if (player.trueRole === "seer") return true;
  if (isPriorityPlayer(player) && getRoleGuessDisplay(player).value === "seer") return true;
  const claimants = getRoleClaimants("seer");
  const hasAttackedPlayer = getActivePlayers().some((candidate) => candidate.status === "attacked");
  return !hasAttackedPlayer && claimants.length === 1 && claimants[0].id === player.id;
}

function isHumanOrExposedHumanForSeer(player, seer) {
  const override = getSeerColumnOverride(seer.id, player.id);
  if (override) {
    return override.value === "human" || override.value === "confirmedWhite" || VILLAGER_SIDE_ROLES.has(override.value);
  }
  const result = state.results.find((item) => item.seerId === seer.id && item.targetId === player.id);
  if (result) return result.value === "human";
  return Boolean(getExposedHumanClaimForSeer(player, seer));
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
  const seerIds = new Set([
    ...state.results.map((result) => result.seerId),
    ...state.seerColumnOverrides.map((override) => override.seerId),
  ]);
  return getActivePlayers()
    .filter((player) => player.role === "seer" || seerIds.has(player.id))
    .slice()
    .sort((a, b) => getSeerColumnPriority(a) - getSeerColumnPriority(b) || getRoleClaimOrder(a) - getRoleClaimOrder(b));
}

function getSeerColumnPriority(player) {
  if (isGameFinished() && player.trueRole === "seer") return 0;
  const guessedSeer = getRoleGuessDisplay(player).value === "seer";
  if (guessedSeer && isPriorityPlayer(player)) return 1;
  if (guessedSeer) return 2;
  return 3;
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
  return (
    state.results.some((result) => result.targetId === playerId && visibleSeerIds.has(result.seerId)) ||
    state.seerColumnOverrides.some((override) => override.targetId === playerId && visibleSeerIds.has(override.seerId))
  );
}

function hasDivinationResultForSeer(playerId, seerId) {
  return (
    state.results.some((result) => result.targetId === playerId && result.seerId === seerId) ||
    Boolean(getSeerColumnOverride(seerId, playerId))
  );
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
  if (!history || !confirm(`${getHistoryDisplayName(history)} 第${history.gameNumber}試合の履歴を削除しますか？`)) return;
  state.gameHistories = state.gameHistories.filter((item) => item.id !== history.id);
  selectedHistoryId = "";
  selectedHistoryIds.delete(history.id);
  renderAndStore();
  toast("履歴を削除しました");
}

function toggleHistorySelection(historyId, checked) {
  if (checked) {
    selectedHistoryIds.add(historyId);
  } else {
    selectedHistoryIds.delete(historyId);
  }
  renderHistorySelectionControls();
}

function selectAllHistories() {
  selectedHistoryIds = new Set(state.gameHistories.map((history) => history.id));
  render();
}

function clearHistorySelection() {
  selectedHistoryIds.clear();
  render();
}

function renderHistorySelectionControls() {
  const count = selectedHistoryIds.size;
  els.selectAllHistoriesBtn.disabled = state.gameHistories.length === 0 || count === state.gameHistories.length;
  els.clearHistorySelectionBtn.disabled = count === 0;
  els.deleteSelectedHistoriesBtn.disabled = count === 0;
  els.deleteSelectedHistoriesBtn.textContent = count ? `選択削除 ${count}` : "選択削除";
}

function openBulkDeleteHistoryDialog(scope) {
  const histories = getBulkDeleteTargetHistories(scope);
  if (!histories.length) return toast("削除できる履歴がありません");
  bulkDeleteHistoryScope = scope;
  const tournamentName = getSelectedTournament()?.name || "選択中の大会";
  els.bulkDeleteHistoryTitle.textContent =
    scope === "selected"
      ? "選択した履歴を削除"
      : scope === "tournament"
        ? `${tournamentName}の履歴を削除`
        : "すべての履歴を削除";
  els.bulkDeleteHistoryMessage.innerHTML = `
    <strong>${histories.length}試合分の履歴を削除します。</strong>
    <span>削除した履歴は復元できません。現在の盤面、大会設定、参加者名簿は残ります。</span>
  `;
  els.bulkDeleteHistoryDialog.showModal();
}

function closeBulkDeleteHistoryDialog() {
  bulkDeleteHistoryScope = "";
  els.bulkDeleteHistoryDialog.close();
}

function deleteHistoriesInScope() {
  const selectedTournamentId = state.selectedTournamentId;
  const targetHistories = getBulkDeleteTargetHistories(bulkDeleteHistoryScope);
  const targetIds = new Set(targetHistories.map((history) => history.id));
  const targetCount = targetIds.size;
  if (!targetCount) return closeBulkDeleteHistoryDialog();
  state.gameHistories =
    bulkDeleteHistoryScope === "all"
      ? []
      : state.gameHistories.filter((history) =>
          bulkDeleteHistoryScope === "tournament" ? history.selectedTournamentId !== selectedTournamentId : !targetIds.has(history.id),
        );
  if (selectedHistoryId && targetIds.has(selectedHistoryId)) selectedHistoryId = "";
  selectedHistoryIds.clear();
  closeBulkDeleteHistoryDialog();
  renderAndStore();
  toast(`${targetCount}試合分の履歴を削除しました`);
}

function getBulkDeleteTargetHistories(scope) {
  if (scope === "selected") return state.gameHistories.filter((history) => selectedHistoryIds.has(history.id));
  if (scope === "tournament") return getHistoriesForTournament(state.selectedTournamentId);
  return state.gameHistories;
}

function getHistoriesForTournament(tournamentId) {
  return state.gameHistories.filter((history) => history.selectedTournamentId === tournamentId);
}

function openHistoryEditDialog() {
  const history = getSelectedHistory();
  if (!history) return;
  editingHistoryId = history.id;
  els.historyEditTitle.textContent = `${getHistoryDisplayName(history)} 第${history.gameNumber}試合`;
  els.historyEventNameInput.value = history.eventName || "";
  els.historySeasonNumberInput.value = history.seasonNumber || "";
  els.historyEditionNumberInput.value = history.editionNumber || "";
  els.historyEventDateInput.value = history.eventDate || "";
  els.historyGameNumberInput.value = String(history.gameNumber || 1);
  els.historyWinnerInput.value = normalizeCitizenText(history.winner);
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
    ? sortResultsForEditDisplay(history.results)
        .map((result) => {
          const seer = history.players.find((player) => player.id === result.seerId);
          const target = history.players.find((player) => player.id === result.targetId);
          return `
            <div class="history-result-edit" data-result-id="${escapeHtml(result.id)}">
              <select data-field="seerId" aria-label="預言者">${getHistoryPlayerOptionsHtml(activePlayers, seer?.id)}</select>
              <select data-field="targetId" aria-label="占い対象">${getHistoryPlayerOptionsHtml(activePlayers, target?.id)}</select>
              <input data-field="order" type="number" min="1" value="${getDivinationOrder(result)}" aria-label="占い順" />
              <select data-field="value" aria-label="占い結果">
                <option value="human" ${result.value === "human" ? "selected" : ""}>市民</option>
                <option value="werewolf" ${result.value === "werewolf" ? "selected" : ""}>人狼</option>
              </select>
              <button class="danger-button" type="button" data-delete-result>削除</button>
            </div>
          `;
        })
        .join("")
    : '<div class="empty-inline">占い結果なし</div>';
  els.historySeerColumnOverrideEditor.innerHTML = history.seerColumnOverrides?.length
    ? history.seerColumnOverrides
        .map((override) => getHistorySeerColumnOverrideEditorRowHtml(override, activePlayers))
        .join("")
    : '<div class="empty-inline">列の手入力なし</div>';
  els.historyRivalPerspectiveOverrideEditor.innerHTML = history.rivalPerspectiveOverrides?.length
    ? history.rivalPerspectiveOverrides
        .map((override) => getHistoryRivalPerspectiveOverrideEditorRowHtml(override, activePlayers))
        .join("")
    : '<div class="empty-inline">対抗視点欄の手入力なし</div>';
  els.historyClaimEventEditor.innerHTML = history.claimEvents?.length
    ? sortClaimEventsForEditDisplay(history.claimEvents).map((event) => getHistoryClaimEventEditorRowHtml(event, activePlayers)).join("")
    : '<div class="empty-inline">CO履歴なし</div>';
  els.historyVoteEditor.innerHTML = history.voteHistories?.length
    ? sortVotesForEditDisplay(history.voteHistories).map((vote) => getVoteEditorRowHtml(vote, activePlayers)).join("")
    : '<div class="empty-inline">投票履歴なし</div>';
  els.historyRoleActionEditor.innerHTML = history.roleActions?.length
    ? sortRoleActionsForEditDisplay(history.roleActions)
        .map((action) => getHistoryRoleActionEditorRowHtml(action, activePlayers))
        .join("")
    : '<div class="empty-inline">役職行動結果なし</div>';
  bindHistoryResultDeleteButtons();
  bindHistorySeerColumnOverrideDeleteButtons();
  bindHistoryRivalPerspectiveOverrideDeleteButtons();
  bindHistoryClaimEventDeleteButtons();
  bindHistoryVoteDeleteButtons();
  bindHistoryRoleActionDeleteButtons();
  bindHistoryRoleGuessControls();
}

function getHistoryPlayerOptionsHtml(players, selectedId) {
  return players
    .map((player) => `<option value="${escapeHtml(player.id)}" ${player.id === selectedId ? "selected" : ""}>${escapeHtml(player.name)}</option>`)
    .join("");
}

function getSeerColumnOverrideOptionsHtml(selectedValue = "") {
  const options = [
    ["", "未記録"],
    ["human", RESULT_LABELS.human],
    ["werewolf", RESULT_LABELS.werewolf],
  ];
  if (selectedValue && !Object.hasOwn(RESULT_LABELS, selectedValue)) {
    options.push([selectedValue, `${SEER_COLUMN_OVERRIDE_LABELS[selectedValue] || selectedValue}（保存済み）`]);
  }
  return options
    .map(([value, label]) => `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${label}</option>`)
    .join("");
}

function getHistorySeerColumnOverrideEditorRowHtml(override, players) {
  return `
    <div class="history-result-edit" data-seer-column-override="${escapeHtml(`${override.seerId}:${override.targetId}`)}" data-original-seer-id="${escapeHtml(override.seerId)}" data-original-target-id="${escapeHtml(override.targetId)}">
      <select data-field="seerId" aria-label="預言者">${getHistoryPlayerOptionsHtml(players, override.seerId)}</select>
      <select data-field="targetId" aria-label="対象">${getHistoryPlayerOptionsHtml(players, override.targetId)}</select>
      <select data-field="value" aria-label="手入力値">${getSeerColumnOverrideOptionsHtml(override.value)}</select>
      <button class="danger-button" type="button" data-delete-seer-column-override>削除</button>
    </div>
  `;
}

function getRivalPerspectiveRoleOptionsHtml(selectedRole) {
  return [...RIVAL_PERSPECTIVE_ROLES]
    .map((role) => `<option value="${role}" ${role === selectedRole ? "selected" : ""}>${ROLE_LABELS[role]}</option>`)
    .join("");
}

function getRivalPerspectiveValueOptionsHtml(selectedValue) {
  return [...RIVAL_PERSPECTIVE_VALUES]
    .map((value) => `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${ROLE_LABELS[value]}</option>`)
    .join("");
}

function getHistoryRivalPerspectiveOverrideEditorRowHtml(override, players) {
  return `
    <div class="history-result-edit" data-rival-perspective-override="${escapeHtml(getRivalPerspectiveOverrideKey(override.role, override.viewerId, override.targetId))}">
      <select data-field="role" aria-label="役職">${getRivalPerspectiveRoleOptionsHtml(override.role)}</select>
      <select data-field="viewerId" aria-label="視点者">${getHistoryPlayerOptionsHtml(players, override.viewerId)}</select>
      <select data-field="targetId" aria-label="対象者">${getHistoryPlayerOptionsHtml(players, override.targetId)}</select>
      <select data-field="value" aria-label="表示">${getRivalPerspectiveValueOptionsHtml(override.value)}</select>
      <button class="danger-button" type="button" data-delete-rival-perspective-override>削除</button>
    </div>
  `;
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
  const selected = getRoleGuessDisplay(player).value;
  return Object.entries(ROLE_GUESS_LABELS)
    .map(
      ([value, label]) => `
        <label class="history-role-guess-option ${getRoleGuessClass(value)}">
          <input type="radio" name="history-role-guess-${escapeHtml(player.id)}" data-role-guess="${value}" ${selected === value ? "checked" : ""} />
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
        const candidates = normalizeRoleGuessCandidates(
          Array.from(row.querySelectorAll("[data-role-guess]:checked")).map((item) => item.dataset.roleGuess),
        );
        const select = row.querySelector('[data-field="primaryRoleGuess"]');
        select.innerHTML = getPrimaryRoleGuessOptionsHtml(candidates, select.value);
        select.value = candidates[0] === "unknown" ? "" : candidates[0];
      });
    });
  });
}

function bindHistoryResultDeleteButtons() {
  els.historyResultEditor.querySelectorAll("[data-delete-result]").forEach((button) => {
    button.addEventListener("click", () => button.closest("[data-result-id]").remove());
  });
}

function bindHistorySeerColumnOverrideDeleteButtons() {
  els.historySeerColumnOverrideEditor.querySelectorAll("[data-delete-seer-column-override]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("[data-seer-column-override]");
      row.dataset.deleted = "true";
      row.hidden = true;
    });
  });
}

function bindHistoryRivalPerspectiveOverrideDeleteButtons() {
  els.historyRivalPerspectiveOverrideEditor.querySelectorAll("[data-delete-rival-perspective-override]").forEach((button) => {
    button.addEventListener("click", () => button.closest("[data-rival-perspective-override]").remove());
  });
}

function addHistoryRivalPerspectiveOverrideEditorRow() {
  const history = state.gameHistories.find((item) => item.id === editingHistoryId);
  const players = history ? getHistoryActivePlayers(history) : [];
  if (players.length < 2) return toast("参加者が2人以上必要です");
  els.historyRivalPerspectiveOverrideEditor.querySelector(".empty-inline")?.remove();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getHistoryRivalPerspectiveOverrideEditorRowHtml(
    { role: "seer", viewerId: players[0].id, targetId: players[1].id, value: "wolfSide" },
    players,
  );
  els.historyRivalPerspectiveOverrideEditor.appendChild(wrapper.firstElementChild);
  bindHistoryRivalPerspectiveOverrideDeleteButtons();
}

function addHistorySeerColumnOverrideEditorRow() {
  const history = state.gameHistories.find((item) => item.id === editingHistoryId);
  const players = history ? getHistoryActivePlayers(history) : [];
  if (!players.length) return toast("参加者がいません");
  els.historySeerColumnOverrideEditor.querySelector(".empty-inline")?.remove();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getHistorySeerColumnOverrideEditorRowHtml(
    { seerId: players[0].id, targetId: players[0].id, value: "human" },
    players,
  );
  els.historySeerColumnOverrideEditor.appendChild(wrapper.firstElementChild);
  bindHistorySeerColumnOverrideDeleteButtons();
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
    <select data-field="value" aria-label="占い結果"><option value="human">市民</option><option value="werewolf">人狼</option></select>
    <button class="danger-button" type="button" data-delete-result>削除</button>
  `;
  els.historyResultEditor.appendChild(row);
  bindHistoryResultDeleteButtons();
}

function bindHistoryRoleActionDeleteButtons() {
  els.historyRoleActionEditor.querySelectorAll("[data-delete-role-action]").forEach((button) => {
    button.addEventListener("click", () => button.closest("[data-role-action-id]").remove());
  });
  els.historyRoleActionEditor.querySelectorAll('[data-field="role"]').forEach((select) => {
    select.addEventListener("change", () => {
      const row = select.closest("[data-role-action-id]");
      row.querySelector('[data-field="result"]').innerHTML = getRoleActionResultOptionsHtml(select.value, "unknown");
    });
  });
}

function addHistoryRoleActionEditorRow() {
  const history = state.gameHistories.find((item) => item.id === editingHistoryId);
  const players = history ? getHistoryActivePlayers(history) : [];
  if (!players.length) return toast("参加者がいません");
  els.historyRoleActionEditor.querySelector(".empty-inline")?.remove();
  const action = {
    id: `new-${crypto.randomUUID()}`,
    actorId: players[0].id,
    role: "medium",
    day: 1,
    targetId: players[0].id,
    result: "unknown",
    note: "",
  };
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getHistoryRoleActionEditorRowHtml(action, players);
  els.historyRoleActionEditor.appendChild(wrapper.firstElementChild);
  bindHistoryRoleActionDeleteButtons();
}

function bindHistoryClaimEventDeleteButtons() {
  els.historyClaimEventEditor.querySelectorAll("[data-delete-claim-event]").forEach((button) => {
    button.addEventListener("click", () => button.closest("[data-claim-event-id]").remove());
  });
}

function addHistoryClaimEventEditorRow() {
  const history = state.gameHistories.find((item) => item.id === editingHistoryId);
  const players = history ? getHistoryActivePlayers(history) : [];
  if (!players.length) return toast("参加者がいません");
  els.historyClaimEventEditor.querySelector(".empty-inline")?.remove();
  const event = {
    id: `new-${crypto.randomUUID()}`,
    playerId: players[0].id,
    day: 1,
    previousRole: "",
    role: "seer",
    type: "claim",
    createdAt: new Date().toISOString(),
  };
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getHistoryClaimEventEditorRowHtml(event, players);
  els.historyClaimEventEditor.appendChild(wrapper.firstElementChild);
  bindHistoryClaimEventDeleteButtons();
}

function bindHistoryVoteDeleteButtons() {
  els.historyVoteEditor.querySelectorAll("[data-delete-vote]").forEach((button) => {
    button.addEventListener("click", () => button.closest("[data-vote-id]").remove());
  });
}

function addHistoryVoteEditorRow() {
  const history = state.gameHistories.find((item) => item.id === editingHistoryId);
  const players = history ? getHistoryActivePlayers(history) : [];
  if (!players.length) return;
  els.historyVoteEditor.querySelector(".empty-inline")?.remove();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getVoteEditorRowHtml(
    {
      id: `new-${crypto.randomUUID()}`,
      day: 1,
      order: getNextVoteOrder(1, history.voteHistories || []),
      voterId: players[0].id,
      targetId: players[0].id,
      note: "",
    },
    players,
  );
  els.historyVoteEditor.appendChild(wrapper.firstElementChild);
  bindHistoryVoteDeleteButtons();
}

function getHistoryClaimEventEditorRowHtml(event, players) {
  return `
    <div class="history-role-action-edit" data-claim-event-id="${escapeHtml(event.id)}" data-created-at="${escapeHtml(event.createdAt || "")}">
      <select data-field="playerId" aria-label="CO者">${getHistoryPlayerOptionsHtml(players, event.playerId)}</select>
      <input data-field="day" type="number" min="1" value="${Number(event.day) || 1}" aria-label="日付" />
      <select data-field="previousRole" aria-label="変更前役職">${getRoleOptionsHtml(event.previousRole)}</select>
      <select data-field="role" aria-label="変更後役職">${getRoleOptionsHtml(event.role)}</select>
      <button class="danger-button" type="button" data-delete-claim-event>削除</button>
    </div>
  `;
}

function getHistoryRoleActionEditorRowHtml(action, players) {
  return `
    <div class="history-role-action-edit" data-role-action-id="${escapeHtml(action.id)}">
      <select data-field="actorId" aria-label="CO者">${getHistoryPlayerOptionsHtml(players, action.actorId)}</select>
      <select data-field="role" aria-label="役職">${getRoleActionRoleOptionsHtml(action.role)}</select>
      <input data-field="day" type="number" min="1" value="${Number(action.day) || 1}" aria-label="日付" />
      <select data-field="targetId" aria-label="対象">${getHistoryPlayerOptionsHtml(players, action.targetId)}</select>
      <select data-field="result" aria-label="結果">${getRoleActionResultOptionsHtml(action.role, action.result)}</select>
      <input data-field="note" type="text" maxlength="60" value="${escapeHtml(action.note || "")}" placeholder="メモ" aria-label="メモ" />
      <button class="danger-button" type="button" data-delete-role-action>削除</button>
    </div>
  `;
}

function getRoleActionRoleOptionsHtml(selectedRole) {
  return [...ROLE_ACTION_ROLES]
    .map((role) => `<option value="${role}" ${role === selectedRole ? "selected" : ""}>${ROLE_LABELS[role]}</option>`)
    .join("");
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
  const season = parseOptionalSequenceNumber(els.historySeasonNumberInput.value);
  const edition = parseOptionalSequenceNumber(els.historyEditionNumberInput.value);
  if (!season.valid || !edition.valid) return toast("シーズン・開催回は1〜999の数字で入力してください");
  history.eventName = els.historyEventNameInput.value.trim() || "未設定";
  history.seasonNumber = season.value;
  history.editionNumber = edition.value;
  history.eventDate = normalizeDateValue(els.historyEventDateInput.value);
  history.gameNumber = normalizeGameNumber(els.historyGameNumberInput.value);
  history.winner = normalizeCitizenText(els.historyWinnerInput.value.trim()) || "勝利陣営未設定";
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
  const overrideRows = Array.from(els.historySeerColumnOverrideEditor.querySelectorAll("[data-seer-column-override]"));
  const clearedOverrideKeys = new Set(
    overrideRows
      .filter((row) => row.dataset.deleted === "true" || !row.querySelector('[data-field="value"]').value)
      .map((row) => `${row.dataset.originalSeerId}:${row.dataset.originalTargetId}`),
  );
  history.seerColumnOverrides = dedupeSeerColumnOverrides(
    overrideRows
      .filter((row) => row.dataset.deleted !== "true")
      .map((row) =>
        normalizeSeerColumnOverride({
          seerId: row.querySelector('[data-field="seerId"]').value,
          targetId: row.querySelector('[data-field="targetId"]').value,
          value: row.querySelector('[data-field="value"]').value,
        }),
      )
      .filter(Boolean),
  );
  synchronizeHistoryResultsWithSeerColumnOverrides(history, clearedOverrideKeys);
  history.rivalPerspectiveOverrides = dedupeRivalPerspectiveOverrides(
    Array.from(els.historyRivalPerspectiveOverrideEditor.querySelectorAll("[data-rival-perspective-override]"))
      .map((row) =>
        normalizeRivalPerspectiveOverride({
          role: row.querySelector('[data-field="role"]').value,
          viewerId: row.querySelector('[data-field="viewerId"]').value,
          targetId: row.querySelector('[data-field="targetId"]').value,
          value: row.querySelector('[data-field="value"]').value,
        }),
      )
      .filter(Boolean),
  );
  history.claimEvents = Array.from(els.historyClaimEventEditor.querySelectorAll("[data-claim-event-id]"))
    .map((row) =>
      normalizeClaimEvent({
        id: row.dataset.claimEventId.startsWith("new-") ? crypto.randomUUID() : row.dataset.claimEventId,
        playerId: row.querySelector('[data-field="playerId"]').value,
        day: row.querySelector('[data-field="day"]').value,
        previousRole: row.querySelector('[data-field="previousRole"]').value,
        role: row.querySelector('[data-field="role"]').value,
        createdAt: row.dataset.createdAt || new Date().toISOString(),
      }),
    )
    .filter(Boolean);
  history.voteHistories = Array.from(els.historyVoteEditor.querySelectorAll("[data-vote-id]"))
    .map((row) =>
      normalizeVoteHistory({
        id: row.dataset.voteId.startsWith("new-") ? crypto.randomUUID() : row.dataset.voteId,
        day: row.querySelector('[data-field="day"]').value,
        order: row.querySelector('[data-field="order"]').value,
        type: row.querySelector('[data-field="type"]')?.value || "normal",
        runoffRound: row.querySelector('[data-field="runoffRound"]')?.value || 0,
        voterId: row.querySelector('[data-field="voterId"]').value,
        targetId: row.querySelector('[data-field="targetId"]').value,
        note: "",
      }),
    )
    .filter(Boolean);
  history.roleActions = Array.from(els.historyRoleActionEditor.querySelectorAll("[data-role-action-id]"))
    .map((row) =>
      normalizeRoleAction({
        id: row.dataset.roleActionId.startsWith("new-") ? crypto.randomUUID() : row.dataset.roleActionId,
        actorId: row.querySelector('[data-field="actorId"]').value,
        role: row.querySelector('[data-field="role"]').value,
        day: row.querySelector('[data-field="day"]').value,
        targetId: row.querySelector('[data-field="targetId"]').value,
        result: row.querySelector('[data-field="result"]').value,
        note: row.querySelector('[data-field="note"]').value,
      }),
    )
    .filter(Boolean);
  backfillRoleClaimOrders(history.players);
  closeHistoryEditDialog();
  renderAndStore();
  toast("履歴の変更を保存しました");
}

function synchronizeHistoryResultsWithSeerColumnOverrides(history, clearedOverrideKeys = new Set()) {
  const overrideKeys = new Set(history.seerColumnOverrides.map((override) => `${override.seerId}:${override.targetId}`));
  history.results = history.results.filter((result) => {
    if (clearedOverrideKeys.has(`${result.seerId}:${result.targetId}`)) return false;
    const override = getSeerColumnOverride(result.seerId, result.targetId, history.seerColumnOverrides);
    return !overrideKeys.has(`${result.seerId}:${result.targetId}`) || Object.hasOwn(RESULT_LABELS, override?.value);
  });
  history.seerColumnOverrides.forEach((override) => {
    if (!Object.hasOwn(RESULT_LABELS, override.value)) return;
    const existing = history.results.find(
      (result) => result.seerId === override.seerId && result.targetId === override.targetId,
    );
    if (existing) {
      existing.value = override.value;
      return;
    }
    const orders = history.results
      .filter((result) => result.seerId === override.seerId)
      .map(getDivinationOrder);
    history.results.push({
      id: crypto.randomUUID(),
      seerId: override.seerId,
      targetId: override.targetId,
      order: orders.length ? Math.max(...orders) + 1 : 1,
      value: override.value,
    });
  });
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
  lines.push("", "時系列");
  lines.push(...buildCurrentTimeline());
  return lines.join("\n");
}

function buildHistoryText(history) {
  const lines = [
    `${getHistoryDisplayName(history)} / ${history.eventDate || "日付未選択"} / 第${history.gameNumber}試合`,
    `勝利: ${normalizeCitizenText(history.winner) || "未設定"}`,
    `人狼: ${history.wolfCount}`,
    "",
    "真の役職",
  ];
  lines.push(...formatTrueRoleGroups(getHistoryActivePlayers(history)));
  const teammates = getHistoryActivePlayers(history).filter((player) => player.wolfTeammate);
  if (teammates.length) lines.push("", `仲間: ${teammates.map((player) => player.name).join("、")}`);
  if (history.wolfModeActive) {
    const wolfSidePlayers = getHistoryActivePlayers(history).filter(
      (player) => isPriorityPlayer(player) || player.wolfTeammate,
    );
    lines.push("", "人狼陣営の表向き役職");
    wolfSidePlayers.forEach((player) => {
      lines.push(`- ${player.name}: ${ROLE_GUESS_LABELS[player.wolfModeCoverRole] || ROLE_GUESS_LABELS.unknown}`);
    });
  }
  const blackTargets = getHistoryActivePlayers(history)
    .filter((player) => player.blackTargetRank)
    .sort((a, b) => a.blackTargetRank - b.blackTargetRank);
  if (blackTargets.length) {
    lines.push("", "黒塗り位置");
    blackTargets.forEach((player) => lines.push(`- ${getCircledNumber(player.blackTargetRank)} ${player.name}`));
  }
  lines.push("", "時系列");
  lines.push(...buildHistoryTimeline(history));
  return lines.join("\n");
}

function buildHistoryTimeline(history) {
  const activePlayers = getHistoryActivePlayers(history);
  const results = history.results;
  const roleActions = history.roleActions || [];
  const claimEvents = history.claimEvents || [];
  const voteHistories = history.voteHistories || [];
  const maxDay = Math.max(
    0,
    ...results.map(getDivinationOrder),
    ...roleActions.map((action) => Number(action.day) || 1),
    ...claimEvents.map((event) => Number(event.day) || 1),
    ...voteHistories.map((vote) => Number(vote.day) || 1),
    ...activePlayers.filter((player) => isInactiveStatus(player.status)).map((player) => Number(player.statusDay) || 1),
  );
  if (!maxDay) return ["- 出来事なし"];
  const lines = [];
  for (let day = 1; day <= maxDay; day += 1) {
    const events = [];
    activePlayers
      .filter((player) => player.status === "attacked" && (Number(player.statusDay) || 1) === day)
      .forEach((player) => events.push(`襲撃: ${player.name}`));
    results
      .filter((result) => getDivinationOrder(result) === day)
      .sort((a, b) => compareTimelineResults(a, b, history.players))
      .forEach((result) => {
        const seer = history.players.find((player) => player.id === result.seerId);
        const target = history.players.find((player) => player.id === result.targetId);
        if (seer && target) {
          events.push(`占い: ${formatTimelineActorName(seer)} -> ${target.name}　${RESULT_LABELS[result.value]}`);
        }
      });
    roleActions
      .filter((action) => (Number(action.day) || 1) === day)
      .sort((a, b) => compareTimelineRoleActions(a, b, history.players))
      .forEach((action) => {
        const line = formatRoleActionEvent(action, history.players);
        if (line) events.push(line);
      });
    claimEvents
      .filter((event) => (Number(event.day) || 1) === day)
      .sort((a, b) => compareTimelineClaimEvents(a, b, history.players))
      .forEach((event) => {
        const line = formatClaimEvent(event, history.players);
        if (line) events.push(line);
      });
    voteHistories
      .filter((vote) => (Number(vote.day) || 1) === day)
      .forEach((vote) => {
        const line = formatVoteEvent(vote, history.players);
        if (line) events.push(line);
      });
    const voteSummary = formatVoteSummaryForDay(voteHistories, history.players, day);
    if (voteSummary) events.push(voteSummary);
    activePlayers
      .filter((player) => player.status === "exiled" && (Number(player.statusDay) || 1) === day)
      .forEach((player) => events.push(`追放: ${player.name}`));
    if (events.length) {
      lines.push(`${day}日目`);
      events.forEach((event) => lines.push(`- ${event}`));
    }
  }
  return lines.length ? lines : ["- 出来事なし"];
}

function buildCurrentTimeline() {
  const activePlayers = getActivePlayers();
  const results = state.results;
  const roleActions = state.roleActions;
  const claimEvents = state.claimEvents;
  const voteHistories = state.voteHistories;
  const maxDay = Math.max(
    0,
    ...results.map(getDivinationOrder),
    ...roleActions.map((action) => Number(action.day) || 1),
    ...claimEvents.map((event) => Number(event.day) || 1),
    ...voteHistories.map((vote) => Number(vote.day) || 1),
    ...activePlayers.filter((player) => isInactiveStatus(player.status)).map((player) => Number(player.statusDay) || 1),
  );
  if (!maxDay) return ["- 出来事なし"];
  const lines = [];
  for (let day = 1; day <= maxDay; day += 1) {
    const events = [];
    activePlayers
      .filter((player) => player.status === "attacked" && (Number(player.statusDay) || 1) === day)
      .forEach((player) => events.push(`襲撃: ${player.name}`));
    results
      .filter((result) => getDivinationOrder(result) === day)
      .sort((a, b) => compareTimelineResults(a, b, state.players))
      .forEach((result) => {
        const seer = findPlayer(result.seerId);
        const target = findPlayer(result.targetId);
        if (seer && target) {
          events.push(`占い: ${formatTimelineActorName(seer)} -> ${target.name}　${RESULT_LABELS[result.value]}`);
        }
      });
    roleActions
      .filter((action) => (Number(action.day) || 1) === day)
      .sort((a, b) => compareTimelineRoleActions(a, b, state.players))
      .forEach((action) => {
        const line = formatRoleActionEvent(action, state.players);
        if (line) events.push(line);
      });
    claimEvents
      .filter((event) => (Number(event.day) || 1) === day)
      .sort((a, b) => compareTimelineClaimEvents(a, b, state.players))
      .forEach((event) => {
        const line = formatClaimEvent(event, state.players);
        if (line) events.push(line);
      });
    voteHistories
      .filter((vote) => (Number(vote.day) || 1) === day)
      .forEach((vote) => {
        const line = formatVoteEvent(vote, state.players);
        if (line) events.push(line);
      });
    const voteSummary = formatVoteSummaryForDay(voteHistories, state.players, day);
    if (voteSummary) events.push(voteSummary);
    activePlayers
      .filter((player) => player.status === "exiled" && (Number(player.statusDay) || 1) === day)
      .forEach((player) => events.push(`追放: ${player.name}`));
    if (events.length) {
      lines.push(`${day}日目`);
      events.forEach((event) => lines.push(`- ${event}`));
    }
  }
  return lines.length ? lines : ["- 出来事なし"];
}

function getTrueRoleActions(actions, players) {
  return actions.filter((action) => players.find((player) => player.id === action.actorId)?.trueRole === action.role);
}

function formatClaimEvent(event, players) {
  const player = players.find((item) => item.id === event.playerId);
  if (!player) return "";
  const playerName = formatTimelineActorName(player);
  if (event.type === "withdraw") return `CO撤回: ${playerName} ${ROLE_LABELS[event.previousRole] || "役職"}`;
  if (event.type === "change") {
    return `CO変更: ${playerName} ${ROLE_LABELS[event.previousRole] || "役職"} → ${ROLE_LABELS[event.role] || "役職"}`;
  }
  return `CO: ${playerName} ${ROLE_LABELS[event.role] || "役職"}`;
}

function formatRoleActionEvent(action, players) {
  const actor = players.find((player) => player.id === action.actorId);
  const target = players.find((player) => player.id === action.targetId);
  const resultLabel = ROLE_ACTION_RESULT_LABELS[action.role]?.[action.result] || ROLE_ACTION_RESULT_LABELS[action.role]?.unknown || "不明";
  if (!actor || !target || !ROLE_ACTION_ROLES.has(action.role)) return "";
  const note = action.note ? ` / ${action.note}` : "";
  return `${ROLE_LABELS[action.role]}: ${formatTimelineActorName(actor)} -> ${target.name}　${resultLabel}${note}`;
}

function formatTrueRoleGroups(players) {
  const groups = new Map();
  players
    .filter((player) => player.trueRole && player.trueRole !== "villager")
    .forEach((player) => {
      const role = player.trueRole;
      const names = groups.get(role) || [];
      names.push(player.name);
      groups.set(role, names);
    });
  const lines = getTrueRoleGroupOrder(groups)
    .filter((role) => groups.has(role))
    .map((role) => `- ${ROLE_GUESS_LABELS[role] || role}: ${groups.get(role).join("、")}`);
  return lines.length ? lines : ["- 市民以外なし"];
}

function getTrueRoleGroupOrder(groups) {
  const preferred = ["seer", "medium", "guard", "hunter", "madman", "werewolf", "fox", "teruteru", "other", "wolfSide", "confirmedWhite"];
  const extras = [...groups.keys()].filter((role) => !preferred.includes(role)).sort();
  return [...preferred, ...extras];
}

function compareTimelineClaimEvents(a, b, players) {
  return (
    getTimelineRoleOrder(a.role || a.previousRole) - getTimelineRoleOrder(b.role || b.previousRole) ||
    getTimelinePlayerOrder(players, a.playerId) - getTimelinePlayerOrder(players, b.playerId) ||
    String(a.createdAt || "").localeCompare(String(b.createdAt || "")) ||
    String(a.id || "").localeCompare(String(b.id || ""))
  );
}

function compareTimelineResults(a, b, players) {
  return (
    getTimelinePlayerOrder(players, a.seerId) - getTimelinePlayerOrder(players, b.seerId) ||
    getDivinationOrder(a) - getDivinationOrder(b) ||
    getTimelinePlayerOrder(players, a.targetId) - getTimelinePlayerOrder(players, b.targetId) ||
    String(a.id || "").localeCompare(String(b.id || ""))
  );
}

function compareTimelineRoleActions(a, b, players) {
  return (
    getTimelineRoleOrder(a.role) - getTimelineRoleOrder(b.role) ||
    getTimelinePlayerOrder(players, a.actorId) - getTimelinePlayerOrder(players, b.actorId) ||
    getTimelinePlayerOrder(players, a.targetId) - getTimelinePlayerOrder(players, b.targetId) ||
    String(a.id || "").localeCompare(String(b.id || ""))
  );
}

function getTimelineRoleOrder(role) {
  return Object.hasOwn(ROLE_ORDER, role) ? ROLE_ORDER[role] : 99;
}

function getTimelinePlayerOrder(players, playerId) {
  const index = players.findIndex((player) => player.id === playerId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function formatVoteEvent(vote, players) {
  const voter = players.find((player) => player.id === vote.voterId);
  const target = vote.targetId === "abstain" ? null : players.find((player) => player.id === vote.targetId);
  if (!voter || (!target && vote.targetId !== "abstain")) return "";
  const targetName = vote.targetId === "abstain" ? "棄権" : target.name;
  if (normalizeVoteType(vote.type) === "runoff") return `決選投票: ${voter.name} -> ${targetName}`;
  const prefix = "投票";
  return `${prefix}${getVoteOrder(vote)}番目: ${voter.name} -> ${targetName}`;
}

function formatVoteSummaryForDay(votes, players, day, type = "", runoffRound = 0) {
  if (!type) {
    const phaseSummaries = getVoteSummaryPhaseKeys(votes, day)
      .map((phase) => {
        const summary = formatVoteSummaryForDay(votes, players, day, phase.type, phase.runoffRound);
        return summary ? `${getVotePhaseLabel(phase.type, phase.runoffRound)} ${summary.replace(/^得票: /, "")}` : "";
      })
      .filter(Boolean);
    return phaseSummaries.length ? `得票: ${phaseSummaries.join(" / ")}` : "";
  }
  const entries = votes
    .filter((vote) => {
      if ((Number(vote.day) || 1) !== day) return false;
      if (normalizeVoteType(vote.type) !== type) return false;
      return type !== "runoff" || normalizeRunoffRound(vote.runoffRound) === runoffRound;
    })
    .map((vote) => {
      const voter = players.find((player) => player.id === vote.voterId);
      const target = vote.targetId === "abstain" ? null : players.find((player) => player.id === vote.targetId);
      if (!voter || (!target && vote.targetId !== "abstain")) return null;
      return {
        order: getVoteOrder(vote),
        voterName: voter.name,
        targetId: vote.targetId,
        targetName: vote.targetId === "abstain" ? "棄権" : target.name,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
  if (!entries.length) return "";

  const groups = new Map();
  entries.forEach((entry, index) => {
    if (!groups.has(entry.targetId)) {
      groups.set(entry.targetId, {
        targetName: entry.targetName,
        firstIndex: index,
        voters: [],
      });
    }
    groups.get(entry.targetId).voters.push(entry.voterName);
  });

  const summaries = [...groups.values()]
    .sort((a, b) => b.voters.length - a.voters.length || a.firstIndex - b.firstIndex)
    .map((group) => `${group.targetName} ${group.voters.length}票（${group.voters.join(", ")}）`);
  return `得票: ${summaries.join(" / ")}`;
}

function getVoteOrderEntriesForDay(votes, players, day, type = "", runoffRound = 0) {
  return votes
    .map((vote, sourceIndex) => ({ vote, sourceIndex }))
    .filter(({ vote }) => {
      if ((Number(vote.day) || 1) !== day) return false;
      if (!type) return true;
      if (normalizeVoteType(vote.type) !== type) return false;
      return type !== "runoff" || normalizeRunoffRound(vote.runoffRound) === runoffRound;
    })
    .map(({ vote, sourceIndex }) => {
      const voter = players.find((player) => player.id === vote.voterId);
      const target = vote.targetId === "abstain" ? null : players.find((player) => player.id === vote.targetId);
      if (!voter || (!target && vote.targetId !== "abstain")) return null;
      return {
        id: vote.id,
        order: getVoteOrder(vote),
        sourceIndex,
        voterName: voter.name,
        targetName: vote.targetId === "abstain" ? "棄権" : target.name,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.order - a.order || b.sourceIndex - a.sourceIndex);
}

function getDecisiveVoteIdForPhase(votes, day, type, runoffRound = 0) {
  const phaseVotes = getVotesForPhase(votes, day, type, runoffRound);
  const orderedVotes = phaseVotes
    .map((vote, sourceIndex) => ({ vote, sourceIndex }))
    .sort((a, b) => getVoteOrder(a.vote) - getVoteOrder(b.vote) || a.sourceIndex - b.sourceIndex);
  const eligibleVoterCount = Math.max(orderedVotes.length, getVotePhaseEligibleVoterCount(votes, day, type, runoffRound));
  const voteCounts = new Map();
  for (let index = 0; index < orderedVotes.length; index += 1) {
    const vote = orderedVotes[index].vote;
    if (vote.targetId && vote.targetId !== "abstain") {
      voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
    }
    const ranking = [...voteCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (!ranking.length || (ranking[1]?.[1] || 0) === ranking[0][1]) continue;
    const remainingVotes = eligibleVoterCount - index - 1;
    if (ranking[0][1] > (ranking[1]?.[1] || 0) + remainingVotes) return vote.id;
  }
  return "";
}

function getVotePhaseEligibleVoterCount(votes, day, type, runoffRound = 0) {
  const phaseVotes = getVotesForPhase(votes, day, type, runoffRound);
  const voterIds = new Set(phaseVotes.map((vote) => vote.voterId));
  const excludedVoterIds = new Set();
  if (type === "runoff") {
    let tiedTargetIds = getTopVoteTargetIds(getVotesForPhase(votes, day, "normal", 0));
    for (let round = 1; round < runoffRound; round += 1) {
      tiedTargetIds = getTopVoteTargetIds(getVotesForPhase(votes, day, "runoff", round));
    }
    tiedTargetIds.forEach((playerId) => excludedVoterIds.add(playerId));
  }
  getVoteAvailableVotersForPhase(getActivePlayers(), day, votes, type, runoffRound, excludedVoterIds)
    .forEach((player) => voterIds.add(player.id));
  return voterIds.size;
}

function getVoteSummaryPhaseKeys(votes, day) {
  const byKey = new Map();
  votes
    .filter((vote) => (Number(vote.day) || 1) === day)
    .forEach((vote) => {
      const type = normalizeVoteType(vote.type);
      const runoffRound = type === "runoff" ? normalizeRunoffRound(vote.runoffRound) : 0;
      byKey.set(`${type}:${runoffRound}`, { type, runoffRound });
    });
  return sortVotePhaseKeysForSummary([...byKey.values()]);
}

function sortVotePhaseKeysForSummary(phaseKeys) {
  return phaseKeys.slice().sort((a, b) => {
    if (a.type !== b.type) return a.type === "runoff" ? -1 : 1;
    if (a.type === "runoff") return b.runoffRound - a.runoffRound;
    return 0;
  });
}

function getVotePhaseLabel(type, runoffRound = 0) {
  if (type !== "runoff") return VOTE_TYPE_LABELS.normal;
  return runoffRound > 1 ? `${VOTE_TYPE_LABELS.runoff}${runoffRound}` : VOTE_TYPE_LABELS.runoff;
}

function formatVoteOrderMarker(order) {
  const circledNumbers = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳"];
  return circledNumbers[order] || `${order}.`;
}

function formatTimelineActorName(player) {
  if (!player?.trueRole || player.trueRole === "villager") return player?.name || "";
  const trueRoleLabel = ROLE_GUESS_LABELS[player.trueRole] || ROLE_LABELS[player.trueRole];
  return trueRoleLabel ? `${player.name}（${trueRoleLabel}）` : player.name;
}

function formatImpressionForExport(player) {
  const impression = getPlayerImpression(player);
  const reasons = formatImpressionReasons(player.impressionReasons);
  return reasons ? `${impression.label}: ${reasons}` : impression.label;
}

function formatRoleGuessForExport(player) {
  const display = getDisplayedRoleGuess(player);
  if (isWolfMode() && isWolfModeMember(player)) return `${display.label}（人狼陣営）`;
  if (player.blackTargetRank) {
    return `黒塗り${getCircledNumber(player.blackTargetRank)} / ${display.label}${player.blackTargetPreference === "fixed" ? "（固定）" : "（自動）"}`;
  }
  if (display.value === "resultVillager") return `${display.label}${player.wolfTeammate ? "（仲間）" : ""}`;
  const candidates = player.roleGuessCandidates.filter((value) => value !== "unknown").map((value) => ROLE_GUESS_LABELS[value]);
  const formatted = candidates.length ? `${display.label}（候補: ${candidates.join("、")}）` : display.label;
  return `${formatted}${player.wolfTeammate ? "（仲間）" : ""}`;
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

function getMeaningfulProgressSignature() {
  const sortById = (items) => items.slice().sort((a, b) => String(a.id || "").localeCompare(String(b.id || "")));
  return JSON.stringify({
    roles: state.players
      .map((player) => ({ id: player.id, role: player.role }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id))),
    results: sortById(state.results).map(({ id, seerId, targetId, value, order, day }) => ({
      id,
      seerId,
      targetId,
      value,
      order,
      day,
    })),
    seerColumnOverrides: state.seerColumnOverrides
      .map(({ seerId, targetId, value }) => ({ seerId, targetId, value }))
      .sort((a, b) => `${a.seerId}:${a.targetId}`.localeCompare(`${b.seerId}:${b.targetId}`)),
    seerMediumLinks: state.seerMediumLinks
      .map(({ seerId, mediumId }) => ({ seerId, mediumId }))
      .sort((a, b) => a.seerId.localeCompare(b.seerId)),
    roleActions: sortById(state.roleActions).map(({ id, actorId, role, day, targetId, result, note }) => ({
      id,
      actorId,
      role,
      day,
      targetId,
      result,
      note,
    })),
    voteHistories: sortById(state.voteHistories).map(({ id, day, order, type, runoffRound, voterId, targetId }) => ({
      id,
      day,
      order,
      type,
      runoffRound,
      voterId,
      targetId,
      note: "",
    })),
  });
}

function isConfirmedWerewolf(player) {
  if (!player) return false;
  if (
    player.confirmedRoleEvidence?.some(
      (evidence) => evidence.value === "werewolf" && ["seer", "medium"].includes(evidence.role),
    )
  ) {
    return true;
  }
  const confirmedSeerResult = state.results.some(
    (result) =>
      result.targetId === player.id &&
      result.value === "werewolf" &&
      isConfirmedRoleActor(findPlayer(result.seerId), "seer"),
  );
  if (confirmedSeerResult) return true;
  return state.roleActions.some(
    (action) =>
      action.targetId === player.id &&
      action.role === "medium" &&
      action.result === "werewolf" &&
      isConfirmedRoleActor(findPlayer(action.actorId), "medium"),
  );
}

function confirmPendingExileContinuation() {
  const pendingPlayerId = state.pendingExileContinuationPlayerId;
  if (!pendingPlayerId) return "";
  state.pendingExileContinuationPlayerId = "";
  const pendingPlayer = findPlayer(pendingPlayerId);
  if (!pendingPlayer || pendingPlayer.status !== "exiled" || !isGameInProgress()) return "";

  const requiredPreviousWolves = Math.max(0, Number(state.wolfCount) - 1);
  const confirmedPreviousWolves = getActivePlayers().filter(
    (player) => player.id !== pendingPlayer.id && player.status === "exiled" && isConfirmedWerewolf(player),
  ).length;
  const totalConfirmedWolves = confirmedPreviousWolves + (isConfirmedWerewolf(pendingPlayer) ? 1 : 0);
  if (totalConfirmedWolves >= Number(state.wolfCount)) {
    return "確定人狼数とゲーム継続が矛盾しています。確定情報を確認してください";
  }
  if (confirmedPreviousWolves !== requiredPreviousWolves) return "";

  applyContinuedGameNonWolfInference(pendingPlayer);
  return `${pendingPlayer.name}をゲーム継続から非人狼として更新しました`;
}

function applyContinuedGameNonWolfInference(player) {
  if (!player.role) {
    player.role = "villager";
    player.manualRoleOverride = false;
    player.roleClaimOrder = getNextRoleClaimOrder();
    player.autoConfirmedWhite = false;
  } else if (["werewolf", "wolfSide"].includes(player.role)) {
    player.role = "madman";
    player.manualRoleOverride = false;
    player.roleClaimOrder = getNextRoleClaimOrder();
    player.autoConfirmedWhite = false;
  }

  const currentGuess = getRoleGuessDisplay(player).value;
  if (["werewolf", "wolfSide"].includes(currentGuess)) {
    player.roleGuessCandidates = ["madman"];
    player.primaryRoleGuess = "madman";
    player.manualRoleGuess = false;
    player.autoSelfRivalWolfSide = false;
  }
}

function isGameFinished() {
  return state.gameStatus === "finished";
}

function isGameLocked() {
  return isGameInProgress() || isGameFinished();
}

function renderAndStore() {
  removeInvalidCurrentMediumResults();
  applyConfirmedWhiteUpdates();
  render();
  store();
}

function store({ markDirty = true } = {}) {
  try {
    saveCurrentBoardSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save local state", error);
    return false;
  }
  try {
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
  } catch (error) {
    console.error("Failed to save sync metadata", error);
  }
  return true;
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
  state.seasonNumber = normalizeOptionalSequenceNumber(saved.seasonNumber);
  state.editionNumber = normalizeOptionalSequenceNumber(saved.editionNumber);
  state.gameNumber = normalizeGameNumber(saved.gameNumber);
  state.activeView = normalizeActiveView(saved.activeView);
  state.rosterFilter = normalizeRosterFilter(saved.rosterFilter);
  state.tournaments = Array.isArray(saved.tournaments) ? saved.tournaments.map(normalizeTournament).filter(Boolean) : [];
  state.selectedTournamentId = String(saved.selectedTournamentId || "");
  state.wolfCount = normalizeWolfCount(saved.wolfCount);
  state.players = Array.isArray(saved.players) ? saved.players.map(normalizePlayer) : [];
  const legacyWolfMode =
    state.players.some((player) => player.wolfTeammate) ||
    state.players.some((player) => isPriorityPlayer(player) && getRoleGuessDisplay(player).value === "werewolf");
  state.wolfModeActive = saved.wolfModeActive === true || (saved.wolfModeActive === undefined && legacyWolfMode);
  state.wolfModeCoverRole = WOLF_MODE_COVER_ROLES.has(saved.wolfModeCoverRole) ? saved.wolfModeCoverRole : "";
  state.reasoningPerspective = normalizeReasoningPerspective(saved.reasoningPerspective);
  const selfPlayer = state.players.find(isPriorityPlayer);
  if (state.wolfModeActive && selfPlayer && !selfPlayer.wolfModeCoverRole) {
    selfPlayer.wolfModeCoverRole = state.wolfModeCoverRole || "unknown";
  }
  state.results = Array.isArray(saved.results) ? saved.results.map(normalizeResult).filter(Boolean) : [];
  state.seerColumnOverrides = Array.isArray(saved.seerColumnOverrides)
    ? dedupeSeerColumnOverrides(saved.seerColumnOverrides.map(normalizeSeerColumnOverride).filter(Boolean))
    : [];
  state.seerMediumLinks = Array.isArray(saved.seerMediumLinks)
    ? dedupeSeerMediumLinks(saved.seerMediumLinks.map(normalizeSeerMediumLink).filter(Boolean))
    : [];
  state.rivalPerspectiveOverrides = Array.isArray(saved.rivalPerspectiveOverrides)
    ? migrateRivalPerspectiveOverrides(
        saved.rivalPerspectiveOverrides.map(normalizeRivalPerspectiveOverride).filter(Boolean),
        saved.rivalPerspectiveVersion,
      )
    : [];
  state.rivalPerspectiveVersion = 2;
  synchronizeCurrentResultsWithSeerColumnOverrides();
  state.roleActions = Array.isArray(saved.roleActions) ? saved.roleActions.map(normalizeRoleAction).filter(Boolean) : [];
  removeInvalidCurrentMediumResults();
  state.claimEvents = Array.isArray(saved.claimEvents) ? saved.claimEvents.map(normalizeClaimEvent).filter(Boolean) : [];
  state.voteHistories = Array.isArray(saved.voteHistories) ? saved.voteHistories.map(normalizeVoteHistory).filter(Boolean) : [];
  state.customImpressionReasons = Array.isArray(saved.customImpressionReasons)
    ? saved.customImpressionReasons.map(normalizeImpressionReason).filter((reason) => reason?.custom)
    : [];
  state.gameStatus = ["in_progress", "finished"].includes(saved.gameStatus) ? saved.gameStatus : "preparing";
  state.startedAt = state.gameStatus !== "preparing" ? String(saved.startedAt || "") : "";
  state.pendingExileContinuationPlayerId = String(saved.pendingExileContinuationPlayerId || "");
  if (!state.players.some((player) => player.id === state.pendingExileContinuationPlayerId && player.status === "exiled")) {
    state.pendingExileContinuationPlayerId = "";
  }
  state.gameHistories = Array.isArray(saved.gameHistories) ? saved.gameHistories.map(normalizeGameHistory).filter(Boolean) : [];
  state.boards = Array.isArray(saved.boards) ? saved.boards.map(normalizeBoard).filter(Boolean) : [];
  migrateLegacyRoster(saved.eventName);
  backfillStatusDays();
  applyConfirmedWhiteUpdates();
  if (!state.boards.length) {
    activeBoardId = activeBoardId || crypto.randomUUID();
    state.boards = [
      {
        id: activeBoardId,
        name: getDefaultBoardName(),
        updatedAt: new Date().toISOString(),
        payload: getBoardPayload(),
      },
    ];
  }
  const preferredBoard = state.boards.find((board) => board.id === activeBoardId) || state.boards[0];
  if (preferredBoard) loadBoard(preferredBoard.id, { storeAfter: false });
}

function getSyncPayload() {
  const payload = structuredClone(state);
  BOARD_STATE_FIELDS.forEach((field) => delete payload[field]);
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
  renderBoardSwitcher();
}

function renderBoardSwitcher() {
  const board = getActiveBoard();
  els.activeBoardName.textContent = board?.name || getDefaultBoardName();
}

function renderBoardManager() {
  saveCurrentBoardSnapshot();
  els.newBoardTournamentSelect.innerHTML = state.tournaments
    .map(
      (tournament) =>
        `<option value="${escapeHtml(tournament.id)}" ${tournament.id === state.selectedTournamentId ? "selected" : ""}>${escapeHtml(tournament.name)}</option>`,
    )
    .join("");
  els.boardList.innerHTML = [...state.boards]
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .map((board) => {
      const payload = board.payload || {};
      const tournamentName =
        state.tournaments.find((tournament) => tournament.id === payload.selectedTournamentId)?.name ||
        payload.eventName ||
        "未設定";
      const status = payload.gameStatus === "finished" ? "終了済み" : payload.gameStatus === "in_progress" ? "進行中" : "準備中";
      return `
        <div class="board-list-item ${board.id === activeBoardId ? "active" : ""}" data-board-id="${escapeHtml(board.id)}">
          <button class="board-select-button" type="button">
            <strong>${escapeHtml(board.name)}</strong>
            <span>${escapeHtml(formatEventSeriesName(tournamentName, payload.seasonNumber, payload.editionNumber))} / ${escapeHtml(payload.eventDate || "日付未選択")} / 第${normalizeGameNumber(payload.gameNumber)}試合</span>
            <small>${status} / ${escapeHtml(formatBoardUpdatedAt(board.updatedAt))}</small>
          </button>
          <button class="board-rename-button secondary-button" type="button">名称変更</button>
          <button class="board-delete-button danger-button" type="button" ${state.boards.length <= 1 ? "disabled" : ""}>削除</button>
        </div>
      `;
    })
    .join("");
  els.boardList.querySelectorAll(".board-list-item").forEach((row) => {
    const boardId = row.dataset.boardId;
    row.querySelector(".board-select-button").addEventListener("click", () => {
      saveCurrentBoardSnapshot();
      loadBoard(boardId);
    });
    row.querySelector(".board-rename-button").addEventListener("click", () => renameBoard(boardId));
    row.querySelector(".board-delete-button").addEventListener("click", () => deleteBoard(boardId));
  });
}

function formatBoardUpdatedAt(value) {
  if (!value) return "更新時刻なし";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "更新時刻なし";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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
    seasonNumber: null,
    editionNumber: null,
    gameNumber: 1,
    activeView: "participants",
    rosterFilter: "tournament",
    tournaments: [],
    selectedTournamentId: "",
    wolfCount: 2,
    wolfModeActive: false,
    wolfModeCoverRole: "",
    reasoningPerspective: "seer",
    players: [],
    results: [],
    seerColumnOverrides: [],
    seerMediumLinks: [],
    rivalPerspectiveOverrides: [],
    rivalPerspectiveVersion: 2,
    roleActions: [],
    claimEvents: [],
    voteHistories: [],
    gameStatus: "preparing",
    startedAt: "",
    pendingExileContinuationPlayerId: "",
    gameHistories: [],
    customImpressionReasons: [],
    boards: [],
  });
  activeBoardId = "";
  localStorage.removeItem(ACTIVE_BOARD_KEY);
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
      await resolveNewestSyncState(cloudRecord, { fallbackType: "initial" });
    } else {
      await applyCloudRecord(cloudRecord);
    }
    return;
  }
  if (cloudIsNew && cloudRecord.updated_by_device !== deviceId) {
    await resolveNewestSyncState(cloudRecord, { fallbackType: syncMeta.dirty ? "conflict" : "remote" });
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

async function resolveNewestSyncState(cloudRecord, { fallbackType = "conflict" } = {}) {
  const cloudTime = getTimestampValue(cloudRecord?.updated_at);
  const localTime = getTimestampValue(syncMeta.localUpdatedAt);
  if (cloudTime && localTime) {
    if (localTime > cloudTime) {
      await uploadLocalState();
      return;
    }
    await applyCloudRecord(cloudRecord);
    return;
  }
  if (cloudTime && !localTime) {
    await applyCloudRecord(cloudRecord);
    return;
  }
  if (!cloudTime && localTime) {
    await uploadLocalState();
    return;
  }
  showCloudConflict(cloudRecord, fallbackType);
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
  saveCurrentBoardSnapshot();
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
  const valueTime = getTimestampValue(value);
  const baselineTime = getTimestampValue(baseline);
  if (!valueTime) return false;
  if (!baselineTime) return true;
  return valueTime > baselineTime;
}

function getTimestampValue(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
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
  state.seasonNumber = normalizeOptionalSequenceNumber(state.seasonNumber);
  state.editionNumber = normalizeOptionalSequenceNumber(state.editionNumber);
  state.gameNumber = normalizeGameNumber(state.gameNumber);
  state.activeView = normalizeActiveView(state.activeView);
  state.rosterFilter = normalizeRosterFilter(state.rosterFilter);
  backfillRoleClaimOrders(state.players);
  if (!state.boards.length) {
    activeBoardId = activeBoardId || crypto.randomUUID();
    state.boards.push({
      id: activeBoardId,
      name: getDefaultBoardName(),
      updatedAt: new Date().toISOString(),
      payload: getBoardPayload(),
    });
    localStorage.setItem(ACTIVE_BOARD_KEY, activeBoardId);
  }
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
  let currentDay = 0;
  getActivePlayers()
    .filter((player) => isInactiveStatus(player.status))
    .slice()
    .reverse()
    .forEach((player) => {
      if (player.status === "exiled") {
        currentDay += 1;
        player.statusDay = currentDay;
      } else if (player.status === "attacked") {
        player.statusDay = Math.max(1, currentDay + 1);
      }
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

function normalizeReasoningPerspective(value) {
  return value === "medium" ? "medium" : "seer";
}

function normalizeEventName(value) {
  return String(value || "").trim();
}

function normalizeDateValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : "";
}

function parseOptionalSequenceNumber(value) {
  const text = String(value ?? "").trim();
  if (!text) return { valid: true, value: null };
  if (!/^\d{1,3}$/.test(text)) return { valid: false, value: null };
  const number = Number(text);
  return number >= 1 && number <= 999
    ? { valid: true, value: number }
    : { valid: false, value: null };
}

function normalizeOptionalSequenceNumber(value) {
  const parsed = parseOptionalSequenceNumber(value);
  return parsed.valid ? parsed.value : null;
}

function saveOptionalSequenceInput(input, field, label) {
  if (isGameLocked()) return render();
  const parsed = parseOptionalSequenceNumber(input.value);
  if (!parsed.valid) {
    toast(`${label}は1〜999の数字で入力してください`);
    return render();
  }
  state[field] = parsed.value;
  renderAndStore();
}

function normalizeGameNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(12, Math.max(1, Math.trunc(number))) : 1;
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
  return `${formatEventSeriesName(eventName, state.seasonNumber, state.editionNumber)} / ${state.eventDate || "日付未選択"} / 第${state.gameNumber}試合`;
}

function formatEventSeriesName(eventName, seasonNumber, editionNumber) {
  const parts = [eventName || "未設定"];
  const season = normalizeOptionalSequenceNumber(seasonNumber);
  const edition = normalizeOptionalSequenceNumber(editionNumber);
  if (season) parts.push(`シーズン${season}`);
  if (edition) parts.push(`第${edition}回`);
  return parts.join(" / ");
}

function getHistoryDisplayName(history) {
  return formatEventSeriesName(history?.eventName, history?.seasonNumber, history?.editionNumber);
}

function normalizePlayer(player) {
  const status = player.status === "dead" ? "attacked" : player.status;
  const attackedWolfSideConfirmedMadman =
    player.attackedWolfSideConfirmedMadman === true || (status === "attacked" && player.role === "wolfSide");
  const onlyLegacyManualMediumBroken =
    player.manualMediumConflictBroken === true &&
    player.confirmedResultConflictBroken !== true &&
    player.mediumConflictBroken !== true &&
    player.attackConflictBroken !== true;
  const normalizedRole = attackedWolfSideConfirmedMadman
    ? "madman"
    : onlyLegacyManualMediumBroken && player.role === "wolfSide" && player.manualRoleOverride !== true
      ? "seer"
    : Object.hasOwn(ROLE_LABELS, player.role)
      ? player.role
      : "";
  const isLegacySelfSyncedClaim =
    String(player.name || "") === PRIORITY_PLAYER_NAME &&
    !attackedWolfSideConfirmedMadman &&
    player.manualRoleOverride !== true &&
    LEGACY_SELF_SYNCED_CLAIM_ROLES.has(normalizedRole);
  const normalizedIndependentRole = isLegacySelfSyncedClaim ? "" : normalizedRole;
  const restoreLegacyBrokenGuess =
    onlyLegacyManualMediumBroken &&
    player.manualRoleGuess !== true &&
    normalizePrimaryRoleGuess(player.primaryRoleGuess, player.roleGuessCandidates) === "wolfSide";
  return {
    id: player.id || crypto.randomUUID(),
    name: String(player.name || "名無し"),
    role: normalizedIndependentRole,
    manualRoleOverride:
      attackedWolfSideConfirmedMadman || isLegacySelfSyncedClaim ? false : player.manualRoleOverride === true,
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
    roleGuessCandidates: attackedWolfSideConfirmedMadman
      ? ["madman"]
      : restoreLegacyBrokenGuess
        ? ["seer"]
      : normalizeRoleGuessCandidates(player.roleGuessCandidates, player.primaryRoleGuess),
    primaryRoleGuess: attackedWolfSideConfirmedMadman
      ? "madman"
      : restoreLegacyBrokenGuess
        ? "seer"
      : normalizePrimaryRoleGuess(
          player.primaryRoleGuess,
          normalizeRoleGuessCandidates(player.roleGuessCandidates, player.primaryRoleGuess),
        ),
    manualRoleGuess: attackedWolfSideConfirmedMadman ? false : player.manualRoleGuess === true,
    wolfModeCoverRole: WOLF_MODE_COVER_ROLES.has(player.wolfModeCoverRole)
      ? player.wolfModeCoverRole
      : player.wolfTeammate === true && WOLF_MODE_COVER_ROLES.has(normalizePrimaryRoleGuess(player.primaryRoleGuess, player.roleGuessCandidates))
        ? normalizePrimaryRoleGuess(player.primaryRoleGuess, player.roleGuessCandidates)
        : "",
    wolfTeammate: player.wolfTeammate === true,
    wolfTeammatePreviousGuess: normalizeConfirmedRolePreviousGuess(player.wolfTeammatePreviousGuess),
    blackTargetPreference: ["auto", "exclude", "fixed"].includes(player.blackTargetPreference)
      ? player.blackTargetPreference
      : "auto",
    blackTargetFixedRank:
      player.blackTargetPreference === "fixed"
        ? Math.max(1, Math.min(4, Number(player.blackTargetFixedRank) || 1))
        : 0,
    blackTargetRank: Math.max(0, Math.min(4, Number(player.blackTargetRank) || 0)),
    autoSelfRivalWolfSide: attackedWolfSideConfirmedMadman ? false : player.autoSelfRivalWolfSide === true,
    autoFullOutsiderVillager:
      attackedWolfSideConfirmedMadman ? false : player.autoFullOutsiderVillager === true,
    autoSingleClaimRoleGuess: attackedWolfSideConfirmedMadman
      ? null
      : normalizeSingleClaimRoleGuess(player.autoSingleClaimRoleGuess),
    autoConfirmedWhite: player.autoConfirmedWhite === true,
    autoConfirmedWhitePreviousGuess: normalizeConfirmedRolePreviousGuess(player.autoConfirmedWhitePreviousGuess),
    mediumConfirmedRoleGuess: ["villager", "werewolf"].includes(player.mediumConfirmedRoleGuess)
      ? player.mediumConfirmedRoleGuess
      : "",
    confirmedRoleEvidence: Array.isArray(player.confirmedRoleEvidence)
      ? player.confirmedRoleEvidence.map(normalizeConfirmedRoleEvidence).filter(Boolean)
      : [],
    confirmedRolePreviousGuess: normalizeConfirmedRolePreviousGuess(player.confirmedRolePreviousGuess),
    mediumHumanConversion: normalizeMediumHumanFieldState(player.mediumHumanConversion),
    mediumHumanBrokenPrevious: normalizeMediumHumanFieldState(player.mediumHumanBrokenPrevious),
    mediumConflictBroken: false,
    confirmedResultConflictBroken: player.confirmedResultConflictBroken === true || player.mediumConflictBroken === true,
    selfPerspectiveResultConflictBroken: player.selfPerspectiveResultConflictBroken === true,
    attackConflictBroken: player.attackConflictBroken === true,
    attackedWolfSideConfirmedMadman,
    attackedAutoVillager:
      player.attackedAutoVillager === true ||
      (player.attackedAutoVillager === undefined && status === "attacked" && player.role === "villager"),
    trueRole: Object.hasOwn(ROLE_GUESS_LABELS, player.trueRole) && player.trueRole !== "unknown" ? player.trueRole : "",
    roleClaimOrder:
      normalizedIndependentRole && getRoleClaimOrder(player) < Number.MAX_SAFE_INTEGER
        ? Math.max(1, getRoleClaimOrder(player))
        : null,
  };
}

function normalizeSingleClaimRoleGuess(previous) {
  const normalized = normalizeConfirmedRolePreviousGuess(previous);
  if (!normalized || !SELF_RIVAL_GUESS_ROLES.has(previous.role)) return null;
  return {
    ...normalized,
    role: previous.role,
  };
}

function normalizeConfirmedRoleEvidence(evidence) {
  if (!evidence?.actorId || !evidence?.sourceId || !["seer", "medium", "claim"].includes(evidence.role)) return null;
  if (!Object.hasOwn(ROLE_GUESS_LABELS, evidence.value) || evidence.value === "unknown") return null;
  return {
    actorId: String(evidence.actorId),
    role: evidence.role,
    sourceId: String(evidence.sourceId),
    value: evidence.value,
    persistedAfterDeath: evidence.persistedAfterDeath === true,
  };
}

function normalizeConfirmedRolePreviousGuess(previous) {
  if (!previous || typeof previous !== "object") return null;
  const candidates = normalizeRoleGuessCandidates(previous.roleGuessCandidates, previous.primaryRoleGuess);
  return {
    roleGuessCandidates: candidates,
    primaryRoleGuess: normalizePrimaryRoleGuess(previous.primaryRoleGuess, candidates),
    manualRoleGuess: previous.manualRoleGuess === true,
  };
}

function normalizeMediumHumanFieldState(stateValue) {
  if (!stateValue || typeof stateValue !== "object") return null;
  const role = normalizeMediumHumanFieldSnapshot(stateValue.role);
  const guess = normalizeMediumHumanFieldSnapshot(stateValue.guess);
  return role || guess ? { role, guess } : null;
}

function normalizeMediumHumanFieldSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || !Object.hasOwn(ROLE_GUESS_LABELS, snapshot.appliedValue)) return null;
  const previousValue =
    snapshot.previousValue === "" || Object.hasOwn(ROLE_GUESS_LABELS, snapshot.previousValue)
      ? snapshot.previousValue
      : "";
  return {
    previousValue,
    previousManual: snapshot.previousManual === true,
    appliedValue: snapshot.appliedValue,
    manuallyChanged: snapshot.manuallyChanged === true,
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

function synchronizeCurrentResultsWithSeerColumnOverrides() {
  state.results = state.results.filter((result) => {
    const override = getSeerColumnOverride(result.seerId, result.targetId);
    return !override || Object.hasOwn(RESULT_LABELS, override.value);
  });
  state.seerColumnOverrides.forEach((override) => {
    if (!Object.hasOwn(RESULT_LABELS, override.value)) return;
    const existing = state.results.find(
      (result) => result.seerId === override.seerId && result.targetId === override.targetId,
    );
    if (existing) {
      existing.value = override.value;
      return;
    }
    state.results.push({
      id: crypto.randomUUID(),
      seerId: override.seerId,
      targetId: override.targetId,
      order: getNextDivinationOrder(override.seerId),
      value: override.value,
    });
  });
}

function normalizeSeerColumnOverride(override) {
  if (!override?.seerId || !override?.targetId || !Object.hasOwn(SEER_COLUMN_OVERRIDE_LABELS, override.value)) return null;
  const value = override.value === "villager" ? "human" : override.value;
  return {
    seerId: String(override.seerId),
    targetId: String(override.targetId),
    value,
  };
}

function normalizeSeerMediumLink(link) {
  if (!link?.seerId || !link.mediumId) return null;
  return {
    seerId: String(link.seerId),
    mediumId: String(link.mediumId),
  };
}

function dedupeSeerMediumLinks(links) {
  const bySeer = new Map();
  links.forEach((link) => bySeer.set(link.seerId, link));
  return [...bySeer.values()];
}

function normalizeRivalPerspectiveOverride(override) {
  if (
    !override?.viewerId ||
    !override?.targetId ||
    override.viewerId === override.targetId ||
    !RIVAL_PERSPECTIVE_ROLES.has(override.role) ||
    !RIVAL_PERSPECTIVE_VALUES.has(override.value)
  ) {
    return null;
  }
  return {
    role: override.role,
    viewerId: String(override.viewerId),
    targetId: String(override.targetId),
    value: override.value,
  };
}

function dedupeRivalPerspectiveOverrides(overrides) {
  const byPerspective = new Map();
  overrides.forEach((override) => {
    byPerspective.set(getRivalPerspectiveOverrideKey(override.role, override.viewerId, override.targetId), override);
  });
  return [...byPerspective.values()];
}

function migrateRivalPerspectiveOverrides(overrides, version) {
  const migrated = Number(version) >= 2
    ? overrides
    : overrides.map((override) =>
        override.role === "seer"
          ? override
          : { ...override, viewerId: override.targetId, targetId: override.viewerId },
      );
  return dedupeRivalPerspectiveOverrides(migrated);
}

function dedupeSeerColumnOverrides(overrides) {
  const byPair = new Map();
  overrides.forEach((override) => byPair.set(`${override.seerId}:${override.targetId}`, override));
  return [...byPair.values()];
}

function normalizeRoleAction(action) {
  if (!action || !action.actorId || !action.targetId || !ROLE_ACTION_ROLES.has(action.role)) return null;
  const resultLabels = ROLE_ACTION_RESULT_LABELS[action.role];
  const result = Object.hasOwn(resultLabels, action.result) ? action.result : "unknown";
  return {
    id: action.id || crypto.randomUUID(),
    actorId: String(action.actorId),
    role: action.role,
    day: Number.isFinite(Number(action.day)) ? Math.max(1, Number(action.day)) : 1,
    targetId: String(action.targetId),
    result,
    note: String(action.note || "").trim().slice(0, 60),
  };
}

function normalizeClaimEvent(event) {
  if (!event?.playerId) return null;
  const previousRole = Object.hasOwn(ROLE_LABELS, event.previousRole) ? event.previousRole : "";
  const role = Object.hasOwn(ROLE_LABELS, event.role) ? event.role : "";
  if (previousRole === role || (!previousRole && !role)) return null;
  return {
    id: event.id || crypto.randomUUID(),
    playerId: String(event.playerId),
    day: Number.isFinite(Number(event.day)) ? Math.max(1, Number(event.day)) : 1,
    previousRole,
    role,
    type: !previousRole ? "claim" : !role ? "withdraw" : "change",
    createdAt: String(event.createdAt || ""),
  };
}

function normalizeVoteHistory(vote) {
  if (!vote?.voterId || !vote.targetId) return null;
  const type = normalizeVoteType(vote.type);
  return {
    id: vote.id || crypto.randomUUID(),
    day: Number.isFinite(Number(vote.day)) ? Math.max(1, Number(vote.day)) : 1,
    order: Number.isFinite(Number(vote.order ?? vote.round)) ? Math.max(1, Number(vote.order ?? vote.round)) : 1,
    type,
    runoffRound: type === "runoff" ? normalizeRunoffRound(vote.runoffRound) : 0,
    voterId: String(vote.voterId),
    targetId: vote.targetId === "abstain" ? "abstain" : String(vote.targetId),
    note: "",
  };
}

function normalizeGameHistory(history) {
  if (!history?.id || !Array.isArray(history.players) || !Array.isArray(history.results)) return null;
  const normalized = {
    id: String(history.id),
    eventName: normalizeEventName(history.eventName) || "未設定",
    eventDate: normalizeDateValue(history.eventDate),
    seasonNumber: normalizeOptionalSequenceNumber(history.seasonNumber),
    editionNumber: normalizeOptionalSequenceNumber(history.editionNumber),
    gameNumber: normalizeGameNumber(history.gameNumber),
    wolfCount: normalizeWolfCount(history.wolfCount),
    wolfModeActive: history.wolfModeActive === true || history.players.some((player) => player.wolfTeammate === true),
    wolfModeCoverRole: WOLF_MODE_COVER_ROLES.has(history.wolfModeCoverRole) ? history.wolfModeCoverRole : "",
    winner: normalizeCitizenText(history.winner || "勝利陣営未設定"),
    startedAt: String(history.startedAt || ""),
    finishedAt: String(history.finishedAt || ""),
    selectedTournamentId: String(history.selectedTournamentId || ""),
    boardId: String(history.boardId || ""),
    players: history.players.map(normalizePlayer),
    results: history.results.map(normalizeResult).filter(Boolean),
    seerColumnOverrides: Array.isArray(history.seerColumnOverrides)
      ? dedupeSeerColumnOverrides(history.seerColumnOverrides.map(normalizeSeerColumnOverride).filter(Boolean))
      : [],
    seerMediumLinks: Array.isArray(history.seerMediumLinks)
      ? dedupeSeerMediumLinks(history.seerMediumLinks.map(normalizeSeerMediumLink).filter(Boolean))
      : [],
    rivalPerspectiveOverrides: Array.isArray(history.rivalPerspectiveOverrides)
      ? migrateRivalPerspectiveOverrides(
          history.rivalPerspectiveOverrides.map(normalizeRivalPerspectiveOverride).filter(Boolean),
          history.rivalPerspectiveVersion,
        )
      : [],
    rivalPerspectiveVersion: 2,
    roleActions: Array.isArray(history.roleActions) ? history.roleActions.map(normalizeRoleAction).filter(Boolean) : [],
    claimEvents: Array.isArray(history.claimEvents) ? history.claimEvents.map(normalizeClaimEvent).filter(Boolean) : [],
    voteHistories: Array.isArray(history.voteHistories) ? history.voteHistories.map(normalizeVoteHistory).filter(Boolean) : [],
  };
  backfillRoleClaimOrders(normalized.players);
  return normalized;
}

function normalizeBoard(board) {
  if (!board?.id || !board.payload || typeof board.payload !== "object") return null;
  const payload = structuredClone(board.payload);
  payload.day = Number.isFinite(Number(payload.day)) ? Math.max(1, Number(payload.day)) : 1;
  payload.eventName = normalizeEventName(payload.eventName);
  payload.eventDate = normalizeDateValue(payload.eventDate);
  payload.seasonNumber = normalizeOptionalSequenceNumber(payload.seasonNumber);
  payload.editionNumber = normalizeOptionalSequenceNumber(payload.editionNumber);
  payload.gameNumber = normalizeGameNumber(payload.gameNumber);
  payload.selectedTournamentId = String(payload.selectedTournamentId || "");
  payload.wolfCount = normalizeWolfCount(payload.wolfCount);
  payload.wolfModeActive = payload.wolfModeActive === true;
  payload.wolfModeCoverRole = WOLF_MODE_COVER_ROLES.has(payload.wolfModeCoverRole) ? payload.wolfModeCoverRole : "";
  payload.reasoningPerspective = normalizeReasoningPerspective(payload.reasoningPerspective);
  payload.players = Array.isArray(payload.players) ? payload.players.map(normalizePlayer) : [];
  payload.results = Array.isArray(payload.results) ? payload.results.map(normalizeResult).filter(Boolean) : [];
  payload.seerColumnOverrides = Array.isArray(payload.seerColumnOverrides)
    ? dedupeSeerColumnOverrides(payload.seerColumnOverrides.map(normalizeSeerColumnOverride).filter(Boolean))
    : [];
  payload.seerMediumLinks = Array.isArray(payload.seerMediumLinks)
    ? dedupeSeerMediumLinks(payload.seerMediumLinks.map(normalizeSeerMediumLink).filter(Boolean))
    : [];
  payload.rivalPerspectiveOverrides = Array.isArray(payload.rivalPerspectiveOverrides)
    ? migrateRivalPerspectiveOverrides(
        payload.rivalPerspectiveOverrides.map(normalizeRivalPerspectiveOverride).filter(Boolean),
        payload.rivalPerspectiveVersion,
      )
    : [];
  payload.rivalPerspectiveVersion = 2;
  payload.roleActions = Array.isArray(payload.roleActions) ? payload.roleActions.map(normalizeRoleAction).filter(Boolean) : [];
  payload.claimEvents = Array.isArray(payload.claimEvents) ? payload.claimEvents.map(normalizeClaimEvent).filter(Boolean) : [];
  payload.voteHistories = Array.isArray(payload.voteHistories) ? payload.voteHistories.map(normalizeVoteHistory).filter(Boolean) : [];
  payload.gameStatus = ["in_progress", "finished"].includes(payload.gameStatus) ? payload.gameStatus : "preparing";
  payload.startedAt = payload.gameStatus !== "preparing" ? String(payload.startedAt || "") : "";
  payload.pendingExileContinuationPlayerId = String(payload.pendingExileContinuationPlayerId || "");
  if (!payload.players.some((player) => player.id === payload.pendingExileContinuationPlayerId && player.status === "exiled")) {
    payload.pendingExileContinuationPlayerId = "";
  }
  return {
    id: String(board.id),
    name: String(board.name || "").trim().slice(0, 40) || "盤面",
    updatedAt: String(board.updatedAt || ""),
    payload,
  };
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
  let reloadingForServiceWorker = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadingForServiceWorker) return;
    reloadingForServiceWorker = true;
    window.location.reload();
  });
  navigator.serviceWorker
    .register("./service-worker.js", { updateViaCache: "none" })
    .then((registration) => {
      registration.update().catch(() => {});
      window.addEventListener("pageshow", () => registration.update().catch(() => {}));
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update().catch(() => {});
      });
    })
    .catch(() => {});
}
