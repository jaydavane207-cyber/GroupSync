import { supabase } from '../supabase/client';
import { STORAGE_BUCKETS } from './storageConfig';

export const uploadGenericFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path: data.path, publicUrl };
};

export default uploadGenericFile;
