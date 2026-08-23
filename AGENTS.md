# Repository Instructions

## Domain Rules

- Read `GAME_RULES.md` before changing game logic, role labels, player status,
  perspective columns, logs, history, or saved state.
- Treat `GAME_RULES.md` as the product rules specification. When code and the
  document disagree, investigate the existing behavior before choosing one.
- Update `GAME_RULES.md` in the same commit whenever a rule is added, removed,
  or reinterpreted.

## Change Impact Audit

For every inference-related change, inspect all affected surfaces, not only the
reported cell or button:

- CO role and role guess
- seer and medium perspectives
- 1CO, 2CO, and 3CO-or-more cases
- alive, exiled, and attacked states
- standard attack, self-bite, and no-bite rules
- confirmed white, exposed-human, outsider count, and broken-seer logic
- manual overrides and restoration after an inference becomes invalid
- current board, completed history, logs, copy output, local storage, and cloud sync

Before editing, state which related cases are expected to change. If a newly
requested rule logically affects another case, implement the consistent behavior
or explain the ambiguity before implementation.

## Verification

- Add or update a regression scenario for the direct request and its adjacent
  rule combinations when a test harness exists.
- At minimum, run `node --check app.js` and `git diff --check`.
- For UI changes, inspect the relevant flow at desktop and iPhone width.
- Bump the displayed app version and PWA cache for runtime changes.
- Commit completed work. Do not push unless the user explicitly requests it.
