/**
 * profileService.js — GroupSync User Profile Operations
 * Handles profile edits, avatar storage uploads, skill management,
 * peer endorsements, and dynamic credibility score calculations.
 */
import supabase from '@/lib/supabase';
import { withRetry } from '@/lib/withRetry';

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

// ─── AVATAR UPLOAD ────────────────────────────────────────────────────────────

/**
 * Upload an avatar image to Supabase Storage with progress tracking.
 */
export async function uploadAvatar(userId, file, onProgress) {
  if (!file) return { data: null, error: { userMessage: 'No image file selected.' } };

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { data: null, error: { userMessage: 'Please select a JPG, PNG, or WebP image.' } };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { data: null, error: { userMessage: 'Avatar image must be under 2MB.' } };
  }

  const ext = file.name.split('.').pop().toLowerCase();
  const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

  try {
    onProgress?.(15);
    const { error: uploadErr } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadErr) {
      return { data: null, error: { userMessage: 'Failed to upload avatar image.', raw: uploadErr } };
    }

    onProgress?.(85);
    const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Persist to profiles
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
    onProgress?.(100);

    return { data: { publicUrl }, error: null };
  } catch (err) {
    return { data: null, error: { userMessage: 'Upload error. Please check your connection.', raw: err } };
  }
}

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

/**
 * Update user profile details.
 */
export async function updateProfile(userId, updates) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  });
}

// ─── ENDORSEMENTS ─────────────────────────────────────────────────────────────

/**
 * Endorse a fellow student's skill.
 */
export async function endorseSkill(targetUserId, endorserId, skillName, message, endorserName) {
  if (targetUserId === endorserId) {
    return { data: null, error: { userMessage: 'You cannot endorse your own skills.' } };
  }

  return withRetry(async () => {
    // 1. Insert endorsement
    const { data, error } = await supabase
      .from('endorsements')
      .insert([{
        user_id: targetUserId,
        endorser_id: endorserId,
        skill_name: skillName,
        message: message?.trim() || null
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: { userMessage: 'You have already endorsed this skill.' } };
      }
      throw error;
    }

    // 2. Dispatch notification
    await supabase.from('notifications').insert([{
      user_id: targetUserId,
      type: 'teams',
      title: 'Skill Endorsement! ⭐',
      message: `${endorserName || 'A student'} endorsed your proficiency in ${skillName}!`,
      icon: '⭐',
      action_label: 'View Profile',
      action_path: '/profile'
    }]).catch(() => {});

    return { data, error: null };
  });
}

/**
 * Fetch all endorsements received by a user.
 */
export async function getEndorsements(userId) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('endorsements')
      .select(`
        id, skill_name, message, created_at,
        endorser:profiles!endorser_id(id, name, avatar, faction)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by skill
    const grouped = {};
    for (const item of (data || [])) {
      if (!grouped[item.skill_name]) grouped[item.skill_name] = [];
      grouped[item.skill_name].push(item);
    }

    return { data: { list: data || [], grouped }, error: null };
  });
}

// ─── CREDIBILITY BREAKDOWN ───────────────────────────────────────────────────

/**
 * Calculate full credibility score breakdown for a user.
 * Formula: Quiz (40%) + Certificate (35%) + Endorsements (20%) + Projects (5%)
 */
export async function getCredibilityBreakdown(userId) {
  try {
    const [badgesRes, certsRes, endorseRes, teamsRes] = await Promise.all([
      supabase.from('skill_badges').select('quiz_score').eq('user_id', userId),
      supabase.from('certificates').select('verification_status').eq('user_id', userId).eq('verification_status', 'verified'),
      supabase.from('endorsements').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('team_members').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    ]);

    const badges = badgesRes.data || [];
    const avgQuiz = badges.length > 0
      ? badges.reduce((acc, b) => acc + (b.quiz_score || 0), 0) / badges.length
      : 0;

    const quizPts = Math.min(40, Math.round((avgQuiz / 100) * 40));
    const certPts = (certsRes.data?.length || 0) > 0 ? 35 : 0;
    const endorseCount = endorseRes.count || 0;
    const endorsePts = Math.min(20, endorseCount * 5);
    const projCount = teamsRes.count || 0;
    const projPts = Math.min(5, projCount * 2.5);

    const totalScore = Math.min(100, Math.round(quizPts + certPts + endorsePts + projPts));

    return {
      total: totalScore,
      breakdown: {
        quiz: { score: quizPts, max: 40, count: badges.length },
        certificate: { score: certPts, max: 35, verified: certsRes.data?.length || 0 },
        endorsement: { score: endorsePts, max: 20, count: endorseCount },
        project: { score: projPts, max: 5, count: projCount }
      }
    };
  } catch (e) {
    return {
      total: 0,
      breakdown: {
        quiz: { score: 0, max: 40, count: 0 },
        certificate: { score: 0, max: 35, verified: 0 },
        endorsement: { score: 0, max: 20, count: 0 },
        project: { score: 0, max: 5, count: 0 }
      }
    };
  }
}

