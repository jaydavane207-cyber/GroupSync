import { supabase } from '../supabase/client';
import { STORAGE_BUCKETS, MAX_FILE_SIZES } from './storageConfig';

export const uploadCertificate = async (userId, file, certificateName = 'cert') => {
  if (file.size > MAX_FILE_SIZES.CERTIFICATE) {
    throw new Error('Certificate file must be under 5MB');
  }

  const cleanCertName = certificateName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}_${cleanCertName}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.CERTIFICATES)
    .upload(filePath, file, { upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.CERTIFICATES)
    .getPublicUrl(filePath);

  return publicUrl;
};

export default uploadCertificate;
