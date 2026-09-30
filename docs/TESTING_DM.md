# GroupSync Phase 2 — Task 5: Direct Messaging Testing Guide

## Pre-requisites
1. The DM system reuses existing `groups` (type='DM'), `group_members`, and `messages` infrastructure.
2. Start dev server: `npm run dev`
3. Log in with two different users across two browser windows or tabs.

---

## Test 1: Access Direct Messages Inbox

**Steps:**
1. Click **Messages** in the sidebar (`/messages`).
2. Verify the inbox view displays:
   - Header with active conversation counters
   - Search bar
   - "New Message" button
   - List of active 1-on-1 conversations or empty state

---

## Test 2: Start a New Conversation with User Search

**Steps:**
1. On `/messages`, click **New Message**.
2. Modal opens with a search input.
3. Type the name of another student (e.g. Student B).
4. Click on Student B's search card.

**Expected:**
- Finds or auto-creates a private DM group between Student A and Student B in Supabase (`type: 'DM'`).
- Navigates immediately to `/messages/:targetUserId`.
- Header shows Student B's name, avatar/photo, college, and availability status.

---

## Test 3: Send Real-Time Text Messages

**Steps:**
1. In Student A's window (`/messages/:studentB_Id`), type a message and press Enter (or click Send).
2. Look at Student B's browser window.

**Expected:**
- Message appears optimistically for Student A with timestamp.
- Message appears instantly in real-time in Student B's window without page reload.
- Read receipt ticks (✓✓) update.

---

## Test 4: Typing Indicator

**Steps:**
1. With both users in the same DM room, begin typing in Student A's input box.
2. Inspect Student B's header area.

**Expected:**
- Student B sees `Typing...` appear in cyan beneath Student A's name.
- Stops typing for 2 seconds → indicator automatically clears.

---

## Test 5: Emoji Reactions & Message Editing

**Steps:**
1. Hover over a message received from Student B.
2. Click an emoji (e.g., ❤️ or 👍).
3. The reaction badge appears below the message in both tabs in real time.
4. On Student A's own message, click the Edit pencil icon.
5. Update message text and press Enter or click Save.

**Expected:**
- Message displays updated text and `(edited)` tag.
- Soft-delete: Clicking the Trash icon marks the message as deleted (`🚫 Message deleted`).

---

## Test 6: File & Image Attachment

**Steps:**
1. In the DM conversation, click the Paperclip (📎) icon.
2. Select an image (JPG/PNG).
3. File preview bar displays filename and size.
4. Click Send.

**Expected:**
- Progress bar indicates upload progress.
- File is uploaded to `chat-files` storage bucket.
- Image thumbnail renders directly in the chat bubble for both participants.

---

## Test 7: Unread Indicators on Inbox

**Steps:**
1. In Student A's tab, stay on `/dashboard` or `/messages`.
2. In Student B's tab, send a new DM to Student A.

**Expected:**
- Student A's `/messages` inbox displays a cyan unread indicator dot next to Student B's avatar.
- Opening the conversation marks messages as read and clears the indicator.

---

## Test 8: Mobile Responsiveness

**Steps:**
1. In Chrome DevTools, toggle Device Emulation (iPhone SE / 375px).
2. Visit `/messages` and `/messages/:targetUserId`.

**Expected:**
- Inbox, message thread, input bar, and header adapt to mobile viewport with clean spacing.
