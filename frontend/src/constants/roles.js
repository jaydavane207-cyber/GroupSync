export const USER_ROLES = {
  LEADER: 'leader',
  MEMBER: 'member',
  ADMIN: 'admin',
  GUEST: 'guest',
};

export const PERMISSIONS = {
  CREATE_PROJECT: ['leader', 'admin'],
  INVITE_MEMBERS: ['leader', 'admin'],
  EDIT_TEAM: ['leader', 'admin'],
  DELETE_TEAM: ['leader', 'admin'],
  SEND_MESSAGES: ['leader', 'member', 'admin'],
};

export default { USER_ROLES, PERMISSIONS };
