# GroupSync Phase 2 — Task 1: Group Chat Testing Guide

## Pre-requisites
1. Run the SQL migration in Supabase Dashboard → SQL Editor:
   ```
   File: phase2_chat_migration.sql
   ```
2. Create the `chat-files` Storage bucket in Supabase Dashboard → Storage:
   - Name: `chat-files`
   - Public: ✅ (or configure RLS policy for authenticated users)
3. Start dev server: `npm run dev`
4. Open two browser tabs, log in as two different users

---

## Test 1: Send Text Message (Optimistic Update)

**Steps:**
1. Open Campus Chat → Campus General channel
2. Type a message and press Enter (or click Send)

**Expected:**
- Message appears immediately (optimistic, slightly faded)
- "Sending..." indicator briefly visible
- Message fully appears with timestamp once saved to DB
- Second browser tab shows the message appear in real-time

---

## Test 2: File Upload with Progress Bar

**Steps:**
1. Click the paperclip (📎) button
2. Select an image (JPG/PNG under 10MB)

**Expected:**
- Image preview appears above input bar
- On Send: progress bar appears (0→100%)
- After upload: image thumbnail shows in chat bubble
- File appears in Supabase Storage: `chat-files/` bucket

**Test error case:**
- Select a file over 10MB → should see "File too large (10MB max)" toast

---

## Test 3: Message Reactions (Real-Time)

**Steps:**
1. Hover over any message (from another user)
2. Reaction bar appears: 👍 ❤️ 😂 🎉 😢 🔥
3. Click 👍

**Expected:**
- 👍 reaction appears immediately (optimistic)
- Reaction saved to `message_reactions` table
- In second tab: reaction appears without refresh
- Click 👍 again → reaction removed (toggle)
- Reaction count updates correctly (e.g., "👍 2")

**Check in Supabase Dashboard:**
- Table `message_reactions` has a row with correct `message_id`, `user_id`, `emoji`

---

## Test 4: Edit Message (5-Minute Window)

**Steps:**
1. Send a message
2. Hover over your message → click ••• → Edit
3. Change the text → press Enter to save (or Escape to cancel)

**Expected:**
- Inline editor appears in place of the message bubble
- After save: message shows updated text + "(edited)" label
- Edit saved to DB: `messages.is_edited = true`, `messages.edited_at` set

**Test time restriction:**
- Wait 5 minutes, try to edit → should see "Messages can only be edited within 5 minutes of sending."

**Test error case:**
- Edit to empty text → save should cancel (no empty messages)

---

## Test 5: Delete Message (Soft Delete)

**Steps:**
1. Send a message
2. Hover → ••• → Delete

**Expected:**
- Message immediately shows "🚫 Message deleted" placeholder
- Other users see the same deleted placeholder in real-time
- DB: `messages.is_deleted = true` (row not removed)

---

## Test 6: Message Search + Jump-To

**Steps:**
1. Click the 🔍 search icon in the chat header
2. Type a word that appears in a past message

**Expected:**
- Dropdown shows matching messages with sender name + timestamp
- Keyword highlighted in yellow in results
- Click a result → chat scrolls to that message → message flashes with cyan highlight

**Test empty search:**
- Search for a word that doesn't exist → "No messages found for ..."

---

## Test 7: Read Receipts (✓✓ Ticks)

**Steps:**
1. As User A, send a message to User B (DM or general)
2. As User B, open/view the conversation

**Expected:**
- Under User A's message: ✓✓ turns cyan (indicating read)
- Hovering over ✓✓ shows "Read at HH:MM"

**Check in DB:**
- `read_receipts` table has a row for User B with `last_read_message_id`

---

## Test 8: Infinite Scroll Pagination

**Steps:**
1. In a chat with many messages (>50), scroll to the very top

**Expected:**
- "Load older messages" button appears at top
- Click it → older 50 messages prepend to the list
- Scroll position maintained (page doesn't jump)
- When all messages loaded: button disappears

---

## Test 9: Typing Indicator

**Steps:**
1. Open same chat in two tabs (two different users)
2. Start typing in User A's tab

**Expected:**
- User B's tab shows "User A is typing..." with bouncing dots
- If User A stops typing for 2 seconds: indicator disappears
- If multiple users type: "User A and User B are typing..."

---

## Test 10: Offline Queue

**Steps:**
1. In browser DevTools → Network → set to "Offline"
2. Type a message, press Send

**Expected:**
- Message appears with 📶 "Queued" indicator
- Offline banner appears: "You are offline. 1 message queued."
- Re-enable network
- Queued message automatically sends and status changes

---

## Test 11: Message Context Menu

**Steps:**
1. Hover over any message → click ••• (3 dots)

**Expected:**
- Context menu shows: Reply, Edit (if own + within 5 min), Delete (if own)
- Edit/Delete only for own messages
- Reply available for all messages

---

## Test 12: Mobile Responsiveness (375px)

**Steps:**
1. Open Chrome DevTools → Device emulation → iPhone SE (375px)
2. Navigate to /chat

**Expected:**
- Chat sidebar collapses or stacks appropriately
- Input bar is full-width and touch-friendly
- Messages are readable and properly aligned
- File picker works on mobile (tap paperclip)

---

## Verification Checklist

| Feature | Tested | Result |
|---------|--------|--------|
| Send message → optimistic update | | |
| Real-time across tabs | | |
| File upload (image) with progress | | |
| File upload (document) | | |
| Emoji reactions (add) | | |
| Emoji reactions (remove / toggle) | | |
| Reactions real-time | | |
| Edit message (inline) | | |
| Edit time limit (5 min) | | |
| Delete (soft) | | |
| Delete real-time | | |
| Search messages | | |
| Jump-to-message highlight | | |
| Read receipts (✓✓ cyan) | | |
| Infinite scroll load more | | |
| Typing indicator | | |
| Offline queue | | |
| Auto-send on reconnect | | |
| Context menu (Reply/Edit/Delete) | | |
| Mobile responsive 375px | | |
| No console errors | | |
| Build: `npm run build` passes | | |

---

## SQL Verification

Run in Supabase Dashboard → SQL Editor:

```sql
-- Check new columns exist on messages
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'messages' AND table_schema = 'public'
  AND column_name IN ('is_edited', 'is_deleted', 'edited_at', 'message_type', 'file_url', 'reply_to_id')
ORDER BY column_name;

-- Check new tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('message_reactions', 'read_receipts');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('message_reactions', 'read_receipts');
```

All queries should return expected results.
