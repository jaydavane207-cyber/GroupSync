// E2E test specification for creating a team
export const createTeamSpec = {
  name: 'Create Team Flow',
  steps: ['Visit /teams/create', 'Enter team name and description', 'Submit', 'Verify team in /teams'],
};
