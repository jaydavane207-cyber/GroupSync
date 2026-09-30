import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';

export const uploadService = {
  async uploadFile(bucket, filePath, file) {
    return withRetry(async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      return { path: data.path, publicUrl };
    });
  },

  async getPublicUrl(bucket, filePath) {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    return publicUrl;
  },
};

export default uploadService;

