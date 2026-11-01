# STEMMate Namibia: Role 3 test plan

**Tester:** Jurgen  **Date:** ____  **Browser:** Google Chrome  **Address:** http://localhost:5173

## T1. The page is styled
**Why:** Your partner's version had no styling because Tailwind was set up for the wrong version. This confirms it is fixed.
**Steps:**
1. Make the Chrome window wide (full screen).
2. Look at the page.

**Expected:** Blue "STEMMate Namibia" heading, green "Online" badge top right, two activity cards with rounded borders and a blue button, and a "Your Saved Plans" column on the right with "No plans saved yet."

---

## T2. Save a plan
**Why:** Proves plan creation works and that the confirmation is shown.
**Steps:**
1. In the **DIY Water Filter** card, click the note box and type `Need extra sand`.
2. Click **Save plan on this device**.
3. Look straight away under the page header, just below the heading line.

**Expected:**
- A blue message appears for about 5 seconds: *"Plan for DIY Water Filter saved. Saved on device."*
- The "Your Saved Plans" column now has a card titled **Plan for DIY Water Filter**, with *Status: Saved on device* and *Note: Need extra sand*.
- The note box in the card is empty again.

---

## T3. Notes no longer leak between activities
**Why:** The original code used one shared note, so text typed in one activity appeared in the other.
**Steps:**
1. In **DIY Water Filter**, type `AAA` in the note box. Do **not** save.
2. Scroll down and look at the **Simple Circuits** note box.
3. Click in the Simple Circuits box and type `BBB`. Scroll back up.
4. Look at the Water Filter box again.

**Expected:** Water Filter box says `AAA`, Simple Circuits box says `BBB`. Neither one copies the other.
**Afterwards:** clear both boxes.

---

## T4. Edit a plan
**Why:** Proves editing works, focus moves correctly, and the "wiped note" bug is gone.

**T4a. Focus moves into the edit box**
1. In the saved plan card, click the **pencil icon**.
2. Without clicking anywhere else, look at the page.

**Expected:** An edit box appears containing the old note, with a blue ring around it and the text cursor already inside it. You can start typing immediately.

**T4b. Save a change**
1. Change the text to `Need extra sand and charcoal`.
2. Click **Save changes**.

**Expected:** The card shows the new note. A blue message says *"Changes to Plan for DIY Water Filter saved."* After saving, the blue focus ring is on the pencil button (keyboard focus returned there).

**T4c. Saving without typing keeps the note** (this was a bug)
1. Click the pencil again.
2. Do **not** type anything. Click **Save changes**.

**Expected:** The note is still `Need extra sand and charcoal`. It is not blank.

**T4d. Cancel with Escape**
1. Click the pencil, type some extra letters, then press the **Esc** key.

**Expected:** The edit box closes and the note is unchanged.

---

## T5. Plans survive a refresh
**Why:** This is the "recovery" idea at its simplest: your work is not lost.
**Steps:**
1. Press **F5** to refresh the page.

**Expected:** The saved plan is still there with the updated note.

---

## T6. Offline mode
**Why:** The app is meant for teachers with unreliable internet, so it must work offline.
**Steps:**
1. Press **F12**. Click the **Network** tab.
2. Find the dropdown that says **No throttling** and change it to **Offline**.
3. Look at the page header.
4. Type a note in **Simple Circuits** and click **Save plan on this device**.
5. Afterwards, change the dropdown back to **No throttling**.

**Expected:**
- The badge changes to a red **Offline mode**, and a yellow banner says *"You are offline. Your work is saved on this device."*
- The save still works and the new plan appears.
- When you go back online, the badge returns to green **Online** and the yellow banner disappears.

---

## T7. Keyboard only
**Why:** People who cannot use a mouse must be able to do everything.
**Steps:**
1. Refresh the page. Click on a blank part of the page, then put your mouse aside.
2. Press **Tab** once.
3. Keep pressing **Tab**, watching what is highlighted each time. The order should be: skip link, search box, first note box, first Save button, second note box, second Save button, then the pencil button(s).
4. Click in a note box with Tab, type `kb test`, and press **Enter**.

