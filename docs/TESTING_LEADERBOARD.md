# GroupSync Phase 2 — Task 6: Leaderboard Individual Rankings Testing Guide

## Pre-requisites
1. The Leaderboard system connects to `profiles` and `skill_badges` in Supabase.
2. Start dev server: `npm run dev`
3. Navigate to **Leaderboard** via sidebar (`/leaderboard`).

---

## Test 1: View Mode Switcher

**Steps:**
1. Navigate to `/leaderboard`.
2. Notice the switcher at the top:
   - **Faction Standings**
   - **Individual Rankings**
3. Click **Faction Standings** → verify existing Faction cards with live counts and top 3 student members.
4. Click **Individual Rankings** → verify transition to the individual student rankings table.

---

## Test 2: Current User Standing Banner

**Steps:**
1. In **Individual Rankings** view, inspect the top banner.
2. Verify:
   - Large rank badge shows your exact rank position (e.g., `#1`, `#2`, `#14`).
   - "Your Standing" badge is displayed next to your name.
   - Total XP and Credibility % match your profile.

---

## Test 3: Filter by Faction & Search

**Steps:**
1. In the search box, type a student's name (e.g., "Alex" or "Jay").
2. The table filters immediately to matching students.
3. In the Faction dropdown, select a specific faction (e.g. `Solarians`).
4. The table filters to show only members of that faction.
5. Select `All Factions` and clear search → all students restore.

---

## Test 4: Student Ranking Table Details

**Steps:**
1. Review the rows in the table:
   - **Top 3 Ranks:** 🥇 #1 (Gold), 🥈 #2 (Silver), 🥉 #3 (Bronze) styled with distinct colors.
   - **Current User Row:** Highlighted with a cyan background accent and `YOU` badge.
   - **Verified Badges:** Shows real badges earned (💎 Platinum, 🥇 Gold, etc.).
   - **Credibility Index:** Shows composite credibility percentage and visual bar.
   - **Total XP:** Formatted in bold cyan (e.g., `1,250 XP`).

---

## Test 5: Real-Time XP & Rankings Sync

**Steps:**
1. Open two browser windows:
   - Window A: Leaderboard (`/leaderboard` on Individual Rankings)
   - Window B: Skill Quizzes (`/quiz`)
2. In Window B, complete a quiz and earn XP and a badge.
3. Observe Window A.

**Expected:**
- The profiles table updates in real time via Supabase Realtime channel.
- Leaderboard rankings shift dynamically without page refresh.

---

## Test 6: Mobile Responsiveness

**Steps:**
1. In Chrome DevTools, switch to Mobile view (iPhone SE / 375px).
2. Visit `/leaderboard` on both Faction and Individual views.

**Expected:**
- Horizontal scroll on the rankings table prevents clipping.
- Search and dropdown stack responsively.
