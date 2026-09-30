import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

// Note: To bypass RLS and delete tasks as an admin script, we usually need the service_role key.
// But the tasks table RLS says: "Authenticated users can delete tasks" USING (auth.role() = 'authenticated');
// We don't have a user session. Can we delete with anon key?
// Let's try, and if it fails due to RLS, we'll inform the user.
const supabase = createClient(url, key);

async function run() {
  // Let's at least try selecting them to see. Wait, "Tasks are viewable by everyone" USING (true);
  const { data: groups } = await supabase.from('groups').select('id, name').eq('name', 'Campus General').single();
  
  let query = supabase.from('tasks').delete().ilike('text', '%Test Task%');
  if (groups) {
    query = query.eq('group_id', groups.id);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Cleanup failed. RLS likely prevented deletion (requires authenticated user).", error);
  } else {
    console.log("Cleanup attempted.");
  }
}

run();
