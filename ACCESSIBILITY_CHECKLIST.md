# STEMMate Namibia: Accessibility checklist (Role 3)

Status values: **Fixed in code** (checked by reading the code and building), **To test** (needs a manual check in the browser before marking it fixed).

| # | Check | Change made | Status |
|---|-------|-------------|--------|
| 1 | Page is styled (Tailwind actually loads) | Tailwind v4 set up with `@tailwindcss/vite` and `@import "tailwindcss"` | To test in browser |
| 2 | Every input has a visible or screen-reader label | Search, note and edit inputs all use `<label htmlFor>` | Fixed in code |
| 3 | Decorative icons hidden from screen readers | `aria-hidden="true"` on all icons; icon-only Edit button has an `aria-label` naming the plan | Fixed in code |
| 4 | Status changes are announced | `role="status"` live region for confirmations; `role="alert"` for errors and offline banner | To test with NVDA / TalkBack |
| 5 | Text contrast (WCAG AA 4.5:1) | Darker greens, blues and greys (e.g. `green-800` button, `text-gray-700` for secondary text) | To test with a contrast checker |
| 6 | Input borders visible (3:1) | Borders changed from default light grey to `gray-500` | To test |
| 7 | Everything works by keyboard | Notes and edits are real `<form>`s (Enter submits); Escape cancels an edit; skip link added | To test (Tab through the page) |
| 8 | Focus is managed | Focus moves into the edit field when editing starts and back to the Edit button after save/cancel | To test |
| 9 | Visible focus indicator | `focus:ring` on all inputs and buttons | To test |
| 10 | Lists are real lists | Activities and plans use `<ul>/<li>` | Fixed in code |
| 11 | Buttons say which item they act on | "Save plan" has hidden text "for <activity>" | Fixed in code |
| 12 | Touch targets at least 24px | Edit button padded to about 36px | To test on phone |
| 13 | Errors say what happened and how to recover | Save/edit failures keep the user's text and show a dismissible message; load failure has a "Try again" button | To test (simulate by blocking storage / going offline) |

## Bugs fixed while doing this
- One shared note state meant text typed in one activity leaked into another, and clicking "Save Changes" without typing wiped the existing note. Notes are now stored per activity and the edit field has its own draft.
- The offline banner promised "will sync when you reconnect" but nothing synced. Status is now honest: "Saved on device" when there is no backend, and "Sync pending" / "Synced" when one is configured.
- Corrupted saved data used to crash the app on load. It is now backed up and reset, and the user is told.

Remember (from the A3 feedback): only mark an item fixed after rechecking it in the running prototype.
