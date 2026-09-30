import { supabase } from '../supabase/client';
import { STORAGE_BUCKETS, MAX_FILE_SIZES } from './storageConfig';

export const uploadAvatar = async (userId, file) => {
  if (file.size > MAX_FILE_SIZES.AVATAR) {
    throw new Error('Avatar must be under 2MB');
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(filePath);

  return publicUrl;
};

export default uploadAvatar;
