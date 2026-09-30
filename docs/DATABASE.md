# Database Documentation

GroupSync utilizes PostgreSQL hosted on Supabase with Row Level Security (RLS) policies and Realtime publication.

## Core Tables
1. `profiles`: Extended user metadata, bio, XP, and credibility scores.
2. `groups` & `group_members`: Team collaboration entities and rosters.
3. `projects`: Portfolio projects and hackathon concepts.
4. `chat_messages` & `direct_messages`: Real-time campus communication.
5. `quizzes` & `quiz_attempts`: Skill verification engines.
6. `certificates`: Verified credentials and documents.
7. `notifications`: In-app alert dispatching.

See `database/schemas/` for comprehensive column-level documentation.