**Expected:**
- First Tab shows a white box in the top left reading **Skip to main content**.
- Every box and button gets a clear blue ring when it is selected.
- Enter in the note box saves the plan (blue message appears).

---

## T8. Search and "no results"
**Steps:**
1. Click the search box, type `xyz`.
2. Click **Clear search**.
3. Type `physics`.

**Expected:**
- `xyz`: the message *"No activities match your search."* appears with a **Clear search** link.
- Clear search: the box empties and both activities return.
- `physics`: only **Simple Circuits** shows.

---

## T9. Recovery from damaged saved data
**Why:** If saved data gets corrupted, the app should not crash. It should tell the user and keep a backup.
**Steps:**
1. Make sure you have saved at least one plan (T2).
2. Press **F12**, open the **Application** tab. If you cannot see it, click the `>>` arrows in the tab bar.
3. On the left, open **Local storage** and click **http://localhost:5173**.
4. Find the row named `stemmate_plans`. Double-click its **Value** cell, delete everything, type `{broken`, and press Enter.
5. Press **F5** to refresh. Look at the page straight away.
6. Click the refresh icon in the Application panel (top of the table) to update the list.

**Expected:**
- The page still loads normally (no blank screen).
- A blue message for about 5 seconds: *"Some saved data on this device was damaged and has been reset. A backup copy was kept."*
- Saved Plans is empty.
- The Local Storage table now has a key `stemmate_plans_backup` containing `{broken`.

---

## T10. Lighthouse accessibility audit
**Why:** An automatic check across the whole page.
**Steps:**
1. Refresh the page and clear any messages.
2. Press **F12** and click the **Lighthouse** tab (under `>>` if hidden).
3. Choose **Mode: Navigation**, **Device: Desktop**, and tick **only Accessibility** (untick the other categories).
4. Click **Analyze page load** and wait about 30 seconds.

**Expected:** A score of 90 or more is good. Under it you will see "Passed audits" and possibly some failures.

---

## T11. Phone layout
**Steps:**
1. Press **Ctrl + Shift + M** in Chrome (device toolbar).
2. At the top, choose a phone such as **iPhone SE** or **Pixel 7**.
3. Scroll through the page.

**Expected:** One column: activities first, then saved plans. No sideways scrolling. Buttons are easy to tap.

---

## T12. Screen reader (optional but valuable)
**Steps:**
1. Press **Win + Ctrl + Enter** to turn on Windows Narrator.
2. Click in the page and use **Tab** to move around. Listen to what is read out for the search box, note boxes and buttons.
3. Save a plan and listen.
4. Turn Narrator off with **Win + Ctrl + Enter**.

**Expected:** Fields are announced with their labels (for example "Search activities", "Add a note to the plan"). The pencil button is read as "Edit note for Plan for DIY Water Filter". After saving you hear "Plan for DIY Water Filter saved".
Write down what you heard in the Notes column of the results table.

---

## Results

| Test | What it checks | Pass / Fail | Notes |
|------|----------------|-------------|-------|
| T1 | Page is styled | Pass | |
| T2 | Save a plan, confirmation shown | Pass | |
| T3 | Notes do not leak between activities | Pass | |
| T4a | Focus moves into edit box | Pass | |
| T4b | Edit saves, focus returns to pencil | Pass | |
| T4c | Saving without typing keeps note | Pass | |
| T4d | Escape cancels edit | Pass | |
| T5 | Plans survive refresh | Pass | |
| T6 | Offline banner and saving offline | Pass | |
| T7 | Keyboard only, skip link, focus rings | Pass | |
| T8 | Search and no-results message | Pass | |
| T9 | Recovery from damaged data | Pass | |
| T10 | Lighthouse accessibility score: 100 | Pass | |
| T11 | Phone layout | Pass | |
| T12 | Screen reader (optional) | | |
