export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  CERTIFICATES: 'certificates',
  PROJECT_ASSETS: 'project-assets',
  ATTACHMENTS: 'attachments',
};

export const MAX_FILE_SIZES = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  CERTIFICATE: 5 * 1024 * 1024, // 5MB
  ATTACHMENT: 10 * 1024 * 1024, // 10MB
};

export default { STORAGE_BUCKETS, MAX_FILE_SIZES };
