import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { MOCK_PROFILES } from '../data/mockData';

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  activeProfile: UserProfile;
  hasSelectedProfile: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<AuthResponse>;
  signup: (name: string, email: string, password?: string) => Promise<AuthResponse>;
  logout: () => void;
  resetPassword: (email: string) => Promise<AuthResponse>;
  selectProfile: (profileId: string) => void;
  addProfile: (name: string, avatar: string, isKids: boolean) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  deleteProfile: (profileId: string) => void;
  toggleAdminRole: () => void;
  demoLogin: (asAdmin?: boolean) => Promise<void>;
}

const DEFAULT_USER: User = {
  id: 'u-demo-1',
  email: 'alex.sterling@streamflix.io',
  name: 'Alex Sterling',
  avatar: MOCK_PROFILES[0].avatar,
  role: 'user',
  profiles: MOCK_PROFILES,
  activeProfileId: 'p1'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasSelectedProfile, setHasSelectedProfile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on mount from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('streamflix_auth_user');
      const savedProfileChosen = localStorage.getItem('streamflix_profile_chosen');

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setHasSelectedProfile(savedProfileChosen === 'true');
      } else {
        // If first time visit or no user saved, start unauthenticated
        setUser(null);
        setHasSelectedProfile(false);
      }
    } catch {
      setUser(null);
      setHasSelectedProfile(false);
    } finally {
      // Simulate rapid instant session hydration
      setIsLoading(false);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('streamflix_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('streamflix_auth_user');
      localStorage.removeItem('streamflix_profile_chosen');
    }
  }, [user]);

  useEffect(() => {
    if (hasSelectedProfile) {
      localStorage.setItem('streamflix_profile_chosen', 'true');
    } else {
      localStorage.removeItem('streamflix_profile_chosen');
    }
  }, [hasSelectedProfile]);

  const activeProfile =
    user?.profiles.find(p => p.id === user.activeProfileId) ||
    user?.profiles[0] ||
    MOCK_PROFILES[0];

  const login = async (email: string, password = '', _rememberMe = true): Promise<AuthResponse> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 450)); // Realistic latency

    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (password && password.length < 4) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    // Check if user was registered locally or create new session
    const registeredUsersStr = localStorage.getItem('streamflix_registered_accounts');
    let registeredUsers: User[] = [];
    if (registeredUsersStr) {
      try {
        registeredUsers = JSON.parse(registeredUsersStr);
      } catch {
        registeredUsers = [];
      }
    }

    const existingUser = registeredUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    const loggedInUser: User = existingUser || {
      id: `u-${Date.now()}`,
      email: email.trim(),
      name: email.split('@')[0].replace(/[._-]/g, ' '),
      avatar: MOCK_PROFILES[0].avatar,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      profiles: MOCK_PROFILES,
      activeProfileId: 'p1'
    };

    setUser(loggedInUser);
    setHasSelectedProfile(false); // Force profile selection page on fresh login as requested
    setIsLoading(false);

    return { success: true };
  };

  const signup = async (name: string, email: string, password = ''): Promise<AuthResponse> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 450));

    if (!name.trim()) {
      setIsLoading(false);
      return { success: false, error: 'Please enter your name.' };
    }

    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const registeredUsersStr = localStorage.getItem('streamflix_registered_accounts');
    let registeredUsers: User[] = [];
    if (registeredUsersStr) {
      try {
        registeredUsers = JSON.parse(registeredUsersStr);
      } catch {
        registeredUsers = [];
      }
    }

    const exists = registeredUsers.some(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (exists) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const mainProfileId = `p-${Date.now()}-1`;
    const kidsProfileId = `p-${Date.now()}-2`;

    const newUser: User = {
      id: `u-${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      avatar: MOCK_PROFILES[0].avatar,
      role: 'user',
      profiles: [
        {
          id: mainProfileId,
          name: name.trim(),
          avatar: MOCK_PROFILES[0].avatar,
          isKids: false,
          preferredLang: 'en'
        },
        {
          id: kidsProfileId,
          name: 'Kids Club',
          avatar: MOCK_PROFILES[1].avatar,
          isKids: true,
          preferredLang: 'en'
        }
      ],
      activeProfileId: mainProfileId
    };

    registeredUsers.push(newUser);
    localStorage.setItem('streamflix_registered_accounts', JSON.stringify(registeredUsers));

    setUser(newUser);
    setHasSelectedProfile(false);
    setIsLoading(false);

    return { success: true };
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setIsLoading(false);

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setHasSelectedProfile(false);
    localStorage.removeItem('streamflix_auth_user');
    localStorage.removeItem('streamflix_profile_chosen');
  };

  const selectProfile = (profileId: string) => {
    if (!user) return;
    const found = user.profiles.find(p => p.id === profileId);
    if (found) {
      setUser({ ...user, activeProfileId: profileId });
      setHasSelectedProfile(true);
    }
  };

  const addProfile = (name: string, avatar: string, isKids: boolean) => {
    if (!user) return;
    const newProfile: UserProfile = {
      id: `p-${Date.now()}`,
      name: name.trim() || 'New Profile',
      avatar: avatar || MOCK_PROFILES[2].avatar,
      isKids,
      preferredLang: 'en'
    };

    const updated = {
      ...user,
      profiles: [...user.profiles, newProfile]
    };
    setUser(updated);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedProfiles = user.profiles.map(p => {
      if (p.id === user.activeProfileId) {
        return { ...p, ...updates };
      }
      return p;
    });
    setUser({ ...user, profiles: updatedProfiles });
  };

  const deleteProfile = (profileId: string) => {
    if (!user || user.profiles.length <= 1) return;
    const updatedProfiles = user.profiles.filter(p => p.id !== profileId);
    const newActiveId =
      user.activeProfileId === profileId ? updatedProfiles[0].id : user.activeProfileId;

    setUser({
      ...user,
      profiles: updatedProfiles,
      activeProfileId: newActiveId
    });
  };

  const toggleAdminRole = () => {
    if (!user) return;
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    setUser({ ...user, role: nextRole });
  };

  const demoLogin = async (asAdmin = false) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const demoUser: User = {
      ...DEFAULT_USER,
      role: asAdmin ? 'admin' : 'user',
      email: asAdmin ? 'admin@streamflix.io' : 'alex.sterling@streamflix.io',
      name: asAdmin ? 'Admin Executive' : 'Alex Sterling'
    };
    setUser(demoUser);
    setHasSelectedProfile(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeProfile,
        hasSelectedProfile,
        isAuthenticated: Boolean(user),
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        resetPassword,
        selectProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        toggleAdminRole,
        demoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
