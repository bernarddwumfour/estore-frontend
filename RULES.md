# Frontend Rules

Authoritative conventions for `estore-frontend`. Follow these when adding or changing code.

## 1. Reuse widgets — don't duplicate components

- `src/widgets/` holds the reusable building blocks (tables, dialogs, filters, pagination, avatars, refresh buttons, …). **Always check for an existing widget before writing a new component.**
- If a component (or hook/helper) is used **more than once** — across pages or even twice within one page — extract it:
  - Generic UI → `src/widgets/<Name>/<Name>.tsx` (e.g. `UserAvatar`, `RefreshButton`).
  - Feature-scoped shared pieces → a feature folder under widgets (e.g. `src/widgets/social/`).
  - Non-visual helpers → `src/lib/` (e.g. `api-message.ts`, `format-time.ts`).
- Known shared helpers — use these, do not re-implement inline:
  - `apiMessage(error, fallback)` from `src/lib/api-message.ts` for axios error toasts.
  - `timeAgo` / `clockTime` / `formatNumber` from `src/lib/format-time.ts`.
  - `RefreshButton` widget for refresh actions (handles spinner + toast + react-query fetch state).

## 2. UX for mutations

- Every button that fires a mutation must **disable itself and show a spinner** (`Loader2` with `animate-spin`) while the request is in flight, so the user knows an action is executing.
- When several sibling actions exist (e.g. per-comment Like/Hide/Delete), disable them all during a mutation but spin **only the button that was clicked** (use the mutation's `variables` to identify it).
- Destructive actions (delete, reject) go through a confirmation dialog (`InfoDialog`).
- Surface results with `sonner` toasts using the backend envelope message (`apiMessage`).

## 3. Responsive layout

- Multi-pane pages (list / detail / side panel) must collapse on mobile to a **single pane with drill-in navigation and back buttons** (see `dashboard/marketing/social`): list → detail → sub-panel, each back button visible only below `lg`.
- The page body must never scroll horizontally; panes scroll internally (`overflow-y-auto` with a max height).

## 4. Data fetching

- Server state via `@tanstack/react-query`; authenticated calls via `securityAxios`; endpoints only from `src/constants/endpoints/endpoints.ts` (never hardcode paths).
- API response envelope: `{ success, data, message, errors }`.
- Debounce free-text search inputs before adding them to a query key.

## 5. Style

- Tailwind CSS v4 classes; support dark mode (`dark:` variants) on every new surface.
- Match the existing visual language: rounded-2xl cards on `bg-white dark:bg-[#111114]`, emerald as the action color, `text-[10px] font-black uppercase tracking-wider` for micro-labels.
