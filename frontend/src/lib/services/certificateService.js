/**
 * certificateService.js — GroupSync Certificate Management
 * Upload, store, and display professional certificates with verification status.
 */
import supabase from '@/lib/supabase';
import { withRetry } from '@/lib/withRetry';

const CERT_BUCKET = 'certificates';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ─── UPLOAD CERTIFICATE FILE ──────────────────────────────────────────────────

/**
 * Upload a certificate file (PDF/image) to Supabase Storage.
 * @param {string} userId
 * @param {File} file
 * @param {Function} [onProgress] - (percent: number) => void
 * @returns {{ data: { publicUrl, path }, error }}
 */
export async function uploadCertificateFile(userId, file, onProgress) {
  if (!file) return { data: null, error: { userMessage: 'No file provided.', retryable: false } };

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { data: null, error: { userMessage: 'Only PDF, JPG, PNG, or WebP files are accepted.', retryable: false } };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { data: null, error: { userMessage: 'File too large (5MB max).', retryable: false } };
  }

  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    onProgress?.(10);
    const { error } = await supabase.storage.from(CERT_BUCKET).upload(path, file, {
      cacheControl: '3600', upsert: false,
    });
    if (error) return { data: null, error: { userMessage: 'Upload failed. Please try again.', retryable: true, raw: error } };

    onProgress?.(90);
    const { data: urlData } = supabase.storage.from(CERT_BUCKET).getPublicUrl(path);
    onProgress?.(100);

    return { data: { publicUrl: urlData.publicUrl, path }, error: null };
  } catch (err) {
    return { data: null, error: { userMessage: 'Upload failed. Check your connection.', retryable: true, raw: err } };
  }
}

// ─── SAVE CERTIFICATE METADATA ────────────────────────────────────────────────

/**
 * Save certificate metadata to the database.
 * @param {object} metadata
 * @param {string} metadata.userId
 * @param {string} metadata.certificateName
 * @param {string} metadata.issuingOrganization
 * @param {string} metadata.issueDate       - ISO date string
 * @param {string} [metadata.expirationDate]
 * @param {string} [metadata.credentialId]
 * @param {string} [metadata.credentialUrl]
 * @param {string} [metadata.fileUrl]        - Storage public URL
 * @param {string} [metadata.category]       - professional/academic/technical
 */
export async function saveCertificate(metadata) {
  const {
    userId, certificateName, issuingOrganization, issueDate,
    expirationDate, credentialId, credentialUrl, fileUrl, category = 'professional'
  } = metadata;

  if (!certificateName?.trim()) return { data: null, error: { userMessage: 'Certificate name is required.', retryable: false } };
  if (!issuingOrganization?.trim()) return { data: null, error: { userMessage: 'Issuing organization is required.', retryable: false } };
  if (!issueDate) return { data: null, error: { userMessage: 'Issue date is required.', retryable: false } };

  return withRetry(() =>
    supabase.from('certificates').insert([{
      user_id: userId,
      certificate_name: certificateName.trim(),
      issuing_organization: issuingOrganization.trim(),
      issue_date: issueDate,
      expiration_date: expirationDate || null,
      credential_id: credentialId?.trim() || null,
      credential_url: credentialUrl?.trim() || null,
      certificate_file_url: fileUrl || null,
      category,
      verification_status: 'pending',
    }]).select().single()
  );
}

// ─── GET CERTIFICATES ─────────────────────────────────────────────────────────

/** Get all certificates for a user */
export async function getCertificates(userId) {
  return withRetry(() =>
    supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false })
  );
}

/** Delete a certificate (and optionally its file from Storage) */
export async function deleteCertificate(certId, userId, storagePath) {
  const { error } = await supabase.from('certificates').delete()
    .eq('id', certId).eq('user_id', userId);
  if (error) return { error };

  // Best-effort: remove file from storage
  if (storagePath) {
    await supabase.storage.from(CERT_BUCKET).remove([storagePath]).catch(() => {});
  }
  return { error: null };
}

// ─── VERIFICATION STATUS HELPERS ─────────────────────────────────────────────

export function getVerificationBadge(status) {
  switch (status) {
    case 'verified':  return { emoji: '✅', label: 'Verified',       color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' };
    case 'rejected':  return { emoji: '❌', label: 'Rejected',       color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/30' };
    default:          return { emoji: '⏳', label: 'Pending Review',  color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30' };
  }
}

/** Check if certificate is expiring soon (within 30 days) */
export function isExpiringSoon(expirationDate) {
  if (!expirationDate) return false;
  const daysLeft = (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return daysLeft > 0 && daysLeft <= 30;
}

/** Check if certificate is expired */
export function isExpired(expirationDate) {
  if (!expirationDate) return false;
  return new Date(expirationDate).getTime() < Date.now();
}

