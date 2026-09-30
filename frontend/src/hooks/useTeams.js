import { useAppContext } from '@/context/AppContext';

export const useTeams = () => {
  const {
    groups,
    selectedGroupId,
    setSelectedGroupId,
    createGroup,
    joinGroup,
    leaveGroup,
    fetchGroups,
    loading,
  } = useAppContext();

  return {
    teams: groups,
    groups,
    selectedGroupId,
    setSelectedGroupId,
    createTeam: createGroup,
    createGroup,
    joinTeam: joinGroup,
    joinGroup,
    leaveTeam: leaveGroup,
    leaveGroup,
    refreshTeams: fetchGroups,
    loading,
  };
};

export default useTeams;

