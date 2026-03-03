# TaskPilot — Changelog

## Release — Session 2 batch

### Board & Groups

| # | Feature | Confidence |
|---|---------|-----------|
| 1 | **Group detail tab** — clicking a group name opens it as a tab on the board (alongside board / archive tabs), showing meta, description, task list with clickable rows | 92% |
| 2 | **No deadline on board for groups** — deadline field removed from group card header; still editable in the settings panel | 97% |
| 3 | **Group urgency indicators** — priority dot + status chip shown directly on the column header | 95% |
| 4 | **Labels for groups** — groups can be assigned project labels; colored dots shown in column header; selectable in settings panel | 90% |
| 5 | **Group accent color** — flat left-border accent (no 3-D bar); set via ColorPicker in group settings panel | 95% |
| 6 | **Unified icon buttons** — all group action buttons share `.col-icon-btn` style; move/drag handle uses same color as other icons | 97% |
| 7 | **Group drag outline** — dragging a group over another column shows `outline: 2px dashed var(--color-accent)` (matches project-page style) | 93% |
| 8 | **Mute groups from notifications** — mute button in group header; muted groups suppress future task-alert notifications | 88% |

### Tasks

| # | Feature | Confidence |
|---|---------|-----------|
| 9 | **Task card color** — accent color applies as left border on board cards | 96% |
| 10 | **Card color in task modal** — replaced "Calendar color" field with "Card color" picker; calendar color field removed from create/edit form | 95% |
| 11 | **Pin comments** — comments in task detail can be pinned; pinned comments float to the top; pin indicated by icon + "Pinned" badge | 89% |
| 12 | **Delete comments** — delete button per comment in task detail (revealed on hover) | 94% |
| 13 | **Notes file upload** — notes of type image/video show a file picker instead of a URL textarea; file is read as base64 dataURL and stored; image thumbnail preview shown | 85% |

### Calendar

| # | Feature | Confidence |
|---|---------|-----------|
| 14 | **Starts at 12pm** — calendar scrolls to midday on mount | 97% |
| 15 | **End time on blocks** — task blocks show `HH:MM–HH:MM` range | 96% |
| 16 | **Drag doesn't open task** — 250 ms guard prevents click handler firing after a drag ends | 91% |
| 17 | **Resize collision prevention** — top and bottom resize operations abort if the resized block would overlap another task on the same day | 87% |
| 18 | **1-click color change** — paint-bucket icon appears on block hover; clicking opens a small swatch palette to change `calendarColor` immediately (no modal) | 88% |

### Projects

| # | Feature | Confidence |
|---|---------|-----------|
| 19 | **Archive projects** — archive button per project card (hover overlay); archive tab in header showing all archived projects with restore + permanent-delete | 91% |

### Dashboard

| # | Feature | Confidence |
|---|---------|-----------|
| 20 | **Clickable stat cards** — each stat card is a button; clicking it toggles a drill-down panel listing the tasks in that category; clicking a task opens task detail | 90% |

### Notifications

| # | Feature | Confidence |
|---|---------|-----------|
| 21 | **Notification store** — mute logic (groups, labels, projects), archive, delete, task-alert scheduler | 85% |
| 22 | **Notification panel** — shift+click multi-select, bulk archive/delete, click to navigate to task | 83% |
| 23 | **Mute projects/labels** — mute per-project and per-label from notification panel and project/label settings | 80% |

### UI & Animations

| # | Feature | Confidence |
|---|---------|-----------|
| 24 | **Subtle animations** — `fadeUp`, `badgePop`, `notifSlide`, `detail-slide`, `.card-lift`, `.skeleton` shimmer, `.spin`, button press scale added to global CSS | 90% |
| 25 | **Sidebar `···` hint** — collapsed sidebar shows `···` text hint on the projects section toggle | 93% |

---

*Confidence % reflects likelihood the feature works end-to-end without further manual QA.*
