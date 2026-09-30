export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    SESSION: '/auth/session',
  },
  USERS: {
    BASE: '/users',
    PROFILE: (id) => `/users/${id}/profile`,
    CREDIBILITY: (id) => `/users/${id}/credibility`,
  },
  TEAMS: {
    BASE: '/teams',
    DETAIL: (id) => `/teams/${id}`,
    MEMBERS: (id) => `/teams/${id}/members`,
    JOIN: (id) => `/teams/${id}/join`,
  },
  PROJECTS: {
    BASE: '/projects',
    DETAIL: (id) => `/projects/${id}`,
  },
  MESSAGES: {
    BASE: '/messages',
    CHANNEL: (id) => `/messages/channel/${id}`,
    DIRECT: (userId) => `/messages/direct/${userId}`,
  },
  QUIZ: {
    BASE: '/quizzes',
    SUBMIT: (id) => `/quizzes/${id}/submit`,
  },
};

export default API_ENDPOINTS;
