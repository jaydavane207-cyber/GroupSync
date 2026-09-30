// E2E test specification for user authentication flow
export const loginSpec = {
  name: 'User Login Flow',
  steps: ['Visit /login', 'Fill email & password', 'Submit form', 'Verify redirect to /dashboard'],
};
