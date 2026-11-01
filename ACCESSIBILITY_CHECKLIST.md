# STEMMate Namibia: Accessibility checklist (Role 3)

Tested on 1 November 2026 in Google Chrome at http://localhost:5173, following `TEST_PLAN.md`. Screenshots are in the `evidence` folder, named after the test number.

**Lighthouse accessibility score (T10): 100 / 100**

| # | Check | Change made | Status | Evidence |
|---|-------|-------------|--------|----------|
| 1 | Page is styled (Tailwind actually loads) | Tailwind v4 set up with `@tailwindcss/vite` and `@import "tailwindcss"` | Tested | T1 |
| 2 | Every input has a visible or screen-reader label | Search, note and edit inputs all use `<label htmlFor>` | Tested | T10, T12 |
| 3 | Decorative icons hidden from screen readers | `aria-hidden="true"` on all icons; icon-only Edit button has an `aria-label` naming the plan | Tested | T10, T12 |
| 4 | Status changes are announced | `role="status"` live region for confirmations; `role="alert"` for errors and offline banner | Tested | T2, T4b, T6, T9a |
| 5 | Text contrast (WCAG AA 4.5:1) | Darker greens, blues and greys (e.g. `green-800` button, `text-gray-700` for secondary text) | Tested | T10 |
| 6 | Input borders visible (3:1) | Borders changed from default light grey to `gray-500` | Tested | T1, T10 |
| 7 | Everything works by keyboard | Notes and edits are real `<form>`s (Enter submits); Escape cancels an edit; skip link added | Tested | T7a, T4d |
| 8 | Focus is managed | Focus moves into the edit field when editing starts and back to the Edit button after save | Tested | T4a, T4b |
| 9 | Visible focus indicator | `focus:ring` on all inputs and buttons | Tested | T7b, T7c |
| 10 | Lists are real lists | Activities and plans use `<ul>/<li>` | Fixed in code | |
| 11 | Buttons say which item they act on | "Save plan" has hidden text "for <activity>" | Fixed in code | |
| 12 | Touch targets at least 24px | Edit button padded to about 36px | Tested | T11 |
| 13 | Errors say what happened and how to recover | Damaged saved data is backed up and reset with a notice; offline mode keeps working; load and save failures show a message with a way to retry | Partly tested: damaged data (T9) and offline (T6) were tested; a failed save and a failed load were not simulated | T6, T9a, T9b |

## Test results summary
Tests T1 to T11 all passed. See the results table in `TEST_PLAN.md`.

## Bugs fixed while doing this
- One shared note state meant text typed in one activity leaked into another, and clicking "Save Changes" without typing wiped the existing note. Notes are now stored per activity and the edit field has its own draft (tested in T3 and T4c).
- The offline banner promised "will sync when you reconnect" but nothing synced. Status is now honest: "Saved on device" when there is no backend, and "Sync pending" / "Synced" when one is configured.
- Corrupted saved data used to crash the app on load. It is now backed up and reset, and the user is told (tested in T9).
- Page had no styling because Tailwind v4 was installed with the old v3 setup (tested in T1).

## Not covered
- A real backend: the app currently stores plans on the device. The API layer (`src/api/plansApi.js`) is ready to connect to one by setting `VITE_API_BASE_URL`, but its endpoints are assumed and have not been tested against a real server.


