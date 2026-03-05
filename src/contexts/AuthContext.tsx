import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type AppRole = "manager" | "auditor";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: { full_name: string } | null;
  role: AppRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const defaultValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  profile: null,
  role: null,
  loading: true,
  login: async () => ({}),
  signup: async () => ({}),
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).single(),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (roleRes.data) setRole(roleRes.data.role as AppRole);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (email: string, password: string, fullName: string, selectedRole: AppRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };

    // Assign role
    if (data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: selectedRole });
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, profile, role, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
