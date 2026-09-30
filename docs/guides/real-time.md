# Real-Time WebSockets & Pub/Sub

GroupSync powers live campus communications using Supabase Realtime channels.

## Active Channels
- `chat_messages`: Public campus chat messages (e.g. `general` channel).
- `direct_messages`: 1-on-1 private messaging subscriptions filtered by participant user IDs.
- `notifications`: Real-time toast alerts and badges.

## Subscribing
```javascript
import { subscribeToMessages } from '@/lib/supabase/subscriptions';

const subscription = subscribeToMessages('general', (newMessage) => {
  console.log('Received real-time message:', newMessage);
});
```
