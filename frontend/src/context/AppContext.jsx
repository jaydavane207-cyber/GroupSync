import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import supabase from '@/lib/supabase';
import { MOCK_FACTIONS } from '@/data/mockData';
import { withRetry } from '@/lib/withRetry';

const AppContext = createContext();

const getInitialTheme = () => {
  const saved = localStorage.getItem('gs-theme');
  if (saved) return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
};

export const AppProvider = ({ children }) => {
  const [user, setUserRaw] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeGroups: 0,
    openHackathons: 0,
    onlineMembers: 0,
    aiMatches: 0
  });
  const [theme, setThemeState] = useState(getInitialTheme);
  const [toast, setToast] = useState(null);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  // Track user state in a ref so auth listener can check without stale closure
  const userRef = useRef(null);

  const setUserState = (val) => {
    userRef.current = val;
    setUserRaw(val);
  };

  // Safe merge: updates only the specified fields in the user state,
  // without wiping other fields (e.g. bio, cgpa, social_links, onboardingComplete).
  const mergeUserState = (partial) => {
    setUserRaw(prev => {
      const merged = { ...prev, ...partial };
      userRef.current = merged;
      return merged;
    });
  };

  const fetchGroups = useCallback(async () => {
    // Fetch groups and their members using a join or separate query
    const { data: groupsData, error: groupsError } = await supabase.from('groups').select('*, group_members(profile_id)');
    
    if (!groupsError && groupsData) {
      // Deduplicate replicate groups (such as duplicate Team chat groups)
      const seenGroupKeys = new Set();
      const uniqueGroups = groupsData.filter(g => {
        if (!g || !g.id) return false;
        const key = g.type === 'Team'
          ? `team::${(g.name || '').trim().toLowerCase()}::${g.admin_id || ''}`
          : `group::${g.id}`;
        if (seenGroupKeys.has(key)) return false;
        seenGroupKeys.add(key);
        return true;
      });

      const mappedGroups = uniqueGroups.map(g => ({
        ...g,
        adminId: g.admin_id,
        maxMembers: Math.min(g.max_members || g.maxMembers || 10, 10),
        memberIds: g.group_members?.map(m => m.profile_id) || []
      }));
      setGroups(mappedGroups.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } else if (groupsError) {
      console.error('Error fetching groups:', groupsError);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error) setStudents(data);
    else console.error('Error fetching students:', error);
  }, []);

  const fetchStats = useCallback(async () => {
    const { count: groupCount } = await supabase.from('groups').select('*', { count: 'exact', head: true });
    const { count: hackathonCount } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('type', 'Hackathon');
    const { count: onlineCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('online', true);
    
    setStats({
      activeGroups: groupCount || 0,
      openHackathons: hackathonCount || 0,
      onlineMembers: onlineCount || 0,
      aiMatches: 3
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchGroups(), fetchStudents(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchGroups, fetchStudents, fetchStats]);

  // Handle Authentication Session
  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      try {
        // 1. Initial auth load
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        await handleSessionState(session);
      } catch (err) {
        console.error('Session init error:', err);
        if (mounted) {
          setUserState(null);
          setIsInitializingAuth(false);
        }
      }
    }

    async function handleSessionState(session) {
      if (!mounted) return;
      if (!session?.user) {
        setUserState(null);
        setIsInitializingAuth(false);
        return;
      }

      try {
        const authUser = session.user;
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        // A profile is only "complete" if it has essential details filled in.
        // We check for name, college, and skills.
        const isProfileComplete = !!(
          profileData?.name?.trim() && 
          profileData?.college?.trim() && 
          (profileData?.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0)
        );

        if (profileData && isProfileComplete) {
          // BUG-5 FIX: Set online=true on session init so dashboard stats work
          await supabase.from('profiles').update({ online: true }).eq('id', authUser.id);
          setUserState({ ...profileData, onboardingComplete: true, online: true });

          // Fetch unread notification count on login
          const { data: unreadData } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .eq('read', false);
          setUnreadNotificationCount(unreadData?.length ?? 0);
        } else {
          // Either no profile row, or profile exists but essential fields are missing → needs onboarding
          setUserState({ 
            ...(profileData || {}), 
            id: authUser.id, 
            email: authUser.email, 
            onboardingComplete: false 
          });
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setIsInitializingAuth(false);
      }
    }

    initializeSession();

    // 2. Continuous listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // BUG-9 FIX: Only handle SIGNED_IN if we have no current user state
      // This prevents re-fetching on tab focus / token refresh events
      if (event === 'SIGNED_IN' && !userRef.current) {
        handleSessionState(session);
      } else if (event === 'SIGNED_OUT') {
        setUserState(null);
        setIsInitializingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Apply theme class to <html> element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('theme-dark', 'theme-light');
    html.classList.add(`theme-${theme}`);
    localStorage.setItem('gs-theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const handleSetUser = async (userData) => {
    const userId = user?.id || userData.id;
    if (!userId) return;
    
    // Build a complete profile object for the initial upsert (onboarding).
    // Include ALL known profile fields so the upsert never strips dynamic
    // JSONB columns (bio, cgpa, social_links) that may have been added later.
    const profile = {
      id: userId,
      name: userData.name || userData.fullName,
      avatar: userData.avatar,
      skills: userData.skills || [],
      interests: userData.interests || [],
      faction: userData.faction,
      online: true,
      college: userData.college || '',
      course: userData.course || '',
      branch: userData.branch || '',
      year: userData.year || '',
      phone: userData.phone || '',
      email: user?.email || userData.email || '',
      // Dynamic/optional fields — preserve whatever was passed in
      bio: userData.bio || '',
      cgpa: userData.cgpa || null,
      dob: userData.dob || null,
      social_links: userData.social_links || userData.socialLinks || {}
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    // BUG-8 FIX: Return success/failure so callers can decide whether to navigate
    if (!error) {
      setUserState({ ...data, onboardingComplete: true });
      fetchStudents();
      return true;
    } else {
      console.error('Error saving profile:', error);
      showToast('Error saving profile. Please try again.', 'error');
      return false;
    }
  };

  const logout = async () => {
    if (user && user.onboardingComplete) {
      try {
        await supabase.from('profiles').update({ online: false }).eq('id', user.id);
      } catch (e) { /* ignore */ }
    }
    await supabase.auth.signOut();
    setUserState(null);
    showToast('Logged out successfully.', 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const checkAuth = async () => {
    setIsInitializingAuth(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        const authUser = data.session.user;
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const isProfileComplete = !!(
          profileData?.name?.trim() && 
          profileData?.college?.trim() && 
          (profileData?.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0)
        );

        if (profileData && isProfileComplete) {
          setUserState({ ...profileData, onboardingComplete: true });
        } else {
          setUserState({ 
            ...(profileData || {}), 
            id: authUser.id, 
            email: authUser.email, 
            onboardingComplete: false 
          });
        }
      } else {
        setUserState(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setIsInitializingAuth(false);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      // setUser: used only by onboarding — does a full profile upsert
      setUser: handleSetUser,
      // updateLocalUser: used by UserProfile for instant UI updates without
      // triggering a secondary DB write. Merges partial data into user state.
      updateLocalUser: mergeUserState,
      selectedGroupId, setSelectedGroupId,
      groups, setGroups,
      theme, setTheme,
      toast, showToast,
      logout,
      checkAuth,
      loading,
      isInitializingAuth,
      refreshGroups: fetchGroups,
      students,
      stats,
      refreshStats: fetchStats,
      factions: MOCK_FACTIONS,
      unreadNotificationCount,
      setUnreadCount: setUnreadNotificationCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

