# GroupSync Phase 2 — Task 3: Team Management Testing Guide

## Pre-requisites
1. Run the SQL migration in Supabase Dashboard → SQL Editor:
   ```
   File: phase2_teams_migration.sql
   ```
2. Start the dev server: `npm run dev`
3. Login to GroupSync and click **Teams** in the sidebar (`/teams`).

---

## Test 1: Browse Teams & Real-Time Filter

**Steps:**
1. Navigate to `/teams`.
2. Verify seeded teams appear (e.g., *Neural Knights*, *DeFi Matrix*, *EcoSphere Campus*).
3. Test Category Filters:
   - Click `Hackathon`, `Projects`, `Research`, `Competition`, `All Teams`.
4. Test Status Toggle:
   - Check `Recruiting Only (Open Spots)` checkbox.
5. Test Search:
   - Type `Neural` in the search bar.
   - Filter by skill: Type `Python` in the skill filter.

**Expected:**
- Catalog updates instantly with matching teams.
- Cards show category badge, banner emoji, spots remaining, required skills pills, and member avatar stack.

---

## Test 2: Create a New Team

**Steps:**
1. Click **Create Team** button on `/teams`.
2. Navigates to `/teams/create`.
3. Choose a Banner Emoji (e.g. 🤖).
4. Enter Team Name: `AI Vision Squad`.
5. Select Category: `Hackathon`.
6. Enter Objective / Scope: `Building autonomous edge computer vision models for robot navigation.`
7. Add Skills: Enter `PyTorch`, `OpenCV`, `Python`.
8. Adjust Team Size slider (e.g., 4 members).
9. Click **Launch Team 🚀**.

**Expected:**
- Submits form and provisions team in Supabase.
- Auto-creates linked team chat group.
- Automatically inserts current user as team leader in `team_members`.
- Redirects to `/teams/:id` with new team details loaded.

---

## Test 3: Apply to Join Team (Candidate Flow)

**Steps:**
1. Open an incognito / second browser tab and log in as a second student (User B).
2. Browse `/teams` and click the team created by User A (`AI Vision Squad`).
3. Click **Apply to Join**.
4. In the modal, write pitch: `I have 2 years of OpenCV experience and would love to build vision pipelines with you.`
5. Click **Send Application**.

**Expected:**
- Application record is created in `team_applications` with `pending` status.
- Team leader (User A) receives a notification (`👥 New Team Application`).
- User B sees `Application pending` badge.

---

## Test 4: Leader Application Review (Accept / Reject)

**Steps:**
1. In User A's browser tab, view `AI Vision Squad` (`/teams/:id`).
2. Click **Candidate Applications** tab.
3. Verify User B's application card is visible with their pitch, avatar, and badges.
4. Click **Accept Candidate**.

**Expected:**
- Application status changes to `accepted`.
- User B is added to `team_members` and the team chat group.
- Team `current_members` count increments.
- User B receives a notification: `🎉 Application Accepted!`.
- User B's screen automatically updates via Supabase Realtime to show them as a team member.

---

## Test 5: Team Chat Integration

**Steps:**
1. As User A or User B, click **Team Chat** on `/teams/:id`.
2. Redirects to `/chat`.

**Expected:**
- Both teammates have access to the dedicated team conversation in Campus Chat.

---

## Test 6: Invite Teammates (Leader Flow)

**Steps:**
1. As team leader (User A), open `/teams/:id` and switch to **Invite Students** tab.
2. Type a student's name in the search box.
3. Select the student, enter an invitation note, and click **Send Invitation**.

**Expected:**
- Invitation is logged in `team_invitations`.
- Invitee receives an in-app notification: `📩 Team Invitation`.

---

## Test 7: Remove Member & Voluntary Departure

**Steps:**
1. **Remove Member (Leader)**:
   - On the Roster tab, leader clicks the remove button (UserX icon) next to User B.
   - Confirm removal dialog.
   - User B is removed from `team_members`, member count decrements, User B is notified.
2. **Leave Team (Member)**:
   - As a regular member, click **Leave Team** button in the team header.
   - Confirm departure.
   - Member is removed, leader is notified, and user is redirected to `/teams`.

---

## Test 8: Mobile Responsiveness

**Steps:**
1. In Chrome DevTools, toggle Device Emulation (iPhone SE / 375px width).
2. Visit `/teams`, `/teams/create`, and `/teams/:id`.

**Expected:**
- Filter bars, modals, roster grids, and form controls adapt cleanly to mobile viewports without overflow.

---

## SQL Verification Queries

Run in Supabase Dashboard → SQL Editor:

```sql
-- 1. Check all 4 team tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('teams', 'team_members', 'team_applications', 'team_invitations');

-- 2. Check team memberships
SELECT t.name, tm.role, p.name AS member_name
FROM public.teams t
JOIN public.team_members tm ON t.id = tm.team_id
JOIN public.profiles p ON tm.user_id = p.id;
```
