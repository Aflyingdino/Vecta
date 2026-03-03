# TaskPilot — Outstanding TODO

## Backend Required

- [ ] **Media upload for tasks**
  File: `src/components/TaskModal.vue`
  The attachment section UI is present (placeholder). Requires a backend endpoint to accept
  file uploads, store them, and return URLs to attach to the task object.

- [ ] **Assign tasks to other users**
  File: `src/stores/boardStore.js` + `src/components/TaskModal.vue`
  The task data model has no `assigneeIds` field yet. Requires a user/member list (backend),
  a multi-select assignee picker in the task modal, and avatar display on task cards.

## Unfinished Features

- [ ] **Subtasks** — Tasks should support nested sub-tasks (checklist-style), shown in TaskDetail and on TaskCard as a progress bar (e.g. 2/5 done).

- [ ] **Pinned comments** — Admins, owners, and assignees can pin up to 3 comments per task. Pinned comments always appear at the top of the comments list with a distinct pin badge.

- [ ] **Mute notifications** — Each project/group/label should have a "Mute notifications" toggle so users don't receive activity alerts from muted items. Reachable from project settings and a small bell icon on group headers.

- [ ] **Group detail view** — A full-page panel showing all tasks in a group with extended metadata, sort controls (by status, priority, deadline, assignee, label), filter bar, and a mini timeline view.

## Personalization

- [ ] **Personal background** — Users can upload an image or pick a preset gradient/colour as the app background (applied behind `--color-surface-0`).
- [ ] **Accent colour picker** — Let users override `--color-accent` globally (colour wheel / hex input).
- [ ] **Font selection** — Choose between default sans-serif, a monospace option, and OpenDyslexic for accessibility.
- [ ] **Compact / comfortable density** — Toggle between compact card spacing and comfortable spacing across the board.
- [ ] **Layout customization** — Customizable dashboard widget order, sidebar width presets, and card border-radius style (sharp / rounded / pill).
- [ ] **Light / dark / system theme** — Currently dark only; add light theme and auto (follows OS preference).

## Accessibility

- [ ] **Colour-blind modes** — Add deuteranopia, protanopia, and tritanopia CSS filter presets toggled from user settings.
- [ ] **Keyboard navigation** — All drag-and-drop actions (task move, group reorder) should have keyboard alternatives (arrow keys + Space/Enter to grab/drop).
- [ ] **Focus visible styles** — Audit all interactive elements for a clear `:focus-visible` ring that meets WCAG AA contrast.
- [ ] **ARIA roles** — `role="list"` / `role="listitem"` on task columns; `aria-live` regions for activity feed updates.

## Polish

- [ ] **Empty-state illustrations** — Replace icon + text empty states with custom SVG illustrations.
- [ ] **Onboarding tour** — First-time user sees a guided tooltip walkthrough of the board UI.
- [ ] **Keyboard shortcut cheatsheet** — `?` key opens a modal listing all keyboard shortcuts.
