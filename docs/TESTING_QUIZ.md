# GroupSync Phase 2 — Task 2: Skill Verification & Quiz System Testing Guide

## Pre-requisites
1. Run the SQL migration in Supabase Dashboard → SQL Editor:
   ```
   File: phase2_quiz_migration.sql
   ```
2. Create the `certificates` Storage bucket in Supabase Dashboard → Storage:
   - Name: `certificates`
   - Public: ✅ (or configure RLS policy for authenticated users)
3. Start dev server: `npm run dev`
4. Login to GroupSync and navigate to **Skill Quizzes** via the sidebar (`/quiz`)

---

## Test 1: Browse Available Quizzes

**Steps:**
1. Click **Skill Quizzes** in the sidebar (navigates to `/quiz`).
2. Verify quiz catalog displays seeded quizzes:
   - JavaScript Fundamentals (Beginner)
   - React Hooks & State (Intermediate)
   - Python Data Structures (Beginner)
   - SQL & Database Design (Intermediate)
   - System Design Basics (Advanced)
3. Filter by difficulty: Click `Beginner`, `Intermediate`, `Advanced`, `All`.
4. Search by keyword: Type `React` in the search bar.

**Expected:**
- Catalog updates instantly with matching quizzes.
- Each card shows difficulty pill, duration, question count, and passing threshold.

---

## Test 2: Take a Quiz (MCQ, True/False, Short Answer)

**Steps:**
1. Click **Start Quiz** on `JavaScript Fundamentals`.
2. Navigates to `/quiz/:id/take`.
3. Verify timer begins countdown (e.g., 20:00).
4. Answer Question 1 (MCQ): Select an option (radio style card highlights with cyan border).
5. Navigate using `Next` or question navigator dots (1 to 10).
6. Answer True/False questions (click True or False).
7. Answer Short Answer questions (type text).

**Expected:**
- Selected answers persist when moving between questions.
- Answered questions turn cyan in the bottom dot navigation bar.
- Auto-save silently updates attempt progress in Supabase.

---

## Test 3: Pause & Resume Quiz

**Steps:**
1. During an active quiz, click the **Pause** icon (⏸️) in the top header.
2. Verify quiz is paused with a "Quiz Paused" card and timer stops.
3. Click **Resume Quiz** or navigate back to `/quiz`.
4. The quiz card now displays **Resume Quiz** button.
5. Click **Resume Quiz** — answers and remaining time are restored.

**Expected:**
- Quiz state and time remaining accurately resume from Supabase.

---

## Test 4: Submit Quiz & View Results / Score

**Steps:**
1. Answer all questions and click **Submit Quiz** (or let timer reach 0:00).
2. Confirmation modal displays number of answered/unanswered questions.
3. Confirm submission.
4. Navigates to `/quiz/:id/results`.

**Expected:**
- Score card displays percentage (e.g., 80%), correct count (8/10), and pass/fail banner.
- Question Review section details every question, user answer, correct answer, and explanation.

---

## Test 5: Badge Awarding & Tier System

**Steps:**
1. If score >= 60%:
   - 60–74%: Bronze Badge 🥉
   - 75–84%: Silver Badge 🥈
   - 85–94%: Gold Badge 🥇
   - 95–100%: Platinum Badge 💎
2. Badge award celebration appears on results page.
3. Click **View My Badges** (navigates to `/badges`).

**Expected:**
- New verified badge appears under "Earned Skill Badges" in `/badges`.
- Credibility rating updates automatically based on verified quiz score.

---

## Test 6: Verified Certificate Generation & PDF Download

**Steps:**
1. On `/quiz/:id/results` for a passed quiz, inspect the **Verified Skill Certificate** card.
2. Check student name, skill name, tier, score, and issue date.
3. Click **Download / Print PDF**.

**Expected:**
- Browser print dialog opens with certificate formatted for printing or saving as PDF.

---

## Test 7: Upload Professional Certificate

**Steps:**
1. Navigate to **Badges & Certs** (`/badges`) from the sidebar.
2. Click **Add Certificate** button in top right.
3. Fill in the modal form:
   - Certificate Name: `AWS Certified Solutions Architect`
   - Issuing Organization: `Amazon Web Services`
   - Issue Date: Select date
   - Credential URL: `https://aws.amazon.com/verification`
   - Upload a sample PDF or PNG image.
4. Click **Submit for Review**.

**Expected:**
- Upload progress bar animates.
- Toast confirmation: "Certificate submitted for review! ⏳".
- Certificate card appears under "Certificates & Credentials" with status `⏳ Pending Review`.
- File is uploaded to Supabase Storage `certificates/` bucket.

---

## Test 8: Mobile Responsiveness

**Steps:**
1. Open Chrome DevTools → Toggle device emulation (iPhone SE / 375px width).
2. Browse `/quiz`, `/quiz/:id/take`, `/quiz/:id/results`, and `/badges`.

**Expected:**
- Quiz layout, timers, navigation dots, and cards fit cleanly on mobile screens without horizontal scroll.

---

## SQL Verification

Run in Supabase Dashboard → SQL Editor:

```sql
-- 1. Check all 7 new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'quizzes',
    'quiz_questions',
    'quiz_attempts',
    'quiz_answers',
    'certificates',
    'skill_badges',
    'user_skills'
  );

-- 2. Verify seeded quizzes and questions count
SELECT q.title, COUNT(qq.id) AS question_count
FROM public.quizzes q
LEFT JOIN public.quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title;
```
