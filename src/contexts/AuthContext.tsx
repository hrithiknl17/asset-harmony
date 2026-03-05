import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type AppRole = "manager" | "auditor";

interface DummyUser {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: DummyUser | null;
  profile: { full_name: string } | null;
  role: AppRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const DUMMY_USERS = [
  { email: "manager@assettrack.com", password: "manager123", id: "mgr-001", name: "Hrithik (Manager)", role: "manager" as AppRole },
  { email: "auditor@assettrack.com", password: "auditor123", id: "aud-001", name: "Lakkanna (Auditor)", role: "auditor" as AppRole },
];

const defaultValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  profile: null,
  role: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DummyUser | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("dummy_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      const match = DUMMY_USERS.find(u => u.id === parsed.id);
      if (match) {
        setUser({ id: match.id, email: match.email });
        setProfile({ full_name: match.name });
        setRole(match.role);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const match = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (!match) return { error: "Invalid email or password" };
    setUser({ id: match.id, email: match.email });
    setProfile({ full_name: match.name });
    setRole(match.role);
    localStorage.setItem("dummy_user", JSON.stringify({ id: match.id }));
    return {};
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    setRole(null);
    localStorage.removeItem("dummy_user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, profile, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
