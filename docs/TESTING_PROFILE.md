# GroupSync Phase 2 — Task 4: User Profile & Endorsements Testing Guide

## Pre-requisites
1. Run the SQL migration in Supabase Dashboard → SQL Editor:
   ```
   File: phase2_profile_migration.sql
   ```
2. Create the `avatars` Storage bucket in Supabase Dashboard → Storage:
   - Name: `avatars`
   - Public: ✅ (or configure RLS policy for authenticated users)
3. Start dev server: `npm run dev`
4. Login to GroupSync and navigate to **Profile** via sidebar (`/profile`).

---

## Test 1: Full Profile Edit

**Steps:**
1. Navigate to `/profile`.
2. Click the **Edit Profile** button in the top hero card.
3. Navigates to `/profile/edit`.
4. Modify details:
   - Name: Edit full name
   - Location: `Engineering Quad, Room 304`
   - Availability: Select `Seeking Project Collaborators`
   - Personality Fit: Select `Architect (INTJ)`
   - Bio: Update biography
5. Click **Save Profile Changes**.

**Expected:**
- Toast notification: `Profile updated successfully! ✨`.
- Redirects back to `/profile`.
- Hero card immediately shows updated name, location tag (`📍 Engineering Quad, Room 304`), and availability badge (`🕒 Seeking Project Collaborators`).

---

## Test 2: Avatar Upload with Progress Bar

**Steps:**
1. On `/profile/edit`, click on the profile photo or click **Choose Image**.
2. Select a local JPG or PNG image (under 2MB).
3. Verify local image preview displays immediately.
4. Click **Save Profile Changes**.

**Expected:**
- Upload progress bar animates (0% → 100%).
- File is uploaded to Supabase Storage in the `avatars/` bucket.
- Profile `avatar_url` is updated in the database.
- Avatar image displays cleanly in the hero card on `/profile`.

**Test error case:**
- Try uploading a file over 2MB → toast warning: `Avatar image must be under 2MB`.

---

## Test 3: Technical Skills Management

**Steps:**
1. On `/profile/edit`, scroll to **Technical Skillsets**.
2. Add a new skill (e.g. `Solidity` or `Next.js`).
3. Remove an unwanted skill by clicking the `✕` on its tag.
4. Click **Save Profile Changes**.

**Expected:**
- Updated skills appear under the Skills HoloPanel on `/profile`.

---

## Test 4: Dynamic Credibility Score & Breakdown

**Steps:**
1. View `/profile` → **Overview** tab.
2. Scroll to **Skill Credibility Score & Badges** HoloPanel.

**Expected:**
- Credibility rating shows composite score out of 100%.
- 4 progress breakdown bars display:
  - **Quizzes**: (up to 40 pts) calculated from average passed quiz scores.
  - **Certificates**: (up to 35 pts) based on verified uploaded certificates.
  - **Endorsements**: (up to 20 pts) based on received peer endorsements.
  - **Projects**: (up to 5 pts) based on active team memberships.
- Earned badges display real earned tiers (Platinum 💎, Gold 🥇, Silver 🥈, Bronze 🥉).

---

## Test 5: Peer Endorsements

**Steps:**
1. Log in as Student B in a second browser session.
2. Visit Student A's profile or Campus Chat.
3. Student A's skills display their endorsement counts (e.g. `⭐ 1`).
4. Endorsements are stored in the `endorsements` table.

---

## Test 6: Mobile Responsiveness

**Steps:**
1. In DevTools, toggle Device Emulation (iPhone SE / 375px).
2. Visit `/profile` and `/profile/edit`.

**Expected:**
- Photo uploader, forms, dropdowns, HoloPanels, and credibility bars fit without horizontal overflow.

---

## SQL Verification Queries

Run in Supabase Dashboard → SQL Editor:

```sql
-- 1. Check extended profile columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('avatar_url', 'location', 'availability', 'personality_type', 'credibility_score');

-- 2. Check endorsements table
SELECT * FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'endorsements';
```
